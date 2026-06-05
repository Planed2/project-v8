import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as store from "./storage";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Suporte a ExpressResponse (dev) e VercelResponse (prod)
      const res = ctx.res as any;
      if (typeof res.clearCookie === "function") {
        res.clearCookie(COOKIE_NAME, { maxAge: -1 });
      } else if (typeof res.setHeader === "function") {
        res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly`);
      }
      return { success: true } as const;
    }),

    loginWithCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        const code = input.code.toLowerCase().trim();
        const accessCode = await store.getAccessCodeByCode(code);

        if (!accessCode) throw new TRPCError({ code: "UNAUTHORIZED", message: "Código de acesso inválido" });
        if (accessCode.bloqueado) throw new TRPCError({ code: "UNAUTHORIZED", message: "Este código foi bloqueado pela Secretaria" });

        if (accessCode.tipo === "sec") {
          await store.recordLogin(accessCode.id, accessCode.nome || "SEC", "Secretaria");
          return { accessType: "sec" as const, codeId: accessCode.id, nome: accessCode.nome, usado: accessCode.usado };
        }

        if (accessCode.usado && accessCode.schoolId) {
          const school = await store.getSchoolById(accessCode.schoolId);
          await store.recordLogin(accessCode.id, accessCode.nome || undefined, school?.name);
        }

        return {
          accessType: "coordenador" as const,
          codeId: accessCode.id,
          nome: accessCode.nome,
          usado: accessCode.usado,
          schoolId: accessCode.schoolId,
          coordinatorId: accessCode.coordinatorId,
          lastLoginAt: accessCode.lastLoginAt,
        };
      }),
  }),

  access: router({
    generateCode: publicProcedure
      .input(z.object({ tipo: z.enum(["sec", "coordenador"]), email: z.string().email().optional() }))
      .mutation(async ({ input }) => {
        const code = await store.generateUniqueCode();
        return store.createAccessCode({ code, tipo: input.tipo, email: input.email });
      }),

    getAll: publicProcedure.query(() => store.getAllAccessCodes()),

    block: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await store.updateAccessCode(input.id, { bloqueado: true }); return { success: true }; }),

    unblock: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await store.updateAccessCode(input.id, { bloqueado: false }); return { success: true }; }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await store.deleteAccessCode(input.id); return { success: true }; }),

    activateCoordinator: publicProcedure
      .input(z.object({ codeId: z.number(), nome: z.string(), schoolName: z.string() }))
      .mutation(async ({ input }) => {
        let school = await store.getSchoolByName(input.schoolName);
        const isNewSchool = !school;
        if (!school) school = await store.createSchool(input.schoolName.trim());

        const coordinator = await store.createCoordinator({ schoolId: school.id, name: input.nome.trim() });
        await store.activateAccessCode(input.codeId, input.nome.trim(), school.id, coordinator.id);
        await store.recordLogin(input.codeId, input.nome.trim(), school.name);

        const usedClassrooms = await store.getUsedClassroomNamesBySchool(school.id, coordinator.id);
        return { schoolId: school.id, schoolName: school.name, coordinatorId: coordinator.id, coordinatorName: coordinator.name, isNewSchool, usedClassrooms };
      }),

    getAvailableClassrooms: publicProcedure
      .input(z.object({ schoolId: z.number(), coordinatorId: z.number() }))
      .query(async ({ input }) => {
        const used = await store.getUsedClassroomNamesBySchool(input.schoolId, input.coordinatorId);
        return { usedClassrooms: used };
      }),

    getLoginHistory: publicProcedure
      .input(z.object({ codeId: z.number().optional() }))
      .query(({ input }) => store.getLoginHistory(input.codeId)),
  }),

  school: router({
    create: publicProcedure
      .input(z.object({ name: z.string() }))
      .mutation(({ input }) => store.createSchool(input.name)),
    getAll: publicProcedure.query(() => store.getAllSchools()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => store.getSchoolById(input.id)),
  }),

  classroom: router({
    create: publicProcedure
      .input(z.object({ schoolId: z.number(), name: z.string() }))
      .mutation(({ input }) => store.createClassroom(input.schoolId, input.name)),
    getBySchool: publicProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(({ input }) => store.getClassroomsBySchool(input.schoolId)),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => store.getClassroomById(input.id)),
  }),

  coordinator: router({
    create: publicProcedure
      .input(z.object({ schoolId: z.number(), name: z.string(), selectedClassrooms: z.string().optional() }))
      .mutation(({ input }) => store.createCoordinator(input)),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => store.getCoordinatorById(input.id)),
    getBySchool: publicProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(({ input }) => store.getCoordinatorsBySchool(input.schoolId)),
    update: publicProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), selectedClassrooms: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await store.updateCoordinator(id, data); return { success: true }; }),
  }),

  occurrence: router({
    create: publicProcedure
      .input(z.object({
        classroomId: z.number(), studentName: z.string(),
        infrequencyType: z.enum(["5_consecutive", "10_alternated"]),
        month: z.enum(["january","february","march","april","may","june","july","august","september","october","november","december"]),
        violationOfRights: z.boolean(),
      }))
      .mutation(({ input }) => store.createOccurrence(input)),
    getByClassroom: publicProcedure
      .input(z.object({ classroomId: z.number() }))
      .query(({ input }) => store.getOccurrencesByClassroom(input.classroomId)),
    getAll: publicProcedure.query(() => store.getAllOccurrences()),
    getAllEnriched: publicProcedure.query(() => store.getAllOccurrencesEnriched()),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await store.deleteOccurrence(input.id); return { success: true }; }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        studentName: z.string().optional(),
        infrequencyType: z.enum(["5_consecutive","10_alternated"]).optional(),
        month: z.enum(["january","february","march","april","may","june","july","august","september","october","november","december"]).optional(),
        violationOfRights: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await store.updateOccurrence(id, data); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
