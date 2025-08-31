import { httpActionGeneric } from "convex/server";
import { createHmac, timingSafeEqual } from "crypto";

import { InternalConfiguration } from "../helpers";
import { syncImplementation } from "./sync";

export const RETURN_ORIGINS = {
  portal: "portal",
  checkoutSuccess: "checkout-success",
  checkoutCancel: "checkout-cancel",
  checkoutReturn: "checkout-return",
} as const;
export type ReturnOrigin = (typeof RETURN_ORIGINS)[keyof typeof RETURN_ORIGINS];

export function backendBaseUrl(configuration: InternalConfiguration): string {
  return `https://${configuration.convex.projectId}.convex.site`;
}

export function toBase64Url(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function fromBase64Url(input: string): Buffer {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
  return Buffer.from(b64 + "=".repeat(padding), "base64");
}

export function signData(secret: string, data: string): Buffer {
  return createHmac("sha256", secret).update(data).digest();
}

export interface ReturnPayloadV1 {
  v: 1;
  origin: ReturnOrigin;
  entityId: string;
  exp: number;
  targetUrl: string;
}

export function buildSignedReturnUrl(
  configuration: InternalConfiguration,
  origin: ReturnOrigin,
  entityId: string,
  targetUrl: string,
  ttlMs = 15 * 60 * 1000
): string {
  const payload: ReturnPayloadV1 = {
    v: 1,
    origin,
    entityId,
    targetUrl,
    exp: Date.now() + ttlMs,
  };
  const data = toBase64Url(JSON.stringify(payload));
  const expected = signData(configuration.stripe.webhook_secret, data);
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
  httpActionGeneric(async (context, request) => {
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
      const expected = signData(configuration.stripe.webhook_secret, data);
      const provided = fromBase64Url(signature);

      if (provided.length !== expected.length) {
        return new Response("Invalid signature", { status: 400 });
      }
      if (!timingSafeEqual(provided, expected)) {
        return new Response("Invalid signature", { status: 400 });
      }
      decoded = JSON.parse(fromBase64Url(data).toString("utf8"));
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

    const stripeCustomerId =
      await configuration.persistence.getStripeCustomerIdByEntityId(
        context,
        decoded.entityId
      );

    // TODO: we should probably alert if there is no customerId
    // TODO: should we create one ? it should be impossible to be here without one i guess
    if (stripeCustomerId) {
      await syncImplementation(context, { stripeCustomerId }, configuration);
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
