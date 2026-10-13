import { createHash, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type RequestHandler } from "express";
import { db, agentConfigTable } from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetAdminSessionResponse,
  GetAgentConfigResponse,
  UpdateAgentConfigBody,
  UpdateAgentConfigResponse,
} from "@workspace/api-zod";
import { readAgentConfig } from "../lib/agent-config";

const router: IRouter = Router();
const ADMIN_COOKIE = "ag_agent_admin";
const ADMIN_COOKIE_PATH = "/api/admin";
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 6;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isAdminConfigured() {
  return Boolean(process.env.AGENT_ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

function requestIsSameOrigin(req: Request) {
  const origin = req.get("origin");
  const host = req.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function passwordMatches(candidate: string, expected: string) {
  const candidateDigest = createHash("sha256").update(candidate).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

function sessionIsValid(req: Request) {
  const value = req.signedCookies?.[ADMIN_COOKIE];
  if (typeof value !== "string") return false;
  const [version, expiresAt, extra] = value.split(":");
  const expiry = Number(expiresAt);
  return version === "v1" && extra === undefined && Number.isSafeInteger(expiry) && expiry > Date.now();
}

function takeLoginAttempt(req: Request) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const existing = loginAttempts.get(key);
  const attempt =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + LOGIN_WINDOW_MS };

  if (loginAttempts.size > 1000) {
    for (const [address, value] of loginAttempts) {
      if (value.resetAt <= now) loginAttempts.delete(address);
    }
  }

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((attempt.resetAt - now) / 1000)) };
  }

  attempt.count += 1;
  loginAttempts.set(key, attempt);
  return { allowed: true, retryAfter: 0 };
}

const requireAdmin: RequestHandler = (req, res, next) => {
  if (!isAdminConfigured()) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }
  if (!sessionIsValid(req)) {
    res.status(401).json({ error: "Sign in to manage the assistant." });
    return;
  }
  next();
};

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: ADMIN_COOKIE_PATH,
};

router.get("/admin/session", (req, res) => {
  res.json(
    GetAdminSessionResponse.parse({
      configured: isAdminConfigured(),
      authenticated: isAdminConfigured() && sessionIsValid(req),
    }),
  );
});

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter your admin passphrase." });
    return;
  }
  if (!requestIsSameOrigin(req)) {
    res.status(403).json({ error: "This sign-in request could not be verified." });
    return;
  }
  if (!isAdminConfigured()) {
    res.status(503).json({ error: "Admin access is not configured." });
    return;
  }

  const limit = takeLoginAttempt(req);
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    res.status(429).json({ error: "Too many attempts. Wait a little before trying again." });
    return;
  }

  if (!passwordMatches(parsed.data.passphrase, process.env.AGENT_ADMIN_PASSWORD!)) {
    res.status(401).json({ error: "That passphrase did not unlock the front desk." });
    return;
  }

  loginAttempts.delete(req.ip || req.socket.remoteAddress || "unknown");
  const expiresAt = Date.now() + ADMIN_SESSION_MS;
  res.cookie(ADMIN_COOKIE, `v1:${expiresAt}`, {
    ...sessionCookieOptions,
    signed: true,
    maxAge: ADMIN_SESSION_MS,
  });
  res.json(AdminLoginResponse.parse({ configured: true, authenticated: true }));
});

router.post("/admin/logout", (req, res) => {
  if (!requestIsSameOrigin(req)) {
    res.status(403).json({ error: "This sign-out request could not be verified." });
    return;
  }
  res.clearCookie(ADMIN_COOKIE, sessionCookieOptions);
  res.json(
    AdminLogoutResponse.parse({
      configured: isAdminConfigured(),
      authenticated: false,
    }),
  );
});

router.get("/admin/agent-config", requireAdmin, async (req, res): Promise<void> => {
  try {
    const config = await readAgentConfig();
    res.json(GetAgentConfigResponse.parse(config));
  } catch (error) {
    req.log.error({ error }, "Could not read assistant configuration");
    res.status(503).json({ error: "The assistant settings are temporarily unavailable." });
  }
});

router.put("/admin/agent-config", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAgentConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!requestIsSameOrigin(req)) {
    res.status(403).json({ error: "This settings change could not be verified." });
    return;
  }

  const values = {
    persona: parsed.data.persona.trim(),
    tone: parsed.data.tone.trim(),
    empathy: parsed.data.empathy,
    goalOrientation: parsed.data.goalOrientation,
  };
  if (!values.persona || !values.tone) {
    res.status(400).json({ error: "Persona and tone cannot be blank." });
    return;
  }

  try {
    const [saved] = await db
      .insert(agentConfigTable)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({
        target: agentConfigTable.id,
        set: { ...values, updatedAt: new Date() },
      })
      .returning();
    res.json(UpdateAgentConfigResponse.parse(saved));
  } catch (error) {
    req.log.error({ error }, "Could not save assistant configuration");
    res.status(503).json({ error: "The assistant settings could not be saved. Try again." });
  }
});

export default router;
