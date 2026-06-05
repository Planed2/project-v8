/**
 * storage.ts — Persistência via libsql (@libsql/client)
 *
 * Em produção (Vercel + Turso):
 *   TURSO_DATABASE_URL=libsql://xxx.turso.io
 *   TURSO_AUTH_TOKEN=eyJ...
 *
 * Em desenvolvimento local (sem variáveis):
 *   Usa SQLite local em arquivo: data/app.db
 */

import { createClient, type Client } from "@libsql/client";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

let db: Client;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    // Produção: Turso na nuvem
    db = createClient({ url: tursoUrl, authToken: tursoToken });
    console.log("[DB] Conectado ao Turso:", tursoUrl);
  } else {
    // Desenvolvimento: SQLite local
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    const dbFile = join(dataDir, "app.db");
    db = createClient({ url: `file:${dbFile}` });
    console.log("[DB] SQLite local:", dbFile);
  }

  await createTables();
  await seedAdminCode();
}

async function createTables(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS access_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      tipo TEXT NOT NULL,
      email TEXT,
      nome TEXT,
      usado INTEGER NOT NULL DEFAULT 0,
      bloqueado INTEGER NOT NULL DEFAULT 0,
      school_id INTEGER,
      coordinator_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );
    CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code_id INTEGER NOT NULL,
      coordinator_name TEXT,
      school_name TEXT,
      logged_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS classrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS occurrences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classroom_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      infrequency_type TEXT NOT NULL,
      month TEXT NOT NULL,
      violation_of_rights INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS coordinators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      selected_classrooms TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

async function seedAdminCode(): Promise<void> {
  const res = await db.execute("SELECT id FROM access_codes WHERE code = 'admin2026' LIMIT 1");
  if (res.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO access_codes (code, tipo, nome, usado, bloqueado) VALUES (?, ?, ?, 1, 0)",
      args: ["admin2026", "sec", "Administrador"],
    });
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TipoAcesso = "sec" | "coordenador";

export interface AccessCode {
  id: number; code: string; tipo: TipoAcesso;
  email?: string; nome?: string; usado: boolean; bloqueado: boolean;
  schoolId?: number; coordinatorId?: number; createdAt: string; lastLoginAt?: string;
}

export interface LoginHistory {
  id: number; codeId: number; coordinatorName?: string; schoolName?: string; loggedAt: string;
}

export interface School { id: number; name: string; createdAt: string; }
export interface Classroom { id: number; schoolId: number; name: string; createdAt: string; }
export interface Occurrence {
  id: number; classroomId: number; studentName: string;
  infrequencyType: "5_consecutive" | "10_alternated";
  month: string; violationOfRights: boolean; createdAt: string;
}
export interface Coordinator {
  id: number; schoolId: number; name: string; selectedClassrooms?: string; createdAt: string;
}
export interface OccurrenceEnriched extends Occurrence {
  classroomName: string; schoolName: string; schoolId: number; coordinatorName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rowToAccessCode(row: Record<string, any>): AccessCode {
  return {
    id: row.id as number,
    code: row.code as string,
    tipo: row.tipo as TipoAcesso,
    email: row.email as string | undefined,
    nome: row.nome as string | undefined,
    usado: row.usado === 1 || row.usado === true,
    bloqueado: row.bloqueado === 1 || row.bloqueado === true,
    schoolId: row.school_id as number | undefined,
    coordinatorId: row.coordinator_id as number | undefined,
    createdAt: row.created_at as string,
    lastLoginAt: row.last_login_at as string | undefined,
  };
}

function rowToSchool(row: Record<string, any>): School {
  return { id: row.id as number, name: row.name as string, createdAt: row.created_at as string };
}

function rowToClassroom(row: Record<string, any>): Classroom {
  return { id: row.id as number, schoolId: row.school_id as number, name: row.name as string, createdAt: row.created_at as string };
}

function rowToOccurrence(row: Record<string, any>): Occurrence {
  return {
    id: row.id as number,
    classroomId: row.classroom_id as number,
    studentName: row.student_name as string,
    infrequencyType: row.infrequency_type as "5_consecutive" | "10_alternated",
    month: row.month as string,
    violationOfRights: row.violation_of_rights === 1 || row.violation_of_rights === true,
    createdAt: row.created_at as string,
  };
}

function rowToCoordinator(row: Record<string, any>): Coordinator {
  return {
    id: row.id as number,
    schoolId: row.school_id as number,
    name: row.name as string,
    selectedClassrooms: row.selected_classrooms as string | undefined,
    createdAt: row.created_at as string,
  };
}

// ─── Access Codes ─────────────────────────────────────────────────────────────

export async function generateUniqueCode(): Promise<string> {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const res = await db.execute("SELECT code FROM access_codes");
  const existing = new Set(res.rows.map((r) => r.code as string));
  for (let i = 0; i < 50; i++) {
    let code = "";
    for (let j = 0; j < 4; j++) code += letters[Math.floor(Math.random() * 26)];
    for (let j = 0; j < 3; j++) code += digits[Math.floor(Math.random() * 10)];
    if (!existing.has(code)) return code;
  }
  throw new Error("Não foi possível gerar código único");
}

export async function createAccessCode(data: { code: string; tipo: TipoAcesso; email?: string }): Promise<AccessCode> {
  await db.execute({ sql: "INSERT INTO access_codes (code, tipo, email) VALUES (?, ?, ?)", args: [data.code, data.tipo, data.email ?? null] });
  return (await getAccessCodeByCode(data.code))!;
}

export async function getAccessCodeByCode(code: string): Promise<AccessCode | undefined> {
  const res = await db.execute({
    sql: "SELECT * FROM access_codes WHERE lower(trim(code))=lower(trim(?)) LIMIT 1",
    args: [code],
  });
  if (!res.rows.length) return undefined;
  return rowToAccessCode(res.rows[0] as any);
}

export async function getAllAccessCodes(): Promise<AccessCode[]> {
  const res = await db.execute("SELECT * FROM access_codes ORDER BY created_at DESC");
  return res.rows.map((r) => rowToAccessCode(r as any));
}

export async function updateAccessCode(id: number, data: Partial<AccessCode>): Promise<void> {
  if (data.bloqueado !== undefined) {
    await db.execute({ sql: "UPDATE access_codes SET bloqueado=? WHERE id=?", args: [data.bloqueado ? 1 : 0, id] });
  }
}

export async function activateAccessCode(id: number, nome: string, schoolId: number, coordinatorId?: number): Promise<void> {
  await db.execute({
    sql: "UPDATE access_codes SET usado=1, nome=?, school_id=?, coordinator_id=? WHERE id=?",
    args: [nome, schoolId, coordinatorId ?? null, id],
  });
}

export async function recordLogin(codeId: number, coordinatorName?: string, schoolName?: string): Promise<void> {
  await db.execute({
    sql: "INSERT INTO login_history (code_id, coordinator_name, school_name) VALUES (?, ?, ?)",
    args: [codeId, coordinatorName ?? null, schoolName ?? null],
  });
  await db.execute({ sql: "UPDATE access_codes SET last_login_at=datetime('now') WHERE id=?", args: [codeId] });
}

export async function getLoginHistory(codeId?: number): Promise<LoginHistory[]> {
  const res = codeId
    ? await db.execute({ sql: "SELECT * FROM login_history WHERE code_id=? ORDER BY logged_at DESC LIMIT 100", args: [codeId] })
    : await db.execute("SELECT * FROM login_history ORDER BY logged_at DESC LIMIT 200");
  return res.rows.map((r: any) => ({
    id: r.id as number, codeId: r.code_id as number,
    coordinatorName: r.coordinator_name as string | undefined,
    schoolName: r.school_name as string | undefined,
    loggedAt: r.logged_at as string,
  }));
}

export async function deleteAccessCode(id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM access_codes WHERE id=?", args: [id] });
  await db.execute({ sql: "DELETE FROM login_history WHERE code_id=?", args: [id] });
}

// ─── Schools ──────────────────────────────────────────────────────────────────

export async function createSchool(name: string): Promise<School> {
  const res = await db.execute({ sql: "INSERT INTO schools (name) VALUES (?)", args: [name.trim()] });
  const id = Number(res.lastInsertRowid);
  return (await getSchoolById(id))!;
}

export async function getSchoolById(id: number): Promise<School | undefined> {
  const res = await db.execute({ sql: "SELECT * FROM schools WHERE id=? LIMIT 1", args: [id] });
  if (!res.rows.length) return undefined;
  return rowToSchool(res.rows[0] as any);
}

export async function getSchoolByName(name: string): Promise<School | undefined> {
  const res = await db.execute({
    sql: "SELECT * FROM schools WHERE lower(trim(name))=lower(trim(?)) LIMIT 1",
    args: [name],
  });
  if (!res.rows.length) return undefined;
  return rowToSchool(res.rows[0] as any);
}

export async function getAllSchools(): Promise<School[]> {
  const res = await db.execute("SELECT * FROM schools ORDER BY name ASC");
  return res.rows.map((r) => rowToSchool(r as any));
}

// ─── Classrooms ───────────────────────────────────────────────────────────────

export async function createClassroom(schoolId: number, name: string): Promise<Classroom> {
  const res = await db.execute({ sql: "INSERT INTO classrooms (school_id, name) VALUES (?, ?)", args: [schoolId, name] });
  const id = Number(res.lastInsertRowid);
  return (await getClassroomById(id))!;
}

export async function getClassroomsBySchool(schoolId: number): Promise<Classroom[]> {
  const res = await db.execute({ sql: "SELECT * FROM classrooms WHERE school_id=? ORDER BY name ASC", args: [schoolId] });
  return res.rows.map((r) => rowToClassroom(r as any));
}

export async function getClassroomById(id: number): Promise<Classroom | undefined> {
  const res = await db.execute({ sql: "SELECT * FROM classrooms WHERE id=? LIMIT 1", args: [id] });
  if (!res.rows.length) return undefined;
  return rowToClassroom(res.rows[0] as any);
}

export async function getUsedClassroomNamesBySchool(schoolId: number, excludeCoordinatorId?: number): Promise<string[]> {
  const coords = await getCoordinatorsBySchool(schoolId);
  const filtered = excludeCoordinatorId ? coords.filter((c) => c.id !== excludeCoordinatorId) : coords;
  const used = new Set<string>();
  for (const c of filtered) {
    if (c.selectedClassrooms) {
      try { (JSON.parse(c.selectedClassrooms) as string[]).forEach((n) => used.add(n)); } catch { /**/ }
    }
  }
  return Array.from(used);
}

// ─── Occurrences ──────────────────────────────────────────────────────────────

export async function createOccurrence(data: Omit<Occurrence, "id" | "createdAt">): Promise<Occurrence> {
  const res = await db.execute({
    sql: "INSERT INTO occurrences (classroom_id, student_name, infrequency_type, month, violation_of_rights) VALUES (?,?,?,?,?)",
    args: [data.classroomId, data.studentName, data.infrequencyType, data.month, data.violationOfRights ? 1 : 0],
  });
  return (await getOccurrenceById(Number(res.lastInsertRowid)))!;
}

async function getOccurrenceById(id: number): Promise<Occurrence | undefined> {
  const res = await db.execute({ sql: "SELECT * FROM occurrences WHERE id=? LIMIT 1", args: [id] });
  if (!res.rows.length) return undefined;
  return rowToOccurrence(res.rows[0] as any);
}

export async function getOccurrencesByClassroom(classroomId: number): Promise<Occurrence[]> {
  const res = await db.execute({
    sql: "SELECT * FROM occurrences WHERE classroom_id=? ORDER BY created_at DESC",
    args: [classroomId],
  });
  return res.rows.map((r) => rowToOccurrence(r as any));
}

export async function getAllOccurrences(): Promise<Occurrence[]> {
  const res = await db.execute("SELECT * FROM occurrences ORDER BY created_at DESC");
  return res.rows.map((r) => rowToOccurrence(r as any));
}

export async function deleteOccurrence(id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM occurrences WHERE id=?", args: [id] });
}

export async function updateOccurrence(id: number, data: Partial<Omit<Occurrence, "id" | "createdAt">>): Promise<void> {
  if (data.studentName !== undefined) await db.execute({ sql: "UPDATE occurrences SET student_name=? WHERE id=?", args: [data.studentName, id] });
  if (data.infrequencyType !== undefined) await db.execute({ sql: "UPDATE occurrences SET infrequency_type=? WHERE id=?", args: [data.infrequencyType, id] });
  if (data.month !== undefined) await db.execute({ sql: "UPDATE occurrences SET month=? WHERE id=?", args: [data.month, id] });
  if (data.violationOfRights !== undefined) await db.execute({ sql: "UPDATE occurrences SET violation_of_rights=? WHERE id=?", args: [data.violationOfRights ? 1 : 0, id] });
}

// ─── Coordinators ─────────────────────────────────────────────────────────────

export async function createCoordinator(data: { schoolId: number; name: string; selectedClassrooms?: string }): Promise<Coordinator> {
  const res = await db.execute({
    sql: "INSERT INTO coordinators (school_id, name, selected_classrooms) VALUES (?,?,?)",
    args: [data.schoolId, data.name, data.selectedClassrooms ?? null],
  });
  return (await getCoordinatorById(Number(res.lastInsertRowid)))!;
}

export async function getCoordinatorById(id: number): Promise<Coordinator | undefined> {
  const res = await db.execute({ sql: "SELECT * FROM coordinators WHERE id=? LIMIT 1", args: [id] });
  if (!res.rows.length) return undefined;
  return rowToCoordinator(res.rows[0] as any);
}

export async function getCoordinatorsBySchool(schoolId: number): Promise<Coordinator[]> {
  const res = await db.execute({ sql: "SELECT * FROM coordinators WHERE school_id=? ORDER BY name ASC", args: [schoolId] });
  return res.rows.map((r) => rowToCoordinator(r as any));
}

export async function updateCoordinator(id: number, data: Partial<Coordinator>): Promise<void> {
  if (data.name !== undefined) await db.execute({ sql: "UPDATE coordinators SET name=? WHERE id=?", args: [data.name, id] });
  if (data.selectedClassrooms !== undefined) await db.execute({ sql: "UPDATE coordinators SET selected_classrooms=? WHERE id=?", args: [data.selectedClassrooms, id] });
}

// ─── Enriched Occurrences ─────────────────────────────────────────────────────

export async function getAllOccurrencesEnriched(): Promise<OccurrenceEnriched[]> {
  const res = await db.execute(`
    SELECT
      o.id, o.classroom_id, o.student_name, o.infrequency_type, o.month,
      o.violation_of_rights, o.created_at,
      cl.name AS classroom_name,
      s.name AS school_name, s.id AS school_id,
      co.name AS coordinator_name
    FROM occurrences o
    LEFT JOIN classrooms cl ON cl.id = o.classroom_id
    LEFT JOIN schools s ON s.id = cl.school_id
    LEFT JOIN coordinators co ON co.school_id = s.id
    ORDER BY o.created_at DESC
  `);
  return res.rows.map((r: any) => ({
    id: r.id as number,
    classroomId: r.classroom_id as number,
    studentName: r.student_name as string,
    infrequencyType: r.infrequency_type as "5_consecutive" | "10_alternated",
    month: r.month as string,
    violationOfRights: r.violation_of_rights === 1 || r.violation_of_rights === true,
    createdAt: r.created_at as string,
    classroomName: (r.classroom_name as string) || `Turma #${r.classroom_id}`,
    schoolName: (r.school_name as string) || "Escola não identificada",
    schoolId: (r.school_id as number) || 0,
    coordinatorName: r.coordinator_name as string | undefined,
  }));
}
