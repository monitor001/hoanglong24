const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const kaizenTags = [
  {
    name: 'process-improvement',
    nameVi: 'Cải tiến quy trình',
    color: '#1890ff',
    description: 'Các cải tiến liên quan đến quy trình làm việc'
  },
  {
    name: 'quality-control',
    nameVi: 'Kiểm soát chất lượng',
    color: '#52c41a',
    description: 'Cải tiến trong kiểm soát và đảm bảo chất lượng'
  },
  {
    name: 'safety-enhancement',
    nameVi: 'Tăng cường an toàn',
    color: '#faad14',
    description: 'Cải tiến về an toàn lao động và môi trường'
  },
  {
    name: 'cost-reduction',
    nameVi: 'Giảm chi phí',
    color: '#eb2f96',
    description: 'Cải tiến giúp giảm chi phí sản xuất và vận hành'
  },
  {
    name: 'efficiency-boost',
    nameVi: 'Tăng hiệu quả',
    color: '#722ed1',
    description: 'Cải tiến nâng cao hiệu quả công việc'
  },
  {
    name: 'automation',
    nameVi: 'Tự động hóa',
    color: '#13c2c2',
    description: 'Cải tiến áp dụng tự động hóa trong công việc'
  },
  {
    name: 'digital-transformation',
    nameVi: 'Chuyển đổi số',
    color: '#2f54eb',
    description: 'Cải tiến liên quan đến chuyển đổi số'
  },
  {
    name: 'lean-management',
    nameVi: 'Quản lý tinh gọn',
    color: '#fa8c16',
    description: 'Áp dụng nguyên tắc quản lý tinh gọn'
  },
  {
    name: 'innovation',
    nameVi: 'Đổi mới sáng tạo',
    color: '#f5222d',
    description: 'Các ý tưởng đổi mới sáng tạo'
  },
  {
    name: 'sustainability',
    nameVi: 'Bền vững',
    color: '#52c41a',
    description: 'Cải tiến hướng đến phát triển bền vững'
  },
  {
    name: 'customer-satisfaction',
    nameVi: 'Hài lòng khách hàng',
    color: '#1890ff',
    description: 'Cải tiến nâng cao sự hài lòng của khách hàng'
  },
  {
    name: 'employee-engagement',
    nameVi: 'Gắn kết nhân viên',
    color: '#722ed1',
    description: 'Cải tiến tăng cường sự gắn kết của nhân viên'
  },
  {
    name: 'technology-upgrade',
    nameVi: 'Nâng cấp công nghệ',
    color: '#13c2c2',
    description: 'Cải tiến nâng cấp công nghệ và thiết bị'
  },
  {
    name: 'workplace-optimization',
    nameVi: 'Tối ưu nơi làm việc',
    color: '#faad14',
    description: 'Cải tiến tối ưu không gian và môi trường làm việc'
  },
  {
    name: 'communication-improvement',
    nameVi: 'Cải thiện giao tiếp',
    color: '#eb2f96',
    description: 'Cải tiến trong giao tiếp và trao đổi thông tin'
  }
];

async function seedKaizenTags() {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu Kaizen Tags...');

    for (const tag of kaizenTags) {
      const existingTag = await prisma.kaizenTag.findUnique({
        where: { name: tag.name }
      });

      if (existingTag) {
        console.log(`✅ Tag "${tag.name}" đã tồn tại, bỏ qua...`);
        continue;
      }

      const createdTag = await prisma.kaizenTag.create({
        data: tag
      });

      console.log(`✅ Đã tạo tag: ${createdTag.nameVi} (${createdTag.name})`);
    }

    console.log('🎉 Hoàn thành seed dữ liệu Kaizen Tags!');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu Kaizen Tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  seedKaizenTags();
}

module.exports = { seedKaizenTags };
