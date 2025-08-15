import { PrismaClient } from '@prisma/client';
import { seedPermissionMatrix } from '../src/utils/seedPermissionMatrix';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create system user first
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@minicde.com' },
    update: {},
    create: {
      email: 'system@minicde.com',
      name: 'System Administrator',
      password: 'system_password_hash', // This should be hashed in production
      status: 'ACTIVE',
      // jobTitle field removed as it doesn't exist in User model
      phone: '',
      department: 'System',
      role: 'ADMIN'
    }
  });

  // Create default checklist categories - 4 hạng mục theo yêu cầu
  const defaultCategories = [
    {
      name: 'Giao Thông',
      description: 'Các hạng mục liên quan đến giao thông',
      color: '#1890ff',
      defaultContent: [
        'Giới thiệu chung',
        'Hiện trạng khu vực (địa hình, địa chất, thủy văn...)',
        'Quy mô công trình (phân cấp, phân hạng...)',
        'Cơ sở thiết kế',
        'Nguyên tắc thiết kế',
        'Các quy chuẩn, tiêu chuẩn áp dụng',
        'Tóm tắt sơ lược nội dung TKCS được duyệt',
        'Giải pháp thiết kế:',
        '- Giao thông đối ngoại',
        '- Giao thông đối nội',
        '- Giải pháp tổ chức giao thông: vạch sơn kẻ đường, biển báo',
        '- Bố trí vạch sơn, biển báo',
        '- Chi tiết vạch sơn, biển báo',
        '- Tổng hợp khối lượng giao thông',
        '- Tổng hợp khối lượng tổ chức giao thông',
        'Bản vẽ:',
        '- Mặt bằng giao thông',
        '- Cao độ thiết kế nút giao thông',
        '- Độ dốc + chiều dài đường',
        '- Phạm vi kết cấu mặt đường',
        '- Kích thước mặt cắt đường',
        '- Bán kính cong nằm',
        '- Tọa độ nút giao thông',
        '- Nút giao thông',
        '- Mặt bằng cọc giao thông',
        '- Mặt bằng tổ chức giao thông',
        '- Mặt cắt ngang điển hình',
        '- Mặt cắt điển hình các tuyến giao thông',
        '- Trắc dọc tuyến',
        '- Trắc ngang tuyến',
        '- Bản vẽ chi tiết',
        '- Các chi tiết các kết cấu giao thông',
        '- Các chi tiết tổ chức giao thông',
        '- Tổng hợp khối lượng toàn bộ hạng mục giao thông'
      ]
    },
    {
      name: 'San Nền',
      description: 'Các hạng mục liên quan đến san nền',
      color: '#52c41a',
      defaultContent: [
        'Giới thiệu chung',
        'Hiện trạng khu vực (địa hình, địa chất, thủy văn...)',
        'Quy mô công trình (phân cấp, phân hạng...)',
        'Cơ sở thiết kế',
        'Nguyên tắc thiết kế',
        'Các quy chuẩn, tiêu chuẩn áp dụng',
        'Tóm tắt sơ lược nội dung TKCS được duyệt',
        'Giải pháp thiết kế:',
        '- Căn cứ lựa chọn cao độ xây dựng',
        '- Giải pháp san nền khu vực xây mới',
        '- Giải pháp san nền khu vực hiện trạng (đặc biệt các khu vực lân sống rạch, các vị trí đào đắp cao)',
        '- Giải pháp chuẩn bị kỹ thuật khác',
        '- Tính toán khối lượng san nền',
        '- Tổng hợp khối lượng san nền',
        '- Đường công vụ (nếu có), rào chắn',
        '- Giải pháp thoát nước tạm trong giai đoạn san nền (nếu có)',
        'Bản vẽ:',
        '- Mặt bằng san nền + đường công vụ (nếu có)',
        '- Cao độ thiết kế nút giao thông + các điểm đặc biệt khống chế',
        '- Độ dốc + chiều dài đường',
        '- Độ dốc san nền',
        '- Cao độ đường đồng mức phù hợp với cao độ hè đường, mặt đường',
        '- Bản vẽ tính toán khối lượng',
        '- Tính toán khối lượng san nền lưới ô vuông 10x10',
        '- Trắc ngang điển hình, 1 số mặt cắt chỉ chi tiết trong trường hợp san nền giật cấp (nếu có)',
        '- Các bản vẽ chi tiết khác (đường công vụ, thoát nước tạm, mặt bằng bố trí và chi tiết thiết bị quan trắc, tổ chức thi công và an toàn lao động...)'
      ]
    },
    {
      name: 'Xử lý nền',
      description: 'Các hạng mục liên quan đến xử lý nền',
      color: '#fa8c16',
      defaultContent: [
        'Giới thiệu chung',
        'Hiện trạng khu vực (địa hình, địa chất, thủy văn...): mô tả kỹ các thông số địa chất, thủy văn',
        'Quy mô công trình (phân cấp, phân hạng...)',
        'Cơ sở và thông số thiết kế:',
        '- Thông số thiết kế nền mặt đường',
        '- Mực nước ngầm, mực nước thủy văn tính toán',
        '- Tiêu chuẩn về độ lún, ổn định',
        '- Hệ số an toàn',
        '- Hoạt tải (và các tải trọng khác)',
        '- Thời gian xử lý',
        '- Các thông số khác phục vụ lựa chọn giải pháp thiết kế',
        'Nguyên tắc thiết kế',
        'Các quy chuẩn, tiêu chuẩn áp dụng',
        'Tóm tắt sơ lược nội dung TKCS được duyệt, các nội dung đề xuất, thay đổi bước BVTC (nếu có)',
        'Giải pháp thiết kế giải pháp xử lý nền:',
        '- Đánh giá chi tiết điều kiện địa chất, thủy văn khu vực',
        '- Đánh giá chi tiết về ổn định và lún khi chưa xử lý',
        '- Đánh giá chi tiết nền trước và sau khi được xử lý',
        '- Ước tính độ lún, độ cố kết đạt được sau xử lý',
        '- Giải pháp kết cấu (cọc đất, bấc thấm hút chân không, bấc thấm gia tải tường, cọc cát, đào thay đất....)',
        '- Giải pháp xử lý phạm vi giáp nối với các công trình hiện hữu, giữa các giải pháp xử lý...',
        'Quy trình thi công và kiểm soát chất lượng XLN:',
        '- Trình tự thi công',
        '- Kiểm soát chất lượng thi công',
        '- Dự báo sự cố và giải pháp khắc phục',
        '- Biện pháp quan trắc trước, trong và sau thi công và tần suất quan trắc',
        'Bố trí thiết bị quan trắc trong giai đoạn xử lý nền',
        'Biện pháp thi công chủ đạo',
        'Bãi đổ, thải (nếu có)',
        'Phụ lục tính toán: ổn định, tính lún, tính toán kết cấu giải pháp xử lý nền, bản tính phạm vi ảnh hưởng giáp ranh...',
        'Bản vẽ:',
        '- Ghi chú: Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết để có thể tham chiếu thông tin làm cơ sở thi công tại công trường',
        '- Xử lý nền:',
        '  + Mặt bằng tổng thể giải pháp xử lý nền',
        '  + Mặt bằng chi tiết xử lý nền',
        '  + Trắc ngang đại diện xử lý nền',
        '  + Trắc dọc xử lý nền',
        '  + Trắc ngang đại diện tính toán khối lượng',
        '  + Trắc ngang chi tiết xử lý nền',
        '  + Bảng thống kê chi tiết giải pháp xử lý nền, các biểu đồ đắp gia tài, dỡ tải...',
        '- Bố trí khoan địa chất, bố trí thiết bị quan trắc:',
        '  + Mặt bằng bố trí thiết bị quan trắc + lỗ khoan địa chất',
        '  + Mặt cắt ngang bố trí thiết bị quan trắc',
        '  + Cấu tạo chi tiết thiết bị quan trắc',
        '  + Bảng tổng hợp, thống kê chi tiết',
        '- Biện pháp thi công, an toàn lao động:',
        '  + Bản vẽ chi tiết biện pháp, trình tự thi công',
        '- Tính toán khối lượng'
      ]
    },
    {
      name: 'Kè hồ',
      description: 'Các hạng mục liên quan đến kè hồ',
      color: '#722ed1',
      defaultContent: [
        'Giới thiệu chung',
        'Hiện trạng khu vực (địa hình, địa chất, thủy văn...)',
        'Quy mô công trình (phân cấp, phân hạng...)',
        'Cơ sở thiết kế',
        'Nguyên tắc thiết kế',
        'Các quy chuẩn, tiêu chuẩn áp dụng',
        'Tóm tắt sơ lược nội dung TKCS được duyệt',
        'Giải pháp thiết kế:',
        '- Giải pháp đào hồ',
        '- Kè hồ: đường đỉnh kè, chân kè, cao độ',
        '- Kè: kè sông, kênh, mương, kè biến...',
        '- Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        'Bản vẽ:',
        '- Ghi chú',
        '- Mặt bằng xử lý nền hiện trạng',
        '- Mặt bằng san nền + đường công vụ (nếu có)',
        '- Đào hồ',
        '- Kè hồ: đường đỉnh kè, chân kè, cao độ',
        '- Kè: kè sông, kênh, mương, kè biến...',
        '- Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '- Các bản vẽ chi tiết:',
        '  + Bản vẽ chi tiết kè, tường chắn, taluy, gia cố taluy...',
        '  + Bản vẽ chi tiết kè hồ',
        '  + Các bản vẽ chi tiết khác (đường công vụ, thoát nước tạm, mặt bằng bố trí và chi tiết thiết bị quan trắc, tổ chức thi công và an toàn lao động....)',
        '- Khung tên, mẫu chữ có thống nhất không',
        '- Chỉ dẫn vật liệu',
        '- Sơ họa vị trí công trình',
        '- Bình đồ hiện trạng',
        '- Bình đồ thiết kế',
        '- Trắc dọc công trình',
        '- Cắt ngang điển hình',
        '- Mặt cắt ngang chi tiết',
        '- Mặt bằng cọc và đơn nguyên tường, chi tiết cọc (nếu có)',
        'Biện pháp thi công chi tiết:',
        '- Mặt bằng thi công',
        '- Trình tự thi công',
        '- Biện pháp thi công chi tiết',
        '- Tiến độ thi công'
      ]
    },
    {
      name: 'Tường chắn',
      description: 'Các hạng mục liên quan đến tường chắn',
      color: '#eb2f96',
      defaultContent: [
        'Giới thiệu chung',
        'Hiện trạng khu vực (địa hình, địa chất, thủy văn...)',
        'Quy mô công trình (phân cấp, phân hạng...)',
        'Cơ sở thiết kế',
        'Nguyên tắc thiết kế',
        'Các quy chuẩn, tiêu chuẩn áp dụng',
        'Tóm tắt sơ lược nội dung TKCS được duyệt',
        'Giải pháp thiết kế:',
        '- Tường chắn đất',
        '- Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '- Điển hình giải pháp xử lý nền, kết cấu tường kè',
        'Bản vẽ:',
        '- Ghi chú',
        '- Mặt bằng xử lý nền hiện trạng',
        '- Mặt bằng san nền + đường công vụ (nếu có)',
        '- Tường chắn đất',
        '- Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '- Các bản vẽ chi tiết:',
        '  + Bản vẽ chi tiết kè, tường chắn, taluy, gia cố taluy...',
        '  + Các bản vẽ chi tiết khác (đường công vụ, thoát nước tạm, mặt bằng bố trí và chi tiết thiết bị quan trắc, tổ chức thi công và an toàn lao động....)',
        '- Khung tên, mẫu chữ có thống nhất không',
        '- Chỉ dẫn vật liệu',
        '- Sơ họa vị trí công trình',
        '- Bình đồ hiện trạng',
        '- Bình đồ thiết kế',
        '- Trắc dọc công trình',
        '- Cắt ngang điển hình',
        '- Mặt cắt ngang chi tiết',
        '- Mặt bằng cọc và đơn nguyên tường, chi tiết cọc (nếu có)',
        'Biện pháp thi công chi tiết:',
        '- Mặt bằng thi công',
        '- Trình tự thi công',
        '- Biện pháp thi công chi tiết',
        '- Tiến độ thi công'
      ]
    }
  ];

  // Create default categories
  for (const category of defaultCategories) {
    await prisma.designChecklistCategory.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        color: category.color,
        defaultContent: category.defaultContent
      },
      create: {
        name: category.name,
        description: category.description,
        color: category.color,
        defaultContent: category.defaultContent,
        createdById: systemUser.id // Use the system user's ID
      }
    });
  }

  // Position model doesn't exist in schema, skipping position creation

  // Seed permission matrix
  console.log('Seeding permission matrix...');
  await seedPermissionMatrix();

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 