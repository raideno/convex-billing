import { GenericActionCtx } from "convex/server";

import { StripeDataModel } from "@/schema";
import { InferArgs, InternalConfiguration } from "@/types";

import { PayReturnImplementation } from "./pay";
import { PortalReturnImplementation } from "./portal";
import { SubscribeReturnImplementation } from "./subscribe";
import { RedirectHandler } from "./types";

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

export interface ReturnPayload<T> {
  origin: ReturnOrigin;
  data?: T;
  exp: number;
  targetUrl: string;
}

export async function buildSignedReturnUrl<O extends ReturnOrigin>({
  configuration,
  origin,
  targetUrl,
  data,
}: {
  configuration: InternalConfiguration;
  origin: O;
  targetUrl: string;
  data: ReturnDataMap[O];
}): Promise<string> {
  const payload: ReturnPayload<ReturnDataMap[O]> = {
    origin,
    data,
    targetUrl,
    exp: Date.now() + configuration.redirectTtlMs,
  };

  const data_ = toBase64Url(JSON.stringify(payload));
  const expected = await signData(configuration.stripe.webhook_secret, data_);
  const signature = toBase64Url(expected);

  const base = `${backendBaseUrl(configuration)}/stripe/return/${origin}`;

  const url = new URL(base);
  url.searchParams.set("data", data_);
  url.searchParams.set("signature", signature);

  return url.toString();
}

export async function decodeSignedPayload<O extends ReturnOrigin>({
  secret,
  data,
  signature,
}: {
  origin: O;
  secret: string;
  data: string;
  signature: string;
}): Promise<{
  error?: string;
  data?: ReturnPayload<ReturnDataMap[O]>;
}> {
  try {
    const expected = await signData(secret, data);
    const provided = fromBase64Url(signature);

    if (provided.byteLength !== expected.byteLength) {
      return { error: "Invalid signature length" };
    }

    const isValid = await timingSafeEqual(provided.buffer, expected);
    if (!isValid) {
      return { error: "Invalid signature" };
    }

    const decodedBytes = fromBase64Url(data);
    const decoder = new TextDecoder();
    const decodedPayload = JSON.parse(
      decoder.decode(decodedBytes)
    ) as ReturnPayload<ReturnDataMap[O]>;

    return { data: decodedPayload };
  } catch (err) {
    return { error: "Invalid token" };
  }
}

// NOTE: multiple handlers with the same origin are not supported yet
export const REDIRECT_HANDLERS = [
  PortalReturnImplementation,
  SubscribeReturnImplementation,
  PayReturnImplementation,
] as const;

// const _ = compileTime(() => {
//   console.log();

//   const origins = REDIRECT_HANDLERS.map((handler) => new Set(handler.origins));

//   const intersections: Array<[number, number]> = [];

//   for (let i = 0; i < origins.length; i++) {
//     for (let j = i + 1; j < origins.length; j++) {
//       const hasOverlap = [...origins[i]].some((origin) =>
//         origins[j].has(origin)
//       );

//       if (hasOverlap) {
//         intersections.push([i, j]);
//       }
//     }
//   }

//   if (intersections.length > 0) {
//     intersections.forEach(([i, j]) => {
//       console.log(
//         `Error: Redirect handlers at index ${i} and ${j} have overlapping origins.`
//       );
//     });
//     throw new Error("Redirect handlers have overlapping origins");
//   }

//   return true;
// });

type AllRedirectHandlers = (typeof REDIRECT_HANDLERS)[number];

type ReturnDataMap = {
  [H in AllRedirectHandlers as H["origins"][number]]: H extends RedirectHandler<
    any,
    infer S
  >
    ? InferArgs<S>
    : never;
};

export const RETURN_ORIGINS = REDIRECT_HANDLERS.map(
  (handler) => handler.origins
).flat();

export type ReturnOrigin = (typeof RETURN_ORIGINS)[number];

export const redirectImplementation = async (
  configuration: InternalConfiguration,
  context: GenericActionCtx<StripeDataModel>,
  request: Request
) => {
  const url = new URL(request.url);

  const segments = url.pathname.split("/").filter(Boolean);

  const origin_ = segments[segments.length - 1];

  if (
    !origin_ ||
    !REDIRECT_HANDLERS.map((handler) => handler.origins)
      .flat()
      .includes(origin_ as ReturnOrigin)
  ) {
    return new Response("Invalid return origin", { status: 400 });
  }

  const origin = origin_ as ReturnOrigin;

  const data = url.searchParams.get("data");
  const signature = url.searchParams.get("signature");

  if (!data || !signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const response = await decodeSignedPayload({
    origin,
    secret: configuration.stripe.webhook_secret,
    data,
    signature,
  });

  if (response.error) {
    return new Response(response.error, { status: 400 });
  }

  const decoded = response.data!;

  if (decoded.origin !== origin) {
    return new Response("Origin mismatch", { status: 400 });
  }

  if (!decoded.exp || Date.now() > decoded.exp) {
    return new Response("Link expired", { status: 400 });
  }

  if (typeof decoded.targetUrl !== "string" || decoded.targetUrl.length === 0) {
    return new Response("Invalid target", { status: 400 });
  }

  for (const handler of REDIRECT_HANDLERS) {
    if (handler.origins.includes(origin as never)) {
      try {
        await handler.handle(
          origin as never,
          context,
          decoded.data as never,
          configuration
        );
      } catch (error) {
        configuration.logger.error(
          `[STRIPE RETURN ${origin}](Error): ${error}`
        );
      }
      return new Response(null, {
        status: 302,
        headers: { Location: decoded.targetUrl },
      });
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: decoded.targetUrl },
  });
};
