const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting migration: Adding dueDate field to Issue table...');

  try {
    // Add dueDate column to Issue table
    await prisma.$executeRaw`
      ALTER TABLE "Issue" ADD COLUMN "dueDate" TIMESTAMP(3);
    `;
    console.log('✅ Added dueDate column to Issue table');

    // Update existing issues to set dueDate = createdAt + 7 days
    const updatedIssues = await prisma.$executeRaw`
      UPDATE "Issue" 
      SET "dueDate" = "createdAt" + INTERVAL '7 days'
      WHERE "dueDate" IS NULL;
    `;
    console.log(`✅ Updated ${updatedIssues} existing issues with default due date`);

    // Create indexes for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Issue_dueDate_idx" ON "Issue"("dueDate");
    `;
    console.log('✅ Created index on dueDate column');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 