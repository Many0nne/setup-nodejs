let prisma: any;

export function getPrisma(): any {
  if (!prisma) {
    const mod = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const connectionString = process.env.DATABASE_URL || '';
    const adapter = new PrismaPg({ connectionString });
    prisma = new mod.PrismaClient({
      log: ['warn', 'error'],
      adapter,
    });
  }
  return prisma;
}

export async function disconnectPrisma() {
  if (prisma && typeof prisma.$disconnect === 'function') {
    await prisma.$disconnect();
  }
}
