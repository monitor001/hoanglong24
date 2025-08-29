import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all tags
export const getKaizenTags = async (req: Request, res: Response) => {
  try {
    const { search, isActive } = req.query;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { nameVi: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const tags = await prisma.kaizenTag.findMany({
      where,
      orderBy: { usageCount: 'desc' }
    });

    res.json(tags);
  } catch (error) {
    console.error('Error fetching kaizen tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single tag by ID
export const getKaizenTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.kaizenTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            kaizens: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error('Error fetching kaizen tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new tag
export const createKaizenTag = async (req: Request, res: Response) => {
  try {
    const { name, nameVi, color, description } = req.body;

    // Check if tag name already exists
    const existingTag = await prisma.kaizenTag.findUnique({
      where: { name }
    });

    if (existingTag) {
      return res.status(400).json({ error: 'Tag name already exists' });
    }

    const tag = await prisma.kaizenTag.create({
      data: {
        name,
        nameVi,
        color,
        description
      }
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating kaizen tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update tag
export const updateKaizenTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameVi, color, description, isActive } = req.body;

    // Check if tag exists
    const existingTag = await prisma.kaizenTag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if new name conflicts with existing tag
    if (name && name !== existingTag.name) {
      const nameConflict = await prisma.kaizenTag.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Tag name already exists' });
      }
    }

    const tag = await prisma.kaizenTag.update({
      where: { id },
      data: {
        name,
        nameVi,
        color,
        description,
        isActive
      }
    });

    res.json(tag);
  } catch (error) {
    console.error('Error updating kaizen tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete tag
export const deleteKaizenTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tag exists and has no associated kaizens
    const tag = await prisma.kaizenTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            kaizens: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag._count.kaizens > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tag that is associated with kaizens' 
      });
    }

    await prisma.kaizenTag.delete({
      where: { id }
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting kaizen tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get popular tags
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const tags = await prisma.kaizenTag.findMany({
      where: { isActive: true },
      orderBy: { usageCount: 'desc' },
      take: Number(limit)
    });

    res.json(tags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
