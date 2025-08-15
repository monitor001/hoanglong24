const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: add-todo-model');

  // Create TodoPriority enum
  await prisma.$executeRaw`
    CREATE TYPE "TodoPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  `;

  // Create Todo table
  await prisma.$executeRaw`
    CREATE TABLE "Todo" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "completed" BOOLEAN NOT NULL DEFAULT false,
      "priority" "TodoPriority" NOT NULL DEFAULT 'MEDIUM',
      "dueDate" TIMESTAMP(3) NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
    );
  `;

  // Create indexes
  await prisma.$executeRaw`
    CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");
  `;

  await prisma.$executeRaw`
    CREATE INDEX "Todo_dueDate_idx" ON "Todo"("dueDate");
  `;

  await prisma.$executeRaw`
    CREATE INDEX "Todo_completed_idx" ON "Todo"("completed");
  `;

  await prisma.$executeRaw`
    CREATE INDEX "Todo_priority_idx" ON "Todo"("priority");
  `;

  await prisma.$executeRaw`
    CREATE INDEX "Todo_createdAt_idx" ON "Todo"("createdAt");
  `;

  await prisma.$executeRaw`
    CREATE INDEX "Todo_userId_dueDate_idx" ON "Todo"("userId", "dueDate");
  `;

  await prisma.$executeRaw`
    CREATE INDEX "Todo_userId_completed_idx" ON "Todo"("userId", "completed");
  `;

  // Add foreign key constraint
  await prisma.$executeRaw`
    ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  `;

  console.log('Migration completed successfully');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 