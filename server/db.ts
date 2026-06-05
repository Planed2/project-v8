/**
 * db.ts — Camada de compatibilidade.
 * O sistema usa armazenamento em memória (storage.ts).
 * Este arquivo existe apenas para compatibilidade com oauth.ts e sdk.ts
 * que fazem upsertUser/getUserByOpenId para o sistema de OAuth do Manus.
 */

// Usuários OAuth (Manus) — mantidos em memória separada
interface OAuthUser {
  id: number;
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const oauthUsers: OAuthUser[] = [];
let nextUserId = 1;

export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin";
  lastSignedIn?: Date;
}): Promise<void> {
  const existing = oauthUsers.find((u) => u.openId === user.openId);
  if (existing) {
    if (user.name !== undefined) existing.name = user.name;
    if (user.email !== undefined) existing.email = user.email;
    if (user.loginMethod !== undefined) existing.loginMethod = user.loginMethod;
    if (user.role !== undefined) existing.role = user.role;
    existing.lastSignedIn = user.lastSignedIn || new Date();
    existing.updatedAt = new Date();
  } else {
    oauthUsers.push({
      id: nextUserId++,
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      role: user.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn || new Date(),
    });
  }
}

export async function getUserByOpenId(openId: string): Promise<OAuthUser | undefined> {
  return oauthUsers.find((u) => u.openId === openId);
}

// Re-exportar tudo do storage para compatibilidade
export * from "./storage";
