/**
 * Webhook Adapters for Express, Fastify, Node.js HTTP, and Web Standards Fetch (Next.js / Cloudflare / Hono).
 *
 * @packageDocumentation
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Application } from "./app.js";
import { isSecretTokenValid, MAX_WEBHOOK_BODY_BYTES } from "./webhook.js";

/**
 * Options for configuring framework webhook adapters.
 */
export interface WebhookCallbackOptions {
  /**
   * Secret token to validate against the `X-Telegram-Bot-Api-Secret-Token` header.
   */
  secret_token?: string;
  /**
   * Maximum allowed request body size in bytes.
   * @defaultValue 5242880 (5MB)
   */
  maxBodyBytes?: number;
}

/**
 * Supported web framework identifiers.
 */
export type WebhookFramework = "express" | "fastify" | "std/http" | "http" | "fetch" | "nextjs";

/**
 * Web standard Request handler signature (Next.js App Router, Hono, Cloudflare Workers, Deno, Bun).
 */
export type FetchWebhookHandler = (request: Request) => Promise<Response>;

/**
 * Express / Connect middleware handler signature.
 */
export type ExpressWebhookHandler = (
  req: { headers: Record<string, string | string[] | undefined>; body?: unknown },
  res: { status: (code: number) => { send: (body?: string) => void; end: () => void } },
  next?: (err?: unknown) => void,
) => Promise<void>;

/**
 * Fastify route handler signature.
 */
export type FastifyWebhookHandler = (
  req: { headers: Record<string, string | string[] | undefined>; body?: unknown },
  reply: { status: (code: number) => { send: (body?: string) => void } },
) => Promise<void>;

/**
 * Node.js native `http` server request listener.
 */
export type HttpWebhookHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

function extractHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const value = headers[name.toLowerCase()] ?? headers[name];
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Creates an Express / Connect compatible middleware for receiving Telegram webhook updates.
 *
 * @param app - The {@link Application} instance.
 * @param options - Webhook configuration options.
 * @returns Express middleware function.
 *
 * @example
 * ```ts
 * import express from "express";
 * import { createExpressWebhook } from "telebot-ts";
 *
 * const server = express();
 * server.use(express.json());
 * server.post("/webhook", createExpressWebhook(app, { secret_token: "secret123" }));
 * ```
 */
export function createExpressWebhook(
  app: Application,
  options: WebhookCallbackOptions = {},
): ExpressWebhookHandler {
  return async (req, res) => {
    if (options.secret_token) {
      const receivedToken = extractHeader(req.headers, "x-telegram-bot-api-secret-token");
      if (!receivedToken || !isSecretTokenValid(receivedToken, options.secret_token)) {
        res.status(401).send("Unauthorized");
        return;
      }
    }

    if (req.body && typeof req.body === "object") {
      await app.processUpdate(req.body as Record<string, unknown>);
      res.status(200).send("OK");
      return;
    }

    res.status(400).send("Bad Request: Missing JSON body");
  };
}

/**
 * Creates a Fastify compatible route handler for receiving Telegram webhook updates.
 *
 * @param app - The {@link Application} instance.
 * @param options - Webhook configuration options.
 * @returns Fastify route handler function.
 *
 * @example
 * ```ts
 * fastify.post("/webhook", createFastifyWebhook(app, { secret_token: "secret123" }));
 * ```
 */
export function createFastifyWebhook(
  app: Application,
  options: WebhookCallbackOptions = {},
): FastifyWebhookHandler {
  return async (req, reply) => {
    if (options.secret_token) {
      const receivedToken = extractHeader(req.headers, "x-telegram-bot-api-secret-token");
      if (!receivedToken || !isSecretTokenValid(receivedToken, options.secret_token)) {
        reply.status(401).send("Unauthorized");
        return;
      }
    }

    if (req.body && typeof req.body === "object") {
      await app.processUpdate(req.body as Record<string, unknown>);
      reply.status(200).send("OK");
      return;
    }

    reply.status(400).send("Bad Request: Missing JSON body");
  };
}

/**
 * Creates a Web Standards `fetch` handler for Next.js App Router, Cloudflare Workers, Hono, Deno, and Bun.
 *
 * @param app - The {@link Application} instance.
 * @param options - Webhook configuration options.
 * @returns Standard fetch handler function `(request: Request) => Promise<Response>`.
 *
 * @example
 * ```ts
 * // app/api/webhook/route.ts (Next.js App Router)
 * import { createFetchWebhook } from "telebot-ts";
 * export const POST = createFetchWebhook(app, { secret_token: process.env.WEBHOOK_SECRET });
 * ```
 */
export function createFetchWebhook(
  app: Application,
  options: WebhookCallbackOptions = {},
): FetchWebhookHandler {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (options.secret_token) {
      const receivedToken = request.headers.get("x-telegram-bot-api-secret-token");
      if (!receivedToken || !isSecretTokenValid(receivedToken, options.secret_token)) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    try {
      const body = await request.json();
      if (!body || typeof body !== "object") {
        return new Response("Bad Request", { status: 400 });
      }

      await app.processUpdate(body as Record<string, unknown>);
      return new Response("OK", { status: 200 });
    } catch {
      return new Response("Bad Request: Invalid JSON", { status: 400 });
    }
  };
}

/**
 * Creates a standard Node.js `http` request listener.
 *
 * @param app - The {@link Application} instance.
 * @param options - Webhook configuration options.
 * @returns Standard `(req, res) => Promise<void>` listener.
 */
export function createHttpWebhook(
  app: Application,
  options: WebhookCallbackOptions = {},
): HttpWebhookHandler {
  const maxBytes = options.maxBodyBytes ?? MAX_WEBHOOK_BODY_BYTES;

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }

    if (options.secret_token) {
      const receivedToken = extractHeader(
        req.headers as Record<string, string | undefined>,
        "x-telegram-bot-api-secret-token",
      );
      if (!receivedToken || !isSecretTokenValid(receivedToken, options.secret_token)) {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Unauthorized");
        return;
      }
    }

    const chunks: Buffer[] = [];
    let receivedBytes = 0;

    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      receivedBytes += buf.length;

      if (receivedBytes > maxBytes) {
        res.writeHead(413, { "Content-Type": "text/plain" });
        res.end("Payload Too Large");
        return;
      }
      chunks.push(buf);
    }

    try {
      const bodyText = Buffer.concat(chunks).toString("utf-8");
      const parsed = JSON.parse(bodyText);
      await app.processUpdate(parsed);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: Malformed JSON");
    }
  };
}

/**
 * Universal webhook callback builder supporting Express, Fastify, Fetch (Next.js), and Node.js `http`.
 *
 * @param app - The {@link Application} instance.
 * @param framework - The target web framework (default: `"express"`).
 * @param options - Webhook configuration options.
 * @returns Framework-specific webhook callback handler.
 *
 * @example
 * ```ts
 * // Express
 * app.use("/webhook", webhookCallback(botApp, "express"));
 *
 * // Next.js App Router (app/api/webhook/route.ts)
 * export const POST = webhookCallback(botApp, "nextjs");
 * ```
 */
export function webhookCallback(
  app: Application,
  framework: WebhookFramework = "express",
  options: WebhookCallbackOptions = {},
): any {
  switch (framework) {
    case "express":
      return createExpressWebhook(app, options);
    case "fastify":
      return createFastifyWebhook(app, options);
    case "fetch":
    case "nextjs":
      return createFetchWebhook(app, options);
    case "std/http":
    case "http":
      return createHttpWebhook(app, options);
    default:
      throw new Error(`Unsupported framework adapter: ${framework}`);
  }
}
