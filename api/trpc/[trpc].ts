import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { initDatabase } from "../../server/storage";

let initialized = false;

async function ensureDb() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDb();
  } catch (err: any) {
    console.error("[DB Init Error]", err?.message ?? err);
    res.status(500).json({ error: "Database initialization failed", detail: String(err) });
    return;
  }

  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host || "localhost";
  const url = `${proto}://${host}${req.url}`;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers[key] = Array.isArray(value) ? value.join(", ") : (value as string);
    }
  }

  const fetchReq = new Request(url, { method: req.method, headers, body });

  let response: Response;
  try {
    response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: fetchReq,
      router: appRouter,
      createContext: async () => ({ req, res, user: null }),
      onError({ error, path }) {
        console.error(`[tRPC] ${path ?? "unknown"}:`, error.message);
      },
    });
  } catch (err: any) {
    console.error("[tRPC Handler Error]", err?.message ?? err);
    res.status(500).json({ error: "Handler error", detail: String(err) });
    return;
  }

  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "transfer-encoding") res.setHeader(key, value);
  });
  res.send(await response.text());
}
