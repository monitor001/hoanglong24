const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const kaizenExamples = [
  {
    title: 'Tối ưu hóa quy trình kiểm tra chất lượng',
    description: 'Cải tiến quy trình kiểm tra chất lượng sản phẩm để giảm thời gian và tăng độ chính xác',
    content: `## Mô tả chi tiết
Quy trình kiểm tra chất lượng hiện tại mất nhiều thời gian và có thể bỏ sót một số lỗi. Chúng tôi đề xuất cải tiến bằng cách:

### Trước cải tiến:
- Kiểm tra thủ công từng sản phẩm
- Thời gian kiểm tra: 30 phút/sản phẩm
- Tỷ lệ bỏ sót lỗi: 15%
- Chi phí nhân công cao

### Sau cải tiến:
- Áp dụng kiểm tra tự động với camera AI
- Thời gian kiểm tra: 5 phút/sản phẩm
- Tỷ lệ bỏ sót lỗi: 2%
- Giảm 80% chi phí nhân công

### Lợi ích:
- Tiết kiệm thời gian: 83%
- Tăng độ chính xác: 87%
- Giảm chi phí: 80%
- Tăng năng suất: 600%

### Kế hoạch triển khai:
1. Nghiên cứu và lựa chọn thiết bị AI
2. Đào tạo nhân viên sử dụng
3. Triển khai thí điểm
4. Đánh giá và điều chỉnh
5. Áp dụng toàn bộ`,
    category: 'QUALITY',
    status: 'APPROVED',
    priority: 'HIGH',
    impact: 'HIGH',
    department: 'Phòng Kỹ thuật',
    location: 'Phân xưởng sản xuất A',
    estimatedSavings: '50 triệu VND/năm',
    isPublic: true
  },
  {
    title: 'Cải thiện an toàn lao động tại khu vực kho bãi',
    description: 'Triển khai hệ thống cảnh báo an toàn tự động tại khu vực kho bãi',
    content: `## Mô tả chi tiết
Khu vực kho bãi hiện tại có nhiều rủi ro về an toàn lao động do thiếu hệ thống cảnh báo và giám sát.

### Trước cải tiến:
- Không có hệ thống cảnh báo tự động
- Tai nạn lao động: 3 vụ/năm
- Chi phí bồi thường: 100 triệu VND/năm
- Tâm lý lo lắng của nhân viên

### Sau cải tiến:
- Hệ thống cảnh báo tự động với cảm biến
- Camera giám sát 24/7
- Đèn cảnh báo và âm thanh
- Tai nạn lao động: 0 vụ/năm

### Lợi ích:
- Giảm 100% tai nạn lao động
- Tiết kiệm chi phí bồi thường: 100 triệu VND/năm
- Tăng sự an tâm cho nhân viên
- Tuân thủ quy định an toàn lao động

### Kế hoạch triển khai:
1. Khảo sát và thiết kế hệ thống
2. Lắp đặt thiết bị
3. Đào tạo nhân viên
4. Vận hành thử nghiệm
5. Đánh giá hiệu quả`,
    category: 'SAFETY',
    status: 'IMPLEMENTED',
    priority: 'URGENT',
    impact: 'CRITICAL',
    department: 'Phòng An toàn',
    location: 'Khu vực kho bãi chính',
    estimatedSavings: '100 triệu VND/năm',
    isPublic: true
  },
  {
    title: 'Tự động hóa quy trình xuất nhập kho',
    description: 'Áp dụng hệ thống quản lý kho tự động để tăng hiệu quả và giảm sai sót',
    content: `## Mô tả chi tiết
Quy trình xuất nhập kho hiện tại vẫn sử dụng sổ sách thủ công, dễ gây sai sót và mất thời gian.

### Trước cải tiến:
- Ghi chép thủ công
- Thời gian xử lý: 2 giờ/đơn hàng
- Tỷ lệ sai sót: 8%
- Khó kiểm soát tồn kho

### Sau cải tiến:
- Hệ thống quản lý kho tự động
- Thời gian xử lý: 30 phút/đơn hàng
- Tỷ lệ sai sót: 1%
- Kiểm soát tồn kho real-time

### Lợi ích:
- Giảm 75% thời gian xử lý
- Giảm 87% sai sót
- Tăng độ chính xác kiểm kê
- Tiết kiệm chi phí vận hành

### Kế hoạch triển khai:
1. Lựa chọn phần mềm quản lý kho
2. Cài đặt và cấu hình hệ thống
3. Nhập dữ liệu hiện có
4. Đào tạo nhân viên
5. Triển khai từng bước`,
    category: 'EFFICIENCY',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    impact: 'MEDIUM',
    department: 'Phòng Kho vận',
    location: 'Tất cả kho hàng',
    estimatedSavings: '30 triệu VND/năm',
    isPublic: true
  },
  {
    title: 'Tiết kiệm năng lượng tại văn phòng',
    description: 'Triển khai hệ thống tiết kiệm năng lượng thông minh tại văn phòng',
    content: `## Mô tả chi tiết
Văn phòng hiện tại tiêu thụ nhiều năng lượng do thiếu hệ thống quản lý thông minh.

### Trước cải tiến:
- Điều hòa chạy 24/7
- Đèn sáng không cần thiết
- Chi phí điện: 50 triệu VND/tháng
- Lãng phí năng lượng

### Sau cải tiến:
- Hệ thống điều hòa thông minh
- Đèn tự động tắt/bật
- Cảm biến chuyển động
- Chi phí điện: 35 triệu VND/tháng

### Lợi ích:
- Giảm 30% chi phí điện
- Tiết kiệm 180 triệu VND/năm
- Bảo vệ môi trường
- Tăng tuổi thọ thiết bị

### Kế hoạch triển khai:
1. Khảo sát hiện trạng
2. Thiết kế hệ thống
3. Lắp đặt thiết bị
4. Cấu hình và vận hành
5. Theo dõi hiệu quả`,
    category: 'COST',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    impact: 'MEDIUM',
    department: 'Phòng Hành chính',
    location: 'Tòa nhà văn phòng chính',
    estimatedSavings: '180 triệu VND/năm',
    isPublic: true
  },
  {
    title: 'Cải thiện giao tiếp nội bộ',
    description: 'Triển khai nền tảng giao tiếp nội bộ để tăng hiệu quả trao đổi thông tin',
    content: `## Mô tả chi tiết
Giao tiếp nội bộ hiện tại chủ yếu qua email và họp trực tiếp, gây chậm trễ và thiếu hiệu quả.

### Trước cải tiến:
- Giao tiếp chủ yếu qua email
- Thời gian phản hồi: 24-48 giờ
- Thông tin bị phân tán
- Khó theo dõi tiến độ

### Sau cải tiến:
- Nền tảng giao tiếp tập trung
- Thời gian phản hồi: 2-4 giờ
- Thông tin được tổ chức tốt
- Theo dõi tiến độ real-time

### Lợi ích:
- Tăng 80% tốc độ phản hồi
- Giảm 60% thời gian họp
- Tăng sự minh bạch
- Cải thiện văn hóa công ty

### Kế hoạch triển khai:
1. Lựa chọn nền tảng phù hợp
2. Cấu hình và tùy chỉnh
3. Đào tạo nhân viên
4. Triển khai từng phòng ban
5. Đánh giá và tối ưu`,
    category: 'OTHER',
    status: 'DRAFT',
    priority: 'LOW',
    impact: 'LOW',
    department: 'Phòng Nhân sự',
    location: 'Toàn công ty',
    estimatedSavings: '20 triệu VND/năm',
    isPublic: false
  }
];

async function seedKaizenExamples() {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu Kaizen Examples...');

    // Lấy user đầu tiên làm tác giả
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ Không tìm thấy user nào, vui lòng tạo user trước');
      return;
    }

    // Lấy một số tags
    const tags = await prisma.kaizenTag.findMany({
      take: 5
    });

    for (const example of kaizenExamples) {
      const existingKaizen = await prisma.kaizen.findFirst({
        where: { title: example.title }
      });

      if (existingKaizen) {
        console.log(`✅ Kaizen "${example.title}" đã tồn tại, bỏ qua...`);
        continue;
      }

      const createdKaizen = await prisma.kaizen.create({
        data: {
          ...example,
          authorId: user.id,
          tags: {
            connect: tags.slice(0, 3).map(tag => ({ id: tag.id }))
          }
        }
      });

      console.log(`✅ Đã tạo kaizen: ${createdKaizen.title}`);
    }

    console.log('🎉 Hoàn thành seed dữ liệu Kaizen Examples!');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu Kaizen Examples:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  seedKaizenExamples();
}

module.exports = { seedKaizenExamples };
