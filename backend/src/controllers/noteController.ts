import { Request, Response } from 'express';
import { prisma } from '../db';

// Custom error class for permission errors
class PermissionError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'PermissionError';
  }
}

// Lấy tất cả ghi chú của user
export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { timeFilter } = req.query;

    let whereClause: any = {
      userId: userId,
    };

    // Thêm filter theo thời gian
    if (timeFilter) {
      const now = new Date();
      let startDate: Date;

      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      whereClause.createdAt = {
        gte: startDate,
      };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    if (error instanceof PermissionError) {
      return res.status(error.statusCode).json({ 
        error: 'Forbidden',
        message: error.message,
        hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Lỗi khi tải danh sách ghi chú'
    });
  }
};



// Tạo ghi chú mới
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, content, folderId, color, isPinned, isArchived } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        color: color || '#FFD700', // Màu vàng mặc định
        isPinned: isPinned || false,
        isArchived: isArchived || false,
        userId,
        folderId: folderId || null,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof PermissionError) {
      return res.status(error.statusCode).json({ 
        error: 'Forbidden',
        message: error.message,
        hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Lỗi khi tạo ghi chú mới'
    });
  }
};



// Cập nhật ghi chú
export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, content, folderId, color, isPinned, isArchived } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id: id,
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await prisma.note.update({
      where: { id: id },
      data: {
        title,
        content,
        color,
        isPinned,
        isArchived,
        folderId: folderId || null,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    if (error instanceof PermissionError) {
      return res.status(error.statusCode).json({ 
        error: 'Forbidden',
        message: error.message,
        hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Lỗi khi cập nhật ghi chú'
    });
  }
};



// Xóa ghi chú
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: id,
        userId,
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await prisma.note.delete({
      where: { id: id },
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    if (error instanceof PermissionError) {
      return res.status(error.statusCode).json({ 
        error: 'Forbidden',
        message: error.message,
        hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Lỗi khi xóa ghi chú'
    });
  }
};



// Lấy ghi chú theo ID
export const getNoteById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: id,
        userId,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    if (error instanceof PermissionError) {
      return res.status(error.statusCode).json({ 
        error: 'Forbidden',
        message: error.message,
        hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Lỗi khi tải chi tiết ghi chú'
    });
  }
};

 