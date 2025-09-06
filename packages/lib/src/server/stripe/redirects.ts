import { GenericActionCtx, httpActionGeneric } from "convex/server";

import { billingDispatchTyped } from "../operations/helpers";
import { BillingDataModel } from "../schema";
import { InternalConfiguration } from "../types";
import { syncSubscriptionImplementation } from "./sync/subscription";

export const RETURN_ORIGINS = {
  portal: "portal",
  checkoutSuccess: "checkout-success",
  checkoutCancel: "checkout-cancel",
  checkoutReturn: "checkout-return",
} as const;
export type ReturnOrigin = (typeof RETURN_ORIGINS)[keyof typeof RETURN_ORIGINS];

export function backendBaseUrl(configuration: InternalConfiguration): string {
  return process.env.CONVEX_SITE_URL!;
}

export function toBase64Url(input: ArrayBuffer | string): string {
  const buffer =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);

  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
  const padded = b64 + "=".repeat(padding);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function signData(
  secret: string,
  data: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  // Import the secret as a CryptoKey
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return await crypto.subtle.sign("HMAC", key, messageData);
}

export async function timingSafeEqual(
  a: ArrayBufferLike,
  b: ArrayBufferLike
): Promise<boolean> {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  const aArray = new Uint8Array(a);
  const bArray = new Uint8Array(b);

  let result = 0;
  for (let i = 0; i < aArray.length; i++) {
    result |= aArray[i] ^ bArray[i];
  }

  return result === 0;
}

export interface ReturnPayloadV1 {
  v: 1;
  origin: ReturnOrigin;
  entityId: string;
  exp: number;
  targetUrl: string;
}

export async function buildSignedReturnUrl(
  configuration: InternalConfiguration,
  origin: ReturnOrigin,
  entityId: string,
  targetUrl: string,
  ttlMs = 15 * 60 * 1000
): Promise<string> {
  const payload: ReturnPayloadV1 = {
    v: 1,
    origin,
    entityId,
    targetUrl,
    exp: Date.now() + ttlMs,
  };
  const data = toBase64Url(JSON.stringify(payload));
  const expected = await signData(configuration.stripe.webhook_secret, data);
  const signature = toBase64Url(expected);
  const base = `${backendBaseUrl(configuration)}/stripe/return/${origin}`;

  const url = new URL(base);

  url.searchParams.set("data", data);
  url.searchParams.set("signature", signature);

  return url.toString();
}

export const buildRedirectImplementation = (
  configuration: InternalConfiguration
) =>
  httpActionGeneric(async (context_, request) => {
    const context = context_ as unknown as GenericActionCtx<BillingDataModel>;
    const url = new URL(request.url);

    const segments = url.pathname.split("/").filter(Boolean);
    const originSeg = segments[segments.length - 1];

    const validOrigins = new Set<ReturnOrigin>([
      "portal",
      "checkout-success",
      "checkout-cancel",
      "checkout-return",
    ]);

    if (!originSeg || !validOrigins.has(originSeg as ReturnOrigin)) {
      return new Response("Invalid return origin", { status: 400 });
    }
    const origin = originSeg as ReturnOrigin;

    const data = url.searchParams.get("data");
    const signature = url.searchParams.get("signature");

    if (!data || !signature) {
      return new Response("Missing signature", { status: 400 });
    }

    let decoded: {
      v: number;
      origin: string;
      entityId: string;
      exp: number;
      targetUrl: string;
    };
    try {
      const expected = await signData(
        configuration.stripe.webhook_secret,
        data
      );
      const provided = fromBase64Url(signature);

      if (provided.byteLength !== expected.byteLength) {
        return new Response("Invalid signature", { status: 400 });
      }

      const isValid = await timingSafeEqual(provided.buffer, expected);
      if (!isValid) {
        return new Response("Invalid signature", { status: 400 });
      }

      const decodedBytes = fromBase64Url(data);
      const decoder = new TextDecoder();
      decoded = JSON.parse(decoder.decode(decodedBytes));
    } catch {
      return new Response("Invalid token", { status: 400 });
    }

    if (decoded.origin !== origin) {
      return new Response("Origin mismatch", { status: 400 });
    }
    if (typeof decoded.entityId !== "string") {
      return new Response("Invalid payload", { status: 400 });
    }
    if (!decoded.exp || Date.now() > decoded.exp) {
      return new Response("Link expired", { status: 400 });
    }

    if (
      typeof decoded.targetUrl !== "string" ||
      decoded.targetUrl.length === 0
    ) {
      return new Response("Invalid target", { status: 400 });
    }

    const stripeCustomer = await billingDispatchTyped(
      {
        op: "selectOne",
        table: "convex_billing_customers",
        field: "entityId",
        value: decoded.entityId,
      },
      context,
      configuration
    );

    const customerId = stripeCustomer?.doc?.customerId || null;

    if (customerId) {
      await syncSubscriptionImplementation.handler(
        context,
        { customerId },
        configuration
      );
    } else {
      configuration.logger.warn(
        "Potential redirect abuse detected. No customerId associated with provided entityId " +
          decoded.entityId
      );
    }

    const targetUrl = decoded.targetUrl;

    return new Response(null, {
      status: 302,
      headers: {
        Location: targetUrl,
        "Cache-Control": "no-store",
      },
    });
  });
