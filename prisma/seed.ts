import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: process.env.DATABASE_URL ? { db: { url: process.env.DATABASE_URL } } : undefined,
});

async function main() {
  // Example: create a default user only if none exists
  const count = await prisma.user.count();
  if (count === 0) {
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: '$2a$10$Zc7QvO8rD2HqBqOVN0Q1Eu8O8v1P3eYbqkUpqg9b6xv1QjS6Pbb0W', // bcrypt hash of 'password'
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
