import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// ---------------------------------------------------------------------------
// Singleton do PrismaClient
//
// Em desenvolvimento, o Hot Module Replacement (HMR) do Next.js pode executar
// este módulo várias vezes, criando múltiplas instâncias do PrismaClient e
// esgotando o pool de conexões do banco de dados.
//
// A solução padrão é armazenar a instância em `globalThis`, que sobrevive
// ao HMR, mas é recriada a cada deploy em produção.
// ---------------------------------------------------------------------------

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Desabilita logs em produção para performance
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}