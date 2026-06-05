import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

export type TrpcContext = {
  req: any;
  res: any;
  user: null;
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Mantido para compatibilidade, mas não usado neste app
export const protectedProcedure = t.procedure;
export const adminProcedure = t.procedure;
