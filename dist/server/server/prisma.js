import { PrismaClient } from "../generated/prisma";
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: ["error", "warn"], // add "query" if you want verbose logs
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
