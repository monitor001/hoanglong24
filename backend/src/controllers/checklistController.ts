import { Request, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middlewares/auth';

// Lấy danh sách checklist
export const getChecklists = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, projectId, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [checklists, total] = await Promise.all([
      prisma.designChecklist.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            select: {
              id: true,
              category: true,
              content: true,
              isChecked: true
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.designChecklist.count({ where })
    ]);

    res.json({
      checklists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching checklists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy chi tiết checklist
export const getChecklistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const checklist = await prisma.designChecklist.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        },
        templates: {
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo checklist mới
export const createChecklist = async (req: Request, res: Response) => {
  try {
    const { name, projectId, description, items } = req.body;
    const userId = (req as any).user.id;

    // Kiểm tra project tồn tại
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const checklist = await prisma.designChecklist.create({
      data: {
        name,
        projectId,
        description,
        createdById: userId,
        items: {
          create: items?.map((item: any, index: number) => ({
            category: item.category,
            content: item.content,
            order: index + 1
          })) || []
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(checklist);
  } catch (error) {
    console.error('Error creating checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật checklist
export const updateChecklist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, items } = req.body;

    const checklist = await prisma.designChecklist.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Cập nhật checklist và items
    const updatedChecklist = await prisma.designChecklist.update({
      where: { id },
      data: {
        name,
        description,
        items: {
          deleteMany: {},
          create: items?.map((item: any, index: number) => ({
            category: item.category,
            content: item.content,
            order: index + 1,
            isChecked: item.isChecked || false,
            notes: item.notes
          })) || []
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(updatedChecklist);
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Xóa checklist
export const deleteChecklist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const checklist = await prisma.designChecklist.findUnique({
      where: { id }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    await prisma.designChecklist.delete({
      where: { id }
    });

    res.json({ message: 'Checklist deleted successfully' });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật trạng thái item
export const updateChecklistItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { order, content, isChecked, notes } = req.body;

    const item = await prisma.designChecklistItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Prepare update data with validation
    const updateData: any = {};

    // Handle order field
    if (order !== undefined) {
      const orderValue = typeof order === 'number' ? order : parseInt(String(order));
      if (isNaN(orderValue) || orderValue < 1) {
        return res.status(400).json({ error: 'Order must be a positive number' });
      }
      updateData.order = orderValue;
    }

    // Handle content field
    if (content !== undefined) {
      if (typeof content !== 'string') {
        return res.status(400).json({ error: 'Content must be a string' });
      }
      updateData.content = content.trim();
    }

    // Handle isChecked field
    if (isChecked !== undefined) {
      let isCheckedBoolean = isChecked;
      if (typeof isChecked === 'string') {
        isCheckedBoolean = isChecked === 'true' || isChecked === '1' || isChecked === 'checked';
      }
      updateData.isChecked = Boolean(isCheckedBoolean);
    }

    // Handle notes field
    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        return res.status(400).json({ error: 'Notes must be a string' });
      }
      updateData.notes = notes.trim();
    }

    // Check if there are any updates to make
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedItem = await prisma.designChecklistItem.update({
      where: { id },
      data: updateData
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo checklist item mới
export const createChecklistItem = async (req: Request, res: Response) => {
  try {
    const { checklistId, category, content, order, isChecked, notes } = req.body;

    // Kiểm tra checklist tồn tại
    const checklist = await prisma.designChecklist.findUnique({
      where: { id: checklistId }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    // Convert isChecked to boolean if it's a string
    let isCheckedBoolean = isChecked || false;
    if (typeof isChecked === 'string') {
      isCheckedBoolean = isChecked === 'true' || isChecked === '1' || isChecked === 'checked';
    }

    const item = await prisma.designChecklistItem.create({
      data: {
        checklistId,
        category,
        content,
        order: order || 1,
        isChecked: isCheckedBoolean,
        notes: notes || ''
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating checklist item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy danh sách categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.designChecklistCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy categories với nội dung mặc định
export const getCategoriesWithDefaults = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.designChecklistCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Đảm bảo luôn có 4 hạng mục chính
    const requiredCategories = [
      'Giao Thông',
      'San Nền', 
      'Xử lý nền',
      'Kè hồ',
      'Tường chắn'
    ];

    const result = requiredCategories.map(categoryName => {
      const existingCategory = categories.find(cat => cat.name === categoryName);
      if (existingCategory) {
        return existingCategory;
      } else {
        // Tạo category mặc định nếu chưa có
        return {
          id: `default-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          name: categoryName,
          description: `Các hạng mục liên quan đến ${categoryName.toLowerCase()}`,
          color: '#1890ff',
          defaultContent: [],
          isActive: true,
          createdById: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories with defaults:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo category mới
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;
    const userId = (req as any).user.id;

    const category = await prisma.designChecklistCategory.create({
      data: {
        name,
        description,
        color,
        createdById: userId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const category = await prisma.designChecklistCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await prisma.designChecklistCategory.update({
      where: { id },
      data: {
        name,
        description,
        color
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Xóa category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.designChecklistCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.designChecklistCategory.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo checklist với nội dung mặc định từ categories
export const createChecklistWithDefaults = async (req: Request, res: Response) => {
  try {
    const { name, description, projectId } = req.body;
    const userId = (req as any).user.id;

    // Lấy tất cả categories với nội dung mặc định
    const categories = await prisma.designChecklistCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Tạo checklist
    const checklist = await prisma.designChecklist.create({
      data: {
        name,
        description,
        projectId,
        createdById: userId
      }
    });

    // Tạo items cho từng category với nội dung mặc định
    const itemsToCreate = [];
    let order = 1;

    // Nội dung mặc định cho từng category (từ tài liệu kỹ thuật)
    const defaultContentMap = {
      'Giao Thông': [
        'I. Kiểm tra các số liệu đầu vào',
        '   Số liệu tìm tuyến QH 1/500, tài liệu được CĐT chấp thuận: tìm đường phải có cánh tuyến, Bán kính cong phù hợp tiêu chuẩn, bán kính bó vỉa, bãi đậu xe',
        '   Đầu nối giao thông',
        '   Đo E nền đường hiện hữu, E nền đoạn lu thứ',
        '   Cao độ khống chế các tuyến GT, cầu, khu Quy hoạch đã duyệt xung quanh dự án',
        '   Cao độ San nền được duyệt',
        '   Vị trí Lối ra/vào nhà, cao độ (có thể cập nhật sau cao độ GT)',
        '   Các mẫu nhà điển hình, Điển hình concept kiến trúc lối ra/vào nhà, bãi đậu xe',
        '   Tải trọng trục yêu cầu của CĐT cho từng tuyến đường',
        '   Chủ trương có bàn giao hạ tầng cho cơ quan nhà nước không?',
        '   Tiến độ mong muốn từng giai đoạn của CĐT và của Tư vấn, cách thức phối hợp',
        '   Thống nhất ranh các tuyến đường; ranh phân chia công việc của hạ tầng và các bộ môn liên quan',
        '   Rà soát san nền dọc ranh dự án, các độ dốc san nền > 10% => đề ra giải pháp thực hiện',
        '   Báo cáo đầu là giải pháp thiết kế của Tư vấn',
        '   Đề xuất khung tiêu chuẩn áp dụng cho dự án',
        'II. Thuyết minh',
        '   Cơ sở thiết kế',
        '   Nguyên tắc thiết kế',
        '   Các quy chuẩn, tiêu chuẩn áp dụng',
        '   Chỉ tiêu thiết kế các tuyến đường theo phân cấp mạng lưới',
        '   Giải pháp thiết kế:',
        '     Giao thông đối ngoại',
        '     Giao thông đối nội',
        '     Quy mô các tuyến đường',
        '     Giải pháp mặt cắt ngang',
        '     Giải pháp xử lý nền đường',
        '     Trắc dọc',
        '     Kết cấu mặt đường',
        '     Kết cấu vỉa hè',
        '     Kết cấu bó vỉa',
        '     Kết cấu bó nền',
        '     Bán kính bó vỉa, Bãi đậu xe',
        '     Điển hình giải pháp xử lý nền, kết cấu tường kè',
        '     Điển hình concept kiến trúc lối ra/vào nhà',
        '     Kết cấu đan rãnh',
        '     Cây xanh',
        '     Bố trí hố trồng cây',
        '     Khoảng cách hố trồng cây',
        '     Kết cấu hố trồng cây',
        '     Giải pháp xử lý đối với các tuyến giáp ranh giới dự án',
        '     Giải pháp xử lý đối với các tuyến giáp ranh khu vực hiện trạng',
        '     Giải pháp tổ chức giao thông: vạch sơn kẻ đường, biển báo',
        '       Bố trí vạch sơn, biển báo',
        '       Chi tiết vạch sơn, biển báo',
        '   Biện pháp thi công chủ đạo',
        '   Bảng tổng hợp khối lượng',
        '   Tổng hợp khối lượng giao thông',
        '   Tổng hợp khối lượng tổ chức giao thông',
        '   Phụ lục tính toán:',
        '     Kết cấu áo đường cứng, áo đường mềm',
        '     Tính toán ổn định nền đường, lún',
        '   Tài liệu pháp lý liên quan:',
        '     Các quyết định duyệt, chủ trương',
        'III. Bản vẽ',
        '   a. Ghi chú',
        '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết để có thể tham chiếu thông tin làm cơ sở thi công tại công trường',
        '   b. Mặt bằng giao thông',
        '     Tuân thủ TKCS được duyệt',
        '     Cao độ thiết kế nút giao thông + các điểm đặc biệt không chế',
        '     Độ dốc + chiều dài đường; chiều dài đoạn đổi dốc',
        '     Phạm vi kết cấu mặt đường, nút giao thông, hè đường, bãi đỗ xe',
        '     Ký hiệu mặt cắt đường',
        '     Kích thước mặt cắt đường',
        '     Tên tuyến đường',
        '     Bán kính cong nằm, bán kính bó vỉa',
        '     Kiểm soát tầm nhìn, mở rộng đường cong',
        '     Yếu tố đường cong nằm',
        '     Tọa độ nút giao thông',
        '     Bảng tọa độ nút giao, cạnh tuyến, R-T-P-K điểm chuyển',
        '     Ghi chú, ký hiệu',
        '     Khối lượng diện tích, chiều dài trên mặt bằng',
        '   c. Mặt bằng cây xanh',
        '     Bố trí hố trồng cây',
        '     Dim kích thước hố trồng cây',
        '     Kết cấu hố trồng cây',
        '     Kết hợp với thiết kế cảnh quan (Bộ phận QLTK cảnh quan, TNR) để thống nhất giải pháp bố trí hố trồng cây',
        '     Bảng tổng hợp khối lượng',
        '     Ghi chú, ký hiệu',
        '   d. Mặt bằng xử lý nền đất yếu (nếu có)',
        '     Khoanh vùng, ký hiệu các vị trí cần xử lý',
        '     Các giải pháp xử lý nền đất yếu',
        '     Các mặt cắt chi tiết tại các vị trí xử lý đất yếu',
        '     Bảng tổng hợp khối lượng',
        '     Ghi chú, ký hiệu',
        '   e. Nút giao thông',
        '     Mặt bằng chi tiết nút giao',
        '     Bán kính bó vỉa, bán kính cong nằm',
        '     Các yếu tố cong nằm',
        '     Dim kích thước nút giao: hè đường, mặt đường, các cạnh nút giao...',
        '     Định vị nút giao: tọa độ các điểm không chế trên nút',
        '     Mặt bằng đường đồng mức thiết kế nút giao',
        '     Tính toán khối lượng nút',
        '     Tổng hợp khối lượng nút',
        '   g. Mặt bằng cọc giao thông',
        '     Vị trí cọc, tên cọc',
        '     Tên tuyến đường',
        '     Ghi chú, ký hiệu',
        '   h. Mặt bằng tổ chức giao thông',
        '     Bố trí biển báo hiệu giao thông',
        '       Số lượng biển báo trong 1 khu vực không nên quá dày, PA 2 biển báo 1 cột',
        '     Bố trí vạch sơn',
        '       Xem khoảng cách các lối sang đường đi bộ (loại thẳng, chéo). Không bố trí quá gần',
        '       Xem vị trí vạch dọc theo làn đường. Đúng kích thước làn đường',
        '       Định vị vị trí các vạch kẻ trên bản vẽ',
        '     Bố trí hạ hè cho người tàn tật',
        '     Bảng tổng hợp khối lượng',
        '     Ghi chú, ký hiệu',
        '   i. Mặt cắt ngang điển hình',
        '     Mặt cắt điển hình các tuyến giao thông thể hiện đầy đủ kết cấu, bố trí hạ tầng HTKT',
        '     Mặt cắt điển hình các tuyến giao thông bố trí vạch sơn, biển báo',
        '   j. Trắc dọc tuyến',
        '     Trắc dọc đủ các tuyến đường trên bình đồ',
        '     Chiều dài tuyến, tên cọc khớp theo bình đồ; điểm đổi dốc, chiều dài đổi dốc',
        '     Cao độ đường đỏ khớp theo bình đồ',
        '     Cao độ đường đen khớp theo bình đồ',
        '   k. Trắc ngang tuyến',
        '     Trắc ngang các tuyến đường, mức độ thể hiện chi tiết với khoảng cách trung bình 20m/cọc',
        '     Cao độ đường đỏ, đen khớp với trắc dọc',
        '     Kết cấu mặt đường/vỉa hè/bó vỉa/bó hè phù hợp với kết cấu điển hình',
        '     Xử lý nền đường khớp với hiện trạng bình đồ tuyến, xử lý nền đất yếu',
        '     Bảng tổng hợp khối lượng nền đường từng tuyến',
        '     Bảng tổng hợp khối lượng các tuyến',
        '   l. Bản vẽ chi tiết',
        '     Các chi tiết các kết cấu giao thông',
        '       Chi tiết từng loại kết cấu',
        '       Khối lượng chi tiết từng kết cấu',
        '     Các chi tiết tổ chức giao thông',
        '       Chi tiết từng loại kết cấu',
        '       Khối lượng chi tiết từng kết cấu',
        '   m. Tổng hợp khối lượng toàn bộ hạng mục giao thông',
        '     Khối lượng giao thông',
        '     Bảng tổng hợp khối lượng theo tuyến',
        '     Bảng tổng hợp khối lượng theo nút',
        '     Bảng tổng hợp khối lượng chung',
        '     Bảng tổng hợp khối lượng tổ chức giao thông'
      ],
      'San Nền': [
        'I. Kiểm tra các số liệu đầu vào',
        '   Số liệu tìm tuyến QH 1/500, tài liệu được CĐT chấp thuận',
        '   Cao độ khống chế các tuyến GT, cầu, khu Quy hoạch đã duyệt xung quanh dự án',
        '   Cao độ San nền được duyệt',
        '   Vị trí Lối ra/vào nhà, cao độ',
        '   Các mẫu nhà điển hình, Điển hình concept kiến trúc lối ra/vào nhà',
        '   Tiến độ mong muốn từng giai đoạn của CĐT và của Tư vấn',
        '   Thống nhất ranh các tuyến đường; ranh phân chia công việc',
        '   Rà soát san nền dọc ranh dự án, các độ dốc san nền > 10%',
        '   Báo cáo đầu là giải pháp thiết kế của Tư vấn',
        '   Đề xuất khung tiêu chuẩn áp dụng cho dự án',
        'II. Thuyết minh',
        '   Cơ sở thiết kế',
        '   Nguyên tắc thiết kế',
        '   Các quy chuẩn, tiêu chuẩn áp dụng',
        '   Giải pháp thiết kế:',
        '     Căn cứ lựa chọn cao độ xây dựng',
        '     Giải pháp san nền khu vực xây mới',
        '     Giải pháp san nền khu vực hiện trạng (đặc biệt các khu vực lân sống rạch, các vị trí đào đắp cao)',
        '     Giải pháp chuẩn bị kỹ thuật khác',
        '     Tính toán khối lượng san nền',
        '     Tổng hợp khối lượng san nền',
        '     Đường công vụ (nếu có), rào chắn',
        '     Giải pháp thoát nước tạm trong giai đoạn san nền (nếu có)',
        '   Biện pháp thi công chủ đạo',
        '   Bảng tổng hợp khối lượng',
        '   Phụ lục tính toán',
        '   Tài liệu pháp lý liên quan',
        'III. Bản vẽ',
        '   a. Ghi chú',
        '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết',
        '   b. Mặt bằng san nền + đường công vụ (nếu có)',
        '     Cao độ thiết kế nút giao thông + các điểm đặc biệt khống chế',
        '     Độ dốc + chiều dài đường',
        '     Độ dốc san nền',
        '     Cao độ đường đồng mức phù hợp với cao độ hè đường, mặt đường',
        '     Bản vẽ tính toán khối lượng',
        '     Tính toán khối lượng san nền lưới ô vuông 10x10',
        '     Trắc ngang điển hình, 1 số mặt cắt chỉ chi tiết trong trường hợp san nền giật cấp (nếu có)',
        '     Các bản vẽ chi tiết khác (đường công vụ, thoát nước tạm, mặt bằng bố trí và chi tiết thiết bị quan trắc, tổ chức thi công và an toàn lao động...)'
      ],
      'Xử lý nền': [
        'I. Kiểm tra các số liệu đầu vào',
        '   Số liệu địa chất, thủy văn khu vực',
        '   Mực nước ngầm, mực nước thủy văn tính toán',
        '   Tiêu chuẩn về độ lún, ổn định',
        '   Hệ số an toàn',
        '   Hoạt tải (và các tải trọng khác)',
        '   Thời gian xử lý',
        '   Các thông số khác phục vụ lựa chọn giải pháp thiết kế',
        'II. Thuyết minh',
        '   Cơ sở và thông số thiết kế:',
        '     Thông số thiết kế nền mặt đường',
        '     Mực nước ngầm, mực nước thủy văn tính toán',
        '     Tiêu chuẩn về độ lún, ổn định',
        '     Hệ số an toàn',
        '     Hoạt tải (và các tải trọng khác)',
        '     Thời gian xử lý',
        '     Các thông số khác phục vụ lựa chọn giải pháp thiết kế',
        '   Nguyên tắc thiết kế',
        '   Các quy chuẩn, tiêu chuẩn áp dụng',
        '   Tóm tắt sơ lược nội dung TKCS được duyệt, các nội dung đề xuất, thay đổi bước BVTC (nếu có)',
        '   Giải pháp thiết kế giải pháp xử lý nền:',
        '     Đánh giá chi tiết điều kiện địa chất, thủy văn khu vực',
        '     Đánh giá chi tiết về ổn định và lún khi chưa xử lý',
        '     Đánh giá chi tiết nền trước và sau khi được xử lý',
        '     Ước tính độ lún, độ cố kết đạt được sau xử lý',
        '     Giải pháp kết cấu (cọc đất, bấc thấm hút chân không, bấc thấm gia tải tường, cọc cát, đào thay đất....)',
        '     Giải pháp xử lý phạm vi giáp nối với các công trình hiện hữu, giữa các giải pháp xử lý...',
        '   Quy trình thi công và kiểm soát chất lượng XLN:',
        '     Trình tự thi công',
        '     Kiểm soát chất lượng thi công',
        '     Dự báo sự cố và giải pháp khắc phục',
        '     Biện pháp quan trắc trước, trong và sau thi công và tần suất quan trắc',
        '   Bố trí thiết bị quan trắc trong giai đoạn xử lý nền',
        '   Biện pháp thi công chủ đạo',
        '   Bãi đổ, thải (nếu có)',
        '   Phụ lục tính toán: ổn định, tính lún, tính toán kết cấu giải pháp xử lý nền, bản tính phạm vi ảnh hưởng giáp ranh...',
        '   Bảng tổng hợp khối lượng',
        '   Tài liệu pháp lý liên quan',
        'III. Bản vẽ',
        '   a. Ghi chú',
        '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết để có thể tham chiếu thông tin làm cơ sở thi công tại công trường',
        '   b. Xử lý nền:',
        '     Mặt bằng tổng thể giải pháp xử lý nền',
        '     Mặt bằng chi tiết xử lý nền',
        '     Trắc ngang đại diện xử lý nền',
        '     Trắc dọc xử lý nền',
        '     Trắc ngang đại diện tính toán khối lượng',
        '     Trắc ngang chi tiết xử lý nền',
        '     Bảng thống kê chi tiết giải pháp xử lý nền, các biểu đồ đắp gia tài, dỡ tải...',
        '   c. Bố trí khoan địa chất, bố trí thiết bị quan trắc:',
        '     Mặt bằng bố trí thiết bị quan trắc + lỗ khoan địa chất',
        '     Mặt cắt ngang bố trí thiết bị quan trắc',
        '     Cấu tạo chi tiết thiết bị quan trắc',
        '     Bảng tổng hợp, thống kê chi tiết',
        '   d. Biện pháp thi công, an toàn lao động:',
        '     Bản vẽ chi tiết biện pháp, trình tự thi công',
        '   e. Tính toán khối lượng'
      ],
      'Kè hồ': [
        'I. Kiểm tra các số liệu đầu vào',
        '   Số liệu địa chất, thủy văn khu vực',
        '   Cao độ khống chế các tuyến GT, cầu, khu Quy hoạch đã duyệt xung quanh dự án',
        '   Cao độ San nền được duyệt',
        '   Vị trí Lối ra/vào nhà, cao độ',
        '   Các mẫu nhà điển hình, Điển hình concept kiến trúc lối ra/vào nhà',
        '   Tiến độ mong muốn từng giai đoạn của CĐT và của Tư vấn',
        '   Thống nhất ranh các tuyến đường; ranh phân chia công việc',
        '   Báo cáo đầu là giải pháp thiết kế của Tư vấn',
        '   Đề xuất khung tiêu chuẩn áp dụng cho dự án',
        'II. Thuyết minh',
        '   Cơ sở thiết kế',
        '   Nguyên tắc thiết kế',
        '   Các quy chuẩn, tiêu chuẩn áp dụng',
        '   Tóm tắt sơ lược nội dung TKCS được duyệt',
        '   Giải pháp thiết kế:',
        '     Giải pháp đào hồ',
        '     Kè hồ: đường đỉnh kè, chân kè, cao độ',
        '     Kè: kè sông, kênh, mương, kè biến...',
        '     Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '   Biện pháp thi công chủ đạo',
        '   Bảng tổng hợp khối lượng',
        '   Phụ lục tính toán',
        '   Tài liệu pháp lý liên quan',
        'III. Bản vẽ',
        '   a. Ghi chú',
        '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết',
        '   b. Mặt bằng xử lý nền hiện trạng',
        '   c. Mặt bằng san nền + đường công vụ (nếu có)',
        '   d. Đào hồ',
        '   e. Kè hồ: đường đỉnh kè, chân kè, cao độ',
        '   f. Kè: kè sông, kênh, mương, kè biến...',
        '   g. Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '   h. Các bản vẽ chi tiết:',
        '     Bản vẽ chi tiết kè, tường chắn, taluy, gia cố taluy...',
        '     Bản vẽ chi tiết kè hồ',
        '     Các bản vẽ chi tiết khác (đường công vụ, thoát nước tạm, mặt bằng bố trí và chi tiết thiết bị quan trắc, tổ chức thi công và an toàn lao động....)',
        '   i. Khung tên, mẫu chữ có thống nhất không',
        '   j. Chỉ dẫn vật liệu',
        '   k. Sơ họa vị trí công trình',
        '   l. Bình đồ hiện trạng',
        '   m. Bình đồ thiết kế',
        '   n. Trắc dọc công trình',
        '   o. Cắt ngang điển hình',
        '   p. Mặt cắt ngang chi tiết',
        '   q. Mặt bằng cọc và đơn nguyên tường, chi tiết cọc (nếu có)',
        '   r. Biện pháp thi công chi tiết:',
        '     Mặt bằng thi công',
        '     Trình tự thi công',
        '     Biện pháp thi công chi tiết',
        '     Tiến độ thi công'
      ],
      'Tường chắn': [
        'I. Kiểm tra các số liệu đầu vào',
        '   Số liệu địa chất, thủy văn khu vực',
        '   Cao độ khống chế các tuyến GT, cầu, khu Quy hoạch đã duyệt xung quanh dự án',
        '   Cao độ San nền được duyệt',
        '   Vị trí Lối ra/vào nhà, cao độ',
        '   Các mẫu nhà điển hình, Điển hình concept kiến trúc lối ra/vào nhà',
        '   Tiến độ mong muốn từng giai đoạn của CĐT và của Tư vấn',
        '   Thống nhất ranh các tuyến đường; ranh phân chia công việc',
        '   Báo cáo đầu là giải pháp thiết kế của Tư vấn',
        '   Đề xuất khung tiêu chuẩn áp dụng cho dự án',
        'II. Thuyết minh',
        '   Cơ sở thiết kế',
        '   Nguyên tắc thiết kế',
        '   Các quy chuẩn, tiêu chuẩn áp dụng',
        '   Tóm tắt sơ lược nội dung TKCS được duyệt',
        '   Giải pháp thiết kế:',
        '     Tường chắn đất',
        '     Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '     Điển hình giải pháp xử lý nền, kết cấu tường kè',
        '   Biện pháp thi công chủ đạo',
        '   Bảng tổng hợp khối lượng',
        '   Phụ lục tính toán',
        '   Tài liệu pháp lý liên quan',
        'III. Bản vẽ',
        '   a. Ghi chú',
        '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết',
        '   b. Mặt bằng xử lý nền hiện trạng',
        '   c. Mặt bằng san nền + đường công vụ (nếu có)',
        '   d. Tường chắn đất',
        '   e. Mặt cắt điển hình tại các vị trí xử lý chênh cao bằng giải pháp taluy hoặc kè, tường chắn',
        '   f. Các bản vẽ chi tiết:',
        '     Bản vẽ chi tiết kè, tường chắn, taluy, gia cố taluy...',
        '     Bản vẽ chi tiết tường chắn',
        '     Các bản vẽ chi tiết khác (đường công vụ, thoát nước tạm, mặt bằng bố trí và chi tiết thiết bị quan trắc, tổ chức thi công và an toàn lao động....)',
        '   g. Khung tên, mẫu chữ có thống nhất không',
        '   h. Chỉ dẫn vật liệu',
        '   i. Sơ họa vị trí công trình',
        '   j. Bình đồ hiện trạng',
        '   k. Bình đồ thiết kế',
        '   l. Trắc dọc công trình',
        '   m. Cắt ngang điển hình',
        '   n. Mặt cắt ngang chi tiết',
        '   o. Mặt bằng cọc và đơn nguyên tường, chi tiết cọc (nếu có)',
        '   p. Biện pháp thi công chi tiết:',
        '     Mặt bằng thi công',
        '     Trình tự thi công',
        '     Biện pháp thi công chi tiết',
        '     Tiến độ thi công'
      ]
    };

    for (const category of categories) {
      const defaultContent = defaultContentMap[category.name as keyof typeof defaultContentMap] || [
        'Giới thiệu chung',
        'Nội dung thiết kế',
        'Bản vẽ'
      ];
      
      for (const content of defaultContent) {
        itemsToCreate.push({
          checklistId: checklist.id,
          category: category.name,
          content: content,
          order: order++,
          isChecked: false
        });
      }
    }

    if (itemsToCreate.length > 0) {
      await prisma.designChecklistItem.createMany({
        data: itemsToCreate
      });
    }

    // Lấy checklist đã tạo với items
    const createdChecklist = await prisma.designChecklist.findUnique({
      where: { id: checklist.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(createdChecklist);
  } catch (error) {
    console.error('Error creating checklist with defaults:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo template từ checklist với nội dung mặc định
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { checklistId, name, description, saveAsDefault = false } = req.body;
    const userId = (req as any).user.id;

    const checklist = await prisma.designChecklist.findUnique({
      where: { id: checklistId },
      include: { items: true }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const template = await prisma.designChecklistTemplate.create({
      data: {
        name,
        description,
        checklistId,
        createdById: userId,
        items: {
          create: checklist.items.map(item => ({
            category: item.category,
            content: item.content,
            order: item.order
          }))
        }
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Nếu saveAsDefault = true, cập nhật nội dung mặc định cho categories
    if (saveAsDefault) {
      const categories = await prisma.designChecklistCategory.findMany({
        where: { isActive: true }
      });

      // Lưu ý: Không cập nhật defaultContent vì field này không tồn tại trong schema
      // Có thể lưu vào file config hoặc database riêng nếu cần
      console.log('Template saved as default for categories:', categories.map(c => c.name));
    }

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy danh sách templates
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.designChecklistTemplate.findMany({
      where: { isActive: true },
      include: {
        checklist: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Nếu không có template nào, trả về template mẫu
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          id: 'template-giao-thong',
          name: 'Template Giao Thông',
          description: 'Template mẫu cho các hạng mục giao thông với nội dung chi tiết từ tài liệu kỹ thuật',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          checklist: {
            id: 'default-checklist',
            name: 'Checklist Giao Thông',
            project: {
              id: 'default-project',
              name: 'Dự án Giao Thông'
            }
          },
          items: [
            { id: 'item-1', category: 'Giao Thông', content: 'I. Kiểm tra các số liệu đầu vào', order: 1 },
            { id: 'item-2', category: 'Giao Thông', content: '   Số liệu tìm tuyến QH 1/500, tài liệu được CĐT chấp thuận: tìm đường phải có cánh tuyến, Bán kính cong phù hợp tiêu chuẩn, bán kính bó vỉa, bãi đậu xe', order: 2 },
            { id: 'item-3', category: 'Giao Thông', content: '   Đầu nối giao thông', order: 3 },
            { id: 'item-4', category: 'Giao Thông', content: '   Đo E nền đường hiện hữu, E nền đoạn lu thứ', order: 4 },
            { id: 'item-5', category: 'Giao Thông', content: '   Cao độ khống chế các tuyến GT, cầu, khu Quy hoạch đã duyệt xung quanh dự án', order: 5 },
            { id: 'item-6', category: 'Giao Thông', content: '   Cao độ San nền được duyệt', order: 6 },
            { id: 'item-7', category: 'Giao Thông', content: '   Vị trí Lối ra/vào nhà, cao độ (có thể cập nhật sau cao độ GT)', order: 7 },
            { id: 'item-8', category: 'Giao Thông', content: '   Các mẫu nhà điển hình, Điển hình concept kiến trúc lối ra/vào nhà, bãi đậu xe', order: 8 },
            { id: 'item-9', category: 'Giao Thông', content: '   Tải trọng trục yêu cầu của CĐT cho từng tuyến đường', order: 9 },
            { id: 'item-10', category: 'Giao Thông', content: '   Chủ trương có bàn giao hạ tầng cho cơ quan nhà nước không?', order: 10 },
            { id: 'item-11', category: 'Giao Thông', content: '   Tiến độ mong muốn từng giai đoạn của CĐT và của Tư vấn, cách thức phối hợp', order: 11 },
            { id: 'item-12', category: 'Giao Thông', content: '   Thống nhất ranh các tuyến đường; ranh phân chia công việc của hạ tầng và các bộ môn liên quan', order: 12 },
            { id: 'item-13', category: 'Giao Thông', content: '   Rà soát san nền dọc ranh dự án, các độ dốc san nền > 10% => đề ra giải pháp thực hiện', order: 13 },
            { id: 'item-14', category: 'Giao Thông', content: '   Báo cáo đầu là giải pháp thiết kế của Tư vấn', order: 14 },
            { id: 'item-15', category: 'Giao Thông', content: '   Đề xuất khung tiêu chuẩn áp dụng cho dự án', order: 15 },
            { id: 'item-16', category: 'Giao Thông', content: 'II. Thuyết minh', order: 16 },
            { id: 'item-17', category: 'Giao Thông', content: '   Cơ sở thiết kế', order: 17 },
            { id: 'item-18', category: 'Giao Thông', content: '   Nguyên tắc thiết kế', order: 18 },
            { id: 'item-19', category: 'Giao Thông', content: '   Các quy chuẩn, tiêu chuẩn áp dụng', order: 19 },
            { id: 'item-20', category: 'Giao Thông', content: '   Chỉ tiêu thiết kế các tuyến đường theo phân cấp mạng lưới', order: 20 },
            { id: 'item-21', category: 'Giao Thông', content: '   Giải pháp thiết kế:', order: 21 },
            { id: 'item-22', category: 'Giao Thông', content: '     Giao thông đối ngoại', order: 22 },
            { id: 'item-23', category: 'Giao Thông', content: '     Giao thông đối nội', order: 23 },
            { id: 'item-24', category: 'Giao Thông', content: '     Quy mô các tuyến đường', order: 24 },
            { id: 'item-25', category: 'Giao Thông', content: '     Giải pháp mặt cắt ngang', order: 25 },
            { id: 'item-26', category: 'Giao Thông', content: '     Giải pháp xử lý nền đường', order: 26 },
            { id: 'item-27', category: 'Giao Thông', content: '     Trắc dọc', order: 27 },
            { id: 'item-28', category: 'Giao Thông', content: '     Kết cấu mặt đường', order: 28 },
            { id: 'item-29', category: 'Giao Thông', content: '     Kết cấu vỉa hè', order: 29 },
            { id: 'item-30', category: 'Giao Thông', content: '     Kết cấu bó vỉa', order: 30 },
            { id: 'item-31', category: 'Giao Thông', content: '     Kết cấu bó nền', order: 31 },
            { id: 'item-32', category: 'Giao Thông', content: '     Bán kính bó vỉa, Bãi đậu xe', order: 32 },
            { id: 'item-33', category: 'Giao Thông', content: '     Điển hình giải pháp xử lý nền, kết cấu tường kè', order: 33 },
            { id: 'item-34', category: 'Giao Thông', content: '     Điển hình concept kiến trúc lối ra/vào nhà', order: 34 },
            { id: 'item-35', category: 'Giao Thông', content: '     Kết cấu đan rãnh', order: 35 },
            { id: 'item-36', category: 'Giao Thông', content: '     Cây xanh', order: 36 },
            { id: 'item-37', category: 'Giao Thông', content: '     Bố trí hố trồng cây', order: 37 },
            { id: 'item-38', category: 'Giao Thông', content: '     Khoảng cách hố trồng cây', order: 38 },
            { id: 'item-39', category: 'Giao Thông', content: '     Kết cấu hố trồng cây', order: 39 },
            { id: 'item-40', category: 'Giao Thông', content: '     Giải pháp xử lý đối với các tuyến giáp ranh giới dự án', order: 40 },
            { id: 'item-41', category: 'Giao Thông', content: '     Giải pháp xử lý đối với các tuyến giáp ranh khu vực hiện trạng', order: 41 },
            { id: 'item-42', category: 'Giao Thông', content: '     Giải pháp tổ chức giao thông: vạch sơn kẻ đường, biển báo', order: 42 },
            { id: 'item-43', category: 'Giao Thông', content: '       Bố trí vạch sơn, biển báo', order: 43 },
            { id: 'item-44', category: 'Giao Thông', content: '       Chi tiết vạch sơn, biển báo', order: 44 },
            { id: 'item-45', category: 'Giao Thông', content: '   Biện pháp thi công chủ đạo', order: 45 },
            { id: 'item-46', category: 'Giao Thông', content: '   Bảng tổng hợp khối lượng', order: 46 },
            { id: 'item-47', category: 'Giao Thông', content: '   Tổng hợp khối lượng giao thông', order: 47 },
            { id: 'item-48', category: 'Giao Thông', content: '   Tổng hợp khối lượng tổ chức giao thông', order: 48 },
            { id: 'item-49', category: 'Giao Thông', content: '   Phụ lục tính toán:', order: 49 },
            { id: 'item-50', category: 'Giao Thông', content: '     Kết cấu áo đường cứng, áo đường mềm', order: 50 },
            { id: 'item-51', category: 'Giao Thông', content: '     Tính toán ổn định nền đường, lún', order: 51 },
            { id: 'item-52', category: 'Giao Thông', content: '   Tài liệu pháp lý liên quan:', order: 52 },
            { id: 'item-53', category: 'Giao Thông', content: '     Các quyết định duyệt, chủ trương', order: 53 },
            { id: 'item-54', category: 'Giao Thông', content: 'III. Bản vẽ', order: 54 },
            { id: 'item-55', category: 'Giao Thông', content: '   a. Ghi chú', order: 55 },
            { id: 'item-56', category: 'Giao Thông', content: '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết để có thể tham chiếu thông tin làm cơ sở thi công tại công trường', order: 56 },
            { id: 'item-57', category: 'Giao Thông', content: '   b. Mặt bằng giao thông', order: 57 },
            { id: 'item-58', category: 'Giao Thông', content: '     Tuân thủ TKCS được duyệt', order: 58 },
            { id: 'item-59', category: 'Giao Thông', content: '     Cao độ thiết kế nút giao thông + các điểm đặc biệt không chế', order: 59 },
            { id: 'item-60', category: 'Giao Thông', content: '     Độ dốc + chiều dài đường; chiều dài đoạn đổi dốc', order: 60 }
          ]
        },
        {
          id: 'template-san-nen',
          name: 'Template San Nền',
          description: 'Template mẫu cho các hạng mục san nền với nội dung chi tiết từ tài liệu kỹ thuật',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          checklist: {
            id: 'default-checklist-2',
            name: 'Checklist San Nền',
            project: {
              id: 'default-project-2',
              name: 'Dự án San Nền'
            }
          },
          items: [
            { id: 'item-61', category: 'San Nền', content: 'I. Kiểm tra các số liệu đầu vào', order: 1 },
            { id: 'item-62', category: 'San Nền', content: '   Số liệu tìm tuyến QH 1/500, tài liệu được CĐT chấp thuận', order: 2 },
            { id: 'item-63', category: 'San Nền', content: '   Cao độ khống chế các tuyến GT, cầu, khu Quy hoạch đã duyệt xung quanh dự án', order: 3 },
            { id: 'item-64', category: 'San Nền', content: '   Cao độ San nền được duyệt', order: 4 },
            { id: 'item-65', category: 'San Nền', content: '   Vị trí Lối ra/vào nhà, cao độ', order: 5 },
            { id: 'item-66', category: 'San Nền', content: '   Các mẫu nhà điển hình, Điển hình concept kiến trúc lối ra/vào nhà', order: 6 },
            { id: 'item-67', category: 'San Nền', content: '   Tiến độ mong muốn từng giai đoạn của CĐT và của Tư vấn', order: 7 },
            { id: 'item-68', category: 'San Nền', content: '   Thống nhất ranh các tuyến đường; ranh phân chia công việc', order: 8 },
            { id: 'item-69', category: 'San Nền', content: '   Rà soát san nền dọc ranh dự án, các độ dốc san nền > 10%', order: 9 },
            { id: 'item-70', category: 'San Nền', content: '   Báo cáo đầu là giải pháp thiết kế của Tư vấn', order: 10 },
            { id: 'item-71', category: 'San Nền', content: '   Đề xuất khung tiêu chuẩn áp dụng cho dự án', order: 11 },
            { id: 'item-72', category: 'San Nền', content: 'II. Thuyết minh', order: 12 },
            { id: 'item-73', category: 'San Nền', content: '   Cơ sở thiết kế', order: 13 },
            { id: 'item-74', category: 'San Nền', content: '   Nguyên tắc thiết kế', order: 14 },
            { id: 'item-75', category: 'San Nền', content: '   Các quy chuẩn, tiêu chuẩn áp dụng', order: 15 },
            { id: 'item-76', category: 'San Nền', content: '   Giải pháp thiết kế:', order: 16 },
            { id: 'item-77', category: 'San Nền', content: '     Căn cứ lựa chọn cao độ xây dựng', order: 17 },
            { id: 'item-78', category: 'San Nền', content: '     Giải pháp san nền khu vực xây mới', order: 18 },
            { id: 'item-79', category: 'San Nền', content: '     Giải pháp san nền khu vực hiện trạng (đặc biệt các khu vực lân sống rạch, các vị trí đào đắp cao)', order: 19 },
            { id: 'item-80', category: 'San Nền', content: '     Giải pháp chuẩn bị kỹ thuật khác', order: 20 },
            { id: 'item-81', category: 'San Nền', content: '     Tính toán khối lượng san nền', order: 21 },
            { id: 'item-82', category: 'San Nền', content: '     Tổng hợp khối lượng san nền', order: 22 },
            { id: 'item-83', category: 'San Nền', content: '     Đường công vụ (nếu có), rào chắn', order: 23 },
            { id: 'item-84', category: 'San Nền', content: '     Giải pháp thoát nước tạm trong giai đoạn san nền (nếu có)', order: 24 },
            { id: 'item-85', category: 'San Nền', content: '   Biện pháp thi công chủ đạo', order: 25 },
            { id: 'item-86', category: 'San Nền', content: '   Bảng tổng hợp khối lượng', order: 26 },
            { id: 'item-87', category: 'San Nền', content: '   Phụ lục tính toán', order: 27 },
            { id: 'item-88', category: 'San Nền', content: '   Tài liệu pháp lý liên quan', order: 28 },
            { id: 'item-89', category: 'San Nền', content: 'III. Bản vẽ', order: 29 },
            { id: 'item-90', category: 'San Nền', content: '   a. Ghi chú', order: 30 },
            { id: 'item-91', category: 'San Nền', content: '     Tất cả các bản vẽ phải có ghi chú, chỉ dẫn cần thiết', order: 31 },
            { id: 'item-92', category: 'San Nền', content: '   b. Mặt bằng san nền + đường công vụ (nếu có)', order: 32 },
            { id: 'item-93', category: 'San Nền', content: '     Cao độ thiết kế nút giao thông + các điểm đặc biệt khống chế', order: 33 },
            { id: 'item-94', category: 'San Nền', content: '     Độ dốc + chiều dài đường', order: 34 },
            { id: 'item-95', category: 'San Nền', content: '     Độ dốc san nền', order: 35 }
          ]
        }
      ];
      return res.json(defaultTemplates);
    }

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo checklist từ template
export const createChecklistFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId, projectId, name, description } = req.body;
    const userId = (req as any).user.id;

    const template = await prisma.designChecklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const checklist = await prisma.designChecklist.create({
      data: {
        name,
        projectId,
        description,
        createdById: userId,
        items: {
          create: template.items.map(item => ({
            category: item.category,
            content: item.content,
            order: item.order
          }))
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(checklist);
  } catch (error) {
    console.error('Error creating checklist from template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 