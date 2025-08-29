import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinary';

const prisma = new PrismaClient();

// Get all kaizens with filtering and pagination
export const getKaizens = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      search,
      tags,
      authorId,
      projectId,
      isPublic
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const where: any = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (authorId) where.authorId = authorId;
    if (projectId) where.projectId = projectId;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      where.tags = {
        some: {
          name: { in: tagArray }
        }
      };
    }

    const [kaizens, total] = await Promise.all([
      prisma.kaizen.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          tags: true,
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.kaizen.count({ where })
    ]);

    res.json({
      kaizens,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching kaizens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single kaizen by ID
export const getKaizenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const kaizen = await prisma.kaizen.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!kaizen) {
      return res.status(404).json({ error: 'Kaizen not found' });
    }

    // Check if user has liked this kaizen
    let isLiked = false;
    if (userId) {
      const like = await prisma.kaizenLike.findUnique({
        where: {
          kaizenId_userId: {
            kaizenId: id,
            userId
          }
        }
      });
      isLiked = !!like;
    }

    // Increment view count
    await prisma.kaizen.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ ...kaizen, isLiked });
  } catch (error) {
    console.error('Error fetching kaizen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new kaizen
export const createKaizen = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      title,
      description,
      content,
      category,
      priority,
      impact,
      department,
      location,
      estimatedSavings,
      implementationDate,
      isPublic,
      projectId,
      tagIds
    } = req.body;

    // Handle file uploads
    let beforeImage = null;
    let afterImage = null;
    let attachments = null;

    if (req.files) {
      const files = req.files as any;
      
      if (files.beforeImage) {
        beforeImage = await uploadToCloudinary(files.beforeImage[0]);
      }
      
      if (files.afterImage) {
        afterImage = await uploadToCloudinary(files.afterImage[0]);
      }
      
      if (files.attachments) {
        const uploadedFiles = await Promise.all(
          files.attachments.map((file: any) => uploadToCloudinary(file))
        );
        attachments = uploadedFiles;
      }
    }

    const kaizen = await prisma.kaizen.create({
      data: {
        title,
        description,
        content,
        category,
        priority,
        impact,
        department,
        location,
        beforeImage,
        afterImage,
        attachments,
        estimatedSavings,
        implementationDate: implementationDate ? new Date(implementationDate) : null,
        isPublic: isPublic === 'true',
        authorId: userId,
        projectId: projectId || null,
        tags: tagIds ? {
          connect: (tagIds as string[]).map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      }
    });

    res.status(201).json(kaizen);
  } catch (error) {
    console.error('Error creating kaizen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update kaizen
export const updateKaizen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const {
      title,
      description,
      content,
      category,
      status,
      priority,
      impact,
      department,
      location,
      estimatedSavings,
      implementationDate,
      completionDate,
      isPublic,
      projectId,
      tagIds
    } = req.body;

    // Check if user is author or admin
    const kaizen = await prisma.kaizen.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!kaizen) {
      return res.status(404).json({ error: 'Kaizen not found' });
    }

    if (kaizen.authorId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Handle file uploads
    let beforeImage = kaizen.beforeImage;
    let afterImage = kaizen.afterImage;
    let attachments = kaizen.attachments;

    if (req.files) {
      const files = req.files as any;
      
      if (files.beforeImage) {
        beforeImage = await uploadToCloudinary(files.beforeImage[0]);
      }
      
      if (files.afterImage) {
        afterImage = await uploadToCloudinary(files.afterImage[0]);
      }
      
      if (files.attachments) {
        const uploadedFiles = await Promise.all(
          files.attachments.map((file: any) => uploadToCloudinary(file))
        );
        attachments = uploadedFiles;
      }
    }

    const updatedKaizen = await prisma.kaizen.update({
      where: { id },
      data: {
        title,
        description,
        content,
        category,
        status,
        priority,
        impact,
        department,
        location,
        beforeImage,
        afterImage,
        attachments,
        estimatedSavings,
        implementationDate: implementationDate ? new Date(implementationDate) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        isPublic: isPublic === 'true',
        projectId: projectId || null,
        tags: tagIds ? {
          set: [],
          connect: (tagIds as string[]).map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      }
    });

    res.json(updatedKaizen);
  } catch (error) {
    console.error('Error updating kaizen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete kaizen
export const deleteKaizen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const kaizen = await prisma.kaizen.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!kaizen) {
      return res.status(404).json({ error: 'Kaizen not found' });
    }

    if (kaizen.authorId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.kaizen.delete({
      where: { id }
    });

    res.json({ message: 'Kaizen deleted successfully' });
  } catch (error) {
    console.error('Error deleting kaizen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Like/Unlike kaizen
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const existingLike = await prisma.kaizenLike.findUnique({
      where: {
        kaizenId_userId: {
          kaizenId: id,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.kaizenLike.delete({
        where: {
          kaizenId_userId: {
            kaizenId: id,
            userId
          }
        }
      });

      await prisma.kaizen.update({
        where: { id },
        data: { likeCount: { decrement: 1 } }
      });

      res.json({ liked: false });
    } else {
      // Like
      await prisma.kaizenLike.create({
        data: {
          kaizenId: id,
          userId
        }
      });

      await prisma.kaizen.update({
        where: { id },
        data: { likeCount: { increment: 1 } }
      });

      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add comment to kaizen
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { content, isInternal } = req.body;

    const comment = await prisma.kaizenComment.create({
      data: {
        content,
        isInternal: isInternal === 'true',
        kaizenId: id,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update comment count
    await prisma.kaizen.update({
      where: { id },
      data: { commentCount: { increment: 1 } }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Share kaizen
export const shareKaizen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { sharedWithId, message } = req.body;

    const share = await prisma.kaizenShare.create({
      data: {
        kaizenId: id,
        sharedById: userId,
        sharedWithId,
        message
      },
      include: {
        sharedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sharedWith: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(share);
  } catch (error) {
    console.error('Error sharing kaizen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get kaizen statistics
export const getKaizenStats = async (req: Request, res: Response) => {
  try {
    const [
      totalKaizens,
      kaizensByStatus,
      kaizensByCategory,
      kaizensByMonth,
      topTags,
      topAuthors,
      recentKaizens
    ] = await Promise.all([
      // Total count
      prisma.kaizen.count(),
      
      // By status
      prisma.kaizen.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // By category
      prisma.kaizen.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      
      // By month (last 12 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "Kaizen"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `,
      
      // Top tags
      prisma.kaizenTag.findMany({
        orderBy: { usageCount: 'desc' },
        take: 10
      }),
      
      // Top authors
      prisma.kaizen.groupBy({
        by: ['authorId'],
        _count: { authorId: true },
        orderBy: { _count: { authorId: 'desc' } },
        take: 10
      }),
      
      // Recent kaizens
      prisma.kaizen.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    ]);

    // Get author names for top authors
    const authorIds = kaizensByStatus.map(item => item.authorId);
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true }
    });

    const topAuthorsWithNames = kaizensByStatus.map(item => ({
      ...item,
      author: authors.find(a => a.id === item.authorId)
    }));

    res.json({
      totalKaizens,
      kaizensByStatus,
      kaizensByCategory,
      kaizensByMonth,
      topTags,
      topAuthors: topAuthorsWithNames,
      recentKaizens
    });
  } catch (error) {
    console.error('Error fetching kaizen stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
