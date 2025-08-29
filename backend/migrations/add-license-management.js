const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Bắt đầu migration: Thêm License Management...');

  try {
    // Tạo enum LicenseStatus nếu chưa tồn tại
    console.log('📝 Tạo enum LicenseStatus...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Tạo bảng License
    console.log('📝 Tạo bảng License...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "License" (
        "id" TEXT NOT NULL,
        "licenseKey" TEXT NOT NULL,
        "machineId" TEXT NOT NULL,
        "userName" TEXT NOT NULL,
        "userPhone" TEXT,
        "userEmail" TEXT,
        "usageDays" INTEGER NOT NULL,
        "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3) NOT NULL,
        "lastUsed" TIMESTAMP(3),
        "notes" TEXT,
        "createdById" TEXT,
        "updatedById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "License_pkey" PRIMARY KEY ("id")
      );
    `;

    // Tạo unique constraint cho licenseKey
    console.log('📝 Tạo unique constraint cho licenseKey...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "License" ADD CONSTRAINT "License_licenseKey_key" UNIQUE ("licenseKey");
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Tạo foreign key constraints
    console.log('📝 Tạo foreign key constraints...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "License" ADD CONSTRAINT "License_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "License" ADD CONSTRAINT "License_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Tạo indexes
    console.log('📝 Tạo indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_licenseKey_idx" ON "License"("licenseKey");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_machineId_idx" ON "License"("machineId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_status_idx" ON "License"("status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_startDate_idx" ON "License"("startDate");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_endDate_idx" ON "License"("endDate");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_createdAt_idx" ON "License"("createdAt");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "License_status_endDate_idx" ON "License"("status", "endDate");`;

    console.log('✅ Migration License Management hoàn thành!');

    // Tạo dữ liệu mẫu (optional)
    console.log('📝 Tạo dữ liệu mẫu...');
    const sampleLicenses = [
      {
        licenseKey: 'A1B2-C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6',
        machineId: 'MACHINE-SAMPLE-001',
        userName: 'Nguyễn Văn A',
        userPhone: '0123456789',
        userEmail: 'nguyenvana@example.com',
        usageDays: 365,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        notes: 'License mẫu cho testing'
      },
      {
        licenseKey: 'B2C3-D4E5-F6G7-H8I9-J0K1-L2M3-N4O5-P6Q7',
        machineId: 'MACHINE-SAMPLE-002',
        userName: 'Trần Thị B',
        userPhone: '0987654321',
        userEmail: 'tranthib@example.com',
        usageDays: 180,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        notes: 'License mẫu cho testing'
      }
    ];

    for (const licenseData of sampleLicenses) {
      await prisma.license.upsert({
        where: { licenseKey: licenseData.licenseKey },
        update: {},
        create: licenseData
      });
    }

    console.log('✅ Dữ liệu mẫu đã được tạo!');

  } catch (error) {
    console.error('❌ Lỗi trong migration:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
