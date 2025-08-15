import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Tạo tài khoản admin duy nhất
  const admin = await prisma.user.upsert({
    where: { email: 'nguyenthanhvc@gmail.com' },
    update: {},
    create: {
      email: 'nguyenthanhvc@gmail.com',
      password: await bcrypt.hash('Ab5463698664#', 10),
      name: 'Nguyen Thanh',
      role: 'ADMIN',
      status: 'active',
      organization: 'Hoang Long 24',
    },
  });

  console.log('Admin user created/updated:', admin.email);

  // Tạo project mẫu (nếu chưa có)
  let project = await prisma.project.findFirst({ where: { name: 'Dự án mẫu' } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Dự án mẫu',
        description: 'Dự án kiểm thử seed lịch',
        status: 'ACTIVE',
        priority: 'HIGH',
        code: 'PRJ-DAM-123456', // Sample project code
      },
    });
    console.log('Sample project created:', project.name);
  }

  // Tạo sự kiện lịch mẫu
  const existingEvent = await prisma.calendarEvent.findFirst({
    where: { title: 'Họp kickoff dự án' }
  });

  if (!existingEvent) {
    await prisma.calendarEvent.create({
      data: {
        title: 'Họp kickoff dự án',
        description: 'Cuộc họp khởi động dự án mẫu',
        type: 'MEETING',
        startDate: dayjs().add(1, 'day').hour(9).minute(0).second(0).toDate(),
        endDate: dayjs().add(1, 'day').hour(10).minute(0).second(0).toDate(),
        projectId: project.id,
        createdById: admin.id,
        isAllDay: false,
        attendees: {
          create: [{ userId: admin.id, status: 'ACCEPTED' }]
        }
      }
    });
    console.log('Sample calendar event created');
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 