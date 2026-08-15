import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "@/env";

// ── Primary: direct connection via pg adapter ────────────────────────────────
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  backupPrisma: (PrismaClient & ReturnType<typeof withAccelerate>) | undefined;
};

export const primary =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = primary;

// ── Backup: Prisma Accelerate, lazy-init on failover ──────────────────────────
function getBackupClient(): PrismaClient {
  if (!globalForPrisma.backupPrisma) {
    if (!env.ACCELERATE_URL) {
      return primary;
    }
    const client = new PrismaClient({
      datasources: { db: { url: env.ACCELERATE_URL } },
    }).$extends(withAccelerate());
    globalForPrisma.backupPrisma = client as unknown as PrismaClient & ReturnType<typeof withAccelerate>;
  }
  return globalForPrisma.backupPrisma as unknown as PrismaClient;
}

// ── Unified db() wrapper ──────────────────────────────────────────────────────
export async function db<T>(
  query: (client: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await query(primary);
  } catch (err) {
    if (env.ACCELERATE_URL) {
      console.warn("[DB Failover] Primary connection failed, falling back to Accelerate:", err);
      const backup = getBackupClient();
      return await query(backup);
    }
    throw err;
  }
}
