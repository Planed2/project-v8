import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de Escolas
export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("name_idx").on(table.name),
}));

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

// Tabela de Turmas
export const classrooms = mysqlTable("classrooms", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  schoolIdIdx: index("schoolId_idx").on(table.schoolId),
}));

export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = typeof classrooms.$inferInsert;

// Tabela de Ocorrências
export const occurrences = mysqlTable("occurrences", {
  id: int("id").autoincrement().primaryKey(),
  classroomId: int("classroomId").notNull(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  infrequencyType: mysqlEnum("infrequencyType", [
    "5_consecutive",
    "10_alternated"
  ]).notNull(),
  month: mysqlEnum("month", [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ]).notNull(),
  violationOfRights: boolean("violationOfRights").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  classroomIdIdx: index("classroomId_idx").on(table.classroomId),
}));

export type Occurrence = typeof occurrences.$inferSelect;
export type InsertOccurrence = typeof occurrences.$inferInsert;

// Tabela de Coordenadores
export const coordinators = mysqlTable("coordinators", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  selectedClassrooms: text("selectedClassrooms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  schoolIdIdx: index("coordinator_schoolId_idx").on(table.schoolId),
}));

export type Coordinator = typeof coordinators.$inferSelect;
export type InsertCoordinator = typeof coordinators.$inferInsert;

// Tabela de Sessões de Acesso por Código (legado)
export const accessSessions = mysqlTable("accessSessions", {
  id: int("id").autoincrement().primaryKey(),
  accessCode: varchar("accessCode", { length: 50 }).notNull(),
  accessType: mysqlEnum("accessType", ["sec", "school"]).notNull(),
  schoolId: int("schoolId"),
  selectedClassrooms: text("selectedClassrooms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
}, (table) => ({
  accessCodeIdx: index("accessCode_idx").on(table.accessCode),
}));

export type AccessSession = typeof accessSessions.$inferSelect;
export type InsertAccessSession = typeof accessSessions.$inferInsert;

// NOVA TABELA: Códigos de Acesso para o sistema de autenticação
export const accessCodes = mysqlTable("accessCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  tipo: mysqlEnum("tipo", ["sec", "coordenador"]).notNull(),
  email: varchar("email", { length: 320 }),
  // Dados preenchidos após ativação
  nome: varchar("nome", { length: 255 }),
  usado: boolean("usado").default(false).notNull(),
  bloqueado: boolean("bloqueado").default(false).notNull(),
  // Vínculo com escola (preenchido após ativação)
  schoolId: int("schoolId"),
  coordinatorId: int("coordinatorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("ac_code_idx").on(table.code),
}));

export type AccessCode = typeof accessCodes.$inferSelect;
export type InsertAccessCode = typeof accessCodes.$inferInsert;
