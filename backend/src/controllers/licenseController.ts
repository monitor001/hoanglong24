import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateLicenseKey } from '../utils/licenseUtils';

const prisma = new PrismaClient();

// Interface cho License
interface CreateLicenseData {
  machineId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  usageDays: number;
  notes?: string;
}

interface UpdateLicenseData {
  machineId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  usageDays?: number;
  endDate?: Date;
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  notes?: string;
}

// Tạo license mới
export const createLicense = async (req: Request, res: Response) => {
  try {
    const { machineId, userName, userPhone, userEmail, usageDays, notes }: CreateLicenseData = req.body;
    const userId = (req as any).user?.id;

    // Validation
    if (!machineId || !userName || !usageDays) {
      return res.status(400).json({
        error: 'Thiếu thông tin bắt buộc: machineId, userName, usageDays'
      });
    }

    if (usageDays <= 0) {
      return res.status(400).json({
        error: 'Số ngày sử dụng phải lớn hơn 0'
      });
    }

    // Kiểm tra machineId đã tồn tại chưa
    const existingLicense = await prisma.license.findFirst({
      where: { machineId }
    });

    if (existingLicense) {
      return res.status(400).json({
        error: 'Machine ID đã được sử dụng cho license khác'
      });
    }

    // Tạo license key duy nhất
    const licenseKey = generateLicenseKey();
    
    // Tính ngày hết hạn
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + usageDays);

    const license = await prisma.license.create({
      data: {
        licenseKey,
        machineId,
        userName,
        userPhone,
        userEmail,
        usageDays,
        startDate,
        endDate,
        notes,
        createdById: userId
      }
    });

    res.status(201).json({
      message: 'Tạo license thành công',
      license
    });
  } catch (error) {
    console.error('Error creating license:', error);
    res.status(500).json({
      error: 'Lỗi server khi tạo license'
    });
  }
};

// Lấy danh sách license
export const getLicenses = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { licenseKey: { contains: search as string, mode: 'insensitive' } },
        { machineId: { contains: search as string, mode: 'insensitive' } },
        { userName: { contains: search as string, mode: 'insensitive' } },
        { userPhone: { contains: search as string, mode: 'insensitive' } },
        { userEmail: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get licenses with pagination
    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [sortBy as string]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.license.count({ where })
    ]);

    // Tính toán thống kê
    const stats = await prisma.license.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as any);

    res.json({
      licenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      stats: statusStats
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({
      error: 'Lỗi server khi lấy danh sách license'
    });
  }
};

// Lấy chi tiết license
export const getLicenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!license) {
      return res.status(404).json({
        error: 'Không tìm thấy license'
      });
    }

    res.json({ license });
  } catch (error) {
    console.error('Error fetching license:', error);
    res.status(500).json({
      error: 'Lỗi server khi lấy thông tin license'
    });
  }
};

// Cập nhật license
export const updateLicense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateLicenseData = req.body;
    const userId = (req as any).user?.id;

    // Kiểm tra license tồn tại
    const existingLicense = await prisma.license.findUnique({
      where: { id }
    });

    if (!existingLicense) {
      return res.status(404).json({
        error: 'Không tìm thấy license'
      });
    }

    // Validation cho machineId nếu được cập nhật
    if (updateData.machineId && updateData.machineId !== existingLicense.machineId) {
      const duplicateMachine = await prisma.license.findFirst({
        where: {
          machineId: updateData.machineId,
          id: { not: id }
        }
      });

      if (duplicateMachine) {
        return res.status(400).json({
          error: 'Machine ID đã được sử dụng cho license khác'
        });
      }
    }

    // Cập nhật endDate nếu usageDays thay đổi
    if (updateData.usageDays && updateData.usageDays > 0) {
      const newEndDate = new Date(existingLicense.startDate);
      newEndDate.setDate(newEndDate.getDate() + updateData.usageDays);
      updateData.endDate = newEndDate;
    }

    const license = await prisma.license.update({
      where: { id },
      data: {
        ...updateData,
        updatedById: userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Cập nhật license thành công',
      license
    });
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({
      error: 'Lỗi server khi cập nhật license'
    });
  }
};

// Xóa license
export const deleteLicense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const license = await prisma.license.findUnique({
      where: { id }
    });

    if (!license) {
      return res.status(404).json({
        error: 'Không tìm thấy license'
      });
    }

    await prisma.license.delete({
      where: { id }
    });

    res.json({
      message: 'Xóa license thành công'
    });
  } catch (error) {
    console.error('Error deleting license:', error);
    res.status(500).json({
      error: 'Lỗi server khi xóa license'
    });
  }
};

// Kích hoạt license (kiểm tra và cập nhật lastUsed)
export const activateLicense = async (req: Request, res: Response) => {
  try {
    const { licenseKey, machineId } = req.body;

    if (!licenseKey || !machineId) {
      return res.status(400).json({
        error: 'Thiếu thông tin: licenseKey hoặc machineId'
      });
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (!license) {
      return res.status(404).json({
        error: 'License không tồn tại'
      });
    }

    if (license.machineId !== machineId) {
      return res.status(403).json({
        error: 'License không được phép sử dụng trên máy này'
      });
    }

    if (license.status !== 'ACTIVE') {
      return res.status(403).json({
        error: `License đã bị ${license.status === 'EXPIRED' ? 'hết hạn' : 'tạm ngưng'}`
      });
    }

    const now = new Date();
    if (now > license.endDate) {
      // Tự động cập nhật status thành EXPIRED
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'EXPIRED' }
      });

      return res.status(403).json({
        error: 'License đã hết hạn'
      });
    }

    // Cập nhật lastUsed
    await prisma.license.update({
      where: { id: license.id },
      data: { lastUsed: now }
    });

    res.json({
      message: 'Kích hoạt license thành công',
      license: {
        ...license,
        lastUsed: now
      }
    });
  } catch (error) {
    console.error('Error activating license:', error);
    res.status(500).json({
      error: 'Lỗi server khi kích hoạt license'
    });
  }
};

// Lấy thống kê license
export const getLicenseStats = async (req: Request, res: Response) => {
  try {
    const [totalLicenses, activeLicenses, expiredLicenses, suspendedLicenses] = await Promise.all([
      prisma.license.count(),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.license.count({ where: { status: 'EXPIRED' } }),
      prisma.license.count({ where: { status: 'SUSPENDED' } })
    ]);

    // License sắp hết hạn (trong 30 ngày tới)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await prisma.license.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: thirtyDaysFromNow,
          gt: new Date()
        }
      }
    });

    res.json({
      stats: {
        total: totalLicenses,
        active: activeLicenses,
        expired: expiredLicenses,
        suspended: suspendedLicenses,
        expiringSoon
      }
    });
  } catch (error) {
    console.error('Error fetching license stats:', error);
    res.status(500).json({
      error: 'Lỗi server khi lấy thống kê license'
    });
  }
};
