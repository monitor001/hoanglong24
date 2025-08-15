import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

// Middleware kiểm tra quyền cơ bản cho notes
export const checkNotesPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Bạn cần đăng nhập để thực hiện thao tác này'
        });
      }

      // Admin luôn có quyền
      if (userRole === 'ADMIN') {
        return next();
      }

      // Kiểm tra quyền từ permission matrix
      const permissionMatrix = await prisma.systemSetting.findUnique({
        where: { key: 'role_permission_matrix' }
      });

      if (!permissionMatrix) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Hệ thống quyền chưa được cấu hình',
          hint: 'Vui lòng liên hệ quản trị viên'
        });
      }

      const rolePermissionMatrix = JSON.parse(permissionMatrix.value);
      
      // Kiểm tra permission cụ thể
      const hasPermission = rolePermissionMatrix[requiredPermission] && 
        rolePermissionMatrix[requiredPermission][userRole] === true;

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Bạn không có quyền ${requiredPermission}`,
          hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền'
        });
      }

      next();
    } catch (error) {
      console.error('Notes permission check error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Lỗi kiểm tra quyền truy cập'
      });
    }
  };
};

// Middleware kiểm tra quyền sở hữu note
export const checkNoteOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const noteId = req.params.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Bạn cần đăng nhập để thực hiện thao tác này'
      });
    }

    // Admin luôn có quyền
    if (userRole === 'ADMIN') {
      return next();
    }

    // Kiểm tra note có tồn tại và thuộc về user không
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        shares: {
          where: {
            sharedWithId: userId,
            status: 'ACCEPTED'
          }
        }
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ghi chú không tồn tại'
      });
    }

    // Kiểm tra quyền sở hữu hoặc quyền chia sẻ
    const isOwner = note.userId === userId;
    const hasSharedAccess = note.shares.length > 0;

    if (!isOwner && !hasSharedAccess) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Bạn không có quyền truy cập ghi chú này',
        hint: 'Ghi chú này không thuộc về bạn hoặc chưa được chia sẻ với bạn'
      });
    }

    // Thêm thông tin note vào request để sử dụng sau
    (req as any).note = note;
    next();
  } catch (error) {
    console.error('Note ownership check error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Lỗi kiểm tra quyền sở hữu ghi chú'
    });
  }
};

// Middleware kiểm tra quyền chỉnh sửa note
export const checkNoteEditPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const noteId = req.params.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Bạn cần đăng nhập để thực hiện thao tác này'
      });
    }

    // Admin luôn có quyền
    if (userRole === 'ADMIN') {
      return next();
    }

    // Kiểm tra note có tồn tại và thuộc về user không
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        shares: {
          where: {
            sharedWithId: userId,
            status: 'ACCEPTED',
            permissions: {
              in: ['edit', 'admin']
            }
          }
        }
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ghi chú không tồn tại'
      });
    }

    // Kiểm tra quyền sở hữu hoặc quyền chỉnh sửa
    const isOwner = note.userId === userId;
    const hasEditAccess = note.shares.some(share => 
      ['edit', 'admin'].includes(share.permissions)
    );

    if (!isOwner && !hasEditAccess) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Bạn không có quyền chỉnh sửa ghi chú này',
        hint: 'Chỉ chủ sở hữu hoặc người được cấp quyền chỉnh sửa mới có thể thực hiện thao tác này'
      });
    }

    next();
  } catch (error) {
    console.error('Note edit permission check error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Lỗi kiểm tra quyền chỉnh sửa ghi chú'
    });
  }
};
