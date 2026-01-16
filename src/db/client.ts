// Instance paresseuse de Prisma
// On évite d'instancier Prisma plusieurs fois (important en tests / hot-reload).
let prisma: any;

export function getPrisma(): any {
  if (!prisma) {
    // Import dynamique pour ne pas charger Prisma dans des contextes non nécessaires
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
  // Déconnexion sûre si l'instance existe
  if (prisma && typeof prisma.$disconnect === 'function') {
    await prisma.$disconnect();
  }
}
