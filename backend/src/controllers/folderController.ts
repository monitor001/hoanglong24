import { Request, Response } from 'express';
import { prisma } from '../db';

export const getAllFolders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { timeFilter } = req.query;

    let whereClause: any = { userId };

    // Add time filter
    if (timeFilter) {
      const now = new Date();
      let startDate: Date;

      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }

      whereClause.createdAt = {
        gte: startDate
      };
    }

    const folders = await prisma.folder.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { notes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, color, icon } = req.body;

    const folder = await prisma.folder.create({
      data: {
        name,
        color: color || '#4CAF50', // Màu xanh mặc định
        icon: icon || 'folder', // Icon mặc định
        userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

export const getFolderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const folder = await prisma.folder.updateMany({
      where: {
        id,
        userId
      },
      data: {
        name,
        color,
        icon
      }
    });

    if (folder.count === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const updatedFolder = await prisma.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    res.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const folder = await prisma.folder.deleteMany({
      where: {
        id,
        userId
      }
    });

    if (folder.count === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
}; 