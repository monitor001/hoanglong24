const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu license...');

  try {
    // Tạo dữ liệu mẫu cho license
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
        notes: 'License mẫu cho testing - 1 năm'
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
        notes: 'License mẫu cho testing - 6 tháng'
      },
      {
        licenseKey: 'C3D4-E5F6-G7H8-I9J0-K1L2-M3N4-O5P6-Q7R8',
        machineId: 'MACHINE-SAMPLE-003',
        userName: 'Lê Văn C',
        userPhone: '0369852147',
        userEmail: 'levanc@example.com',
        usageDays: 90,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        notes: 'License mẫu cho testing - 3 tháng'
      },
      {
        licenseKey: 'D4E5-F6G7-H8I9-J0K1-L2M3-N4O5-P6Q7-R8S9',
        machineId: 'MACHINE-SAMPLE-004',
        userName: 'Phạm Thị D',
        userPhone: '0521478963',
        userEmail: 'phamthid@example.com',
        usageDays: 30,
        status: 'EXPIRED',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 ngày trước
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 ngày trước
        notes: 'License mẫu đã hết hạn'
      },
      {
        licenseKey: 'E5F6-G7H8-I9J0-K1L2-M3N4-O5P6-Q7R8-S9T0',
        machineId: 'MACHINE-SAMPLE-005',
        userName: 'Hoàng Văn E',
        userPhone: '0741258963',
        userEmail: 'hoangvane@example.com',
        usageDays: 60,
        status: 'SUSPENDED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        notes: 'License mẫu bị tạm ngưng'
      }
    ];

    console.log('📝 Tạo dữ liệu license mẫu...');
    
    for (const licenseData of sampleLicenses) {
      await prisma.license.upsert({
        where: { licenseKey: licenseData.licenseKey },
        update: {},
        create: licenseData
      });
      console.log(`✅ Đã tạo license: ${licenseData.licenseKey}`);
    }

    console.log('✅ Seed dữ liệu license hoàn thành!');

    // Hiển thị thống kê
    const stats = await prisma.license.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('\n📊 Thống kê license:');
    stats.forEach(stat => {
      console.log(`- ${stat.status}: ${stat._count.status}`);
    });

  } catch (error) {
    console.error('❌ Lỗi trong seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
