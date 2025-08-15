import { Request, Response } from 'express';
import { prisma } from '../db';
import { ApiError } from '../middlewares/errorHandler';
import { logActivity } from '../utils/activityLogger';

// Types
interface ApprovalDocument {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  assignedTo: string;
  assignedToId: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  currentStage: 'DESIGN' | 'KCS' | 'VERIFICATION' | 'APPRAISAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  sendDate: string;
  signDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  history: ApprovalHistory[];
  comments: ApprovalComment[];
}

interface ApprovalHistory {
  id: string;
  action: string;
  fromStage: string;
  toStage: string;
  timestamp: string;
  userId: string;
  userName: string;
  comment?: string;
}

interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  stage: string;
}

/**
 * Get all approval documents with filtering
 * @route GET /api/approvals
 */
export const getApprovalDocuments = async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      status,
      stage,
      assignedTo,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter conditions
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId as string;
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (stage) {
      where.currentStage = stage as string;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo as string;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.approvalDocument.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          history: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              timestamp: 'desc'
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              timestamp: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.approvalDocument.count({ where })
    ]);

    // Convert currentStage to lowercase for frontend compatibility and add version info
    const documentsWithLowercaseStage = documents.map(doc => ({
      ...doc,
      currentStage: doc.currentStage.toLowerCase(),
      stageDisplay: `${doc.currentStage.toLowerCase()} lần ${doc.currentVersion}`
    }));

    res.json({
      documents: documentsWithLowercaseStage,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching approval documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get approval document by ID
 * @route GET /api/approvals/:id
 */
export const getApprovalDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.approvalDocument.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        history: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Approval document not found' });
    }

    // Convert currentStage to lowercase for frontend compatibility and add version info
    const responseDocument = {
      ...document,
      currentStage: document.currentStage.toLowerCase(),
      stageDisplay: `${document.currentStage.toLowerCase()} lần ${document.currentVersion}`
    };
    res.json(responseDocument);
  } catch (error) {
    console.error('Error fetching approval document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create new approval document
 * @route POST /api/approvals
 */
export const createApprovalDocument = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedToId,
      priority = 'MEDIUM',
      category = 'Giao Thông'
    } = req.body;

    // Convert priority to uppercase to match Prisma enum
    const normalizedPriority = priority?.toUpperCase() || 'MEDIUM';

    // Validate required fields
    if (!title || !projectId || !assignedToId) {
      return res.status(400).json({ 
        error: 'Title, project ID, and assigned user are required' 
      });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if assigned user exists
    const user = await prisma.user.findUnique({
      where: { id: assignedToId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Assigned user not found' });
    }

    // Ensure user ID is available
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await prisma.approvalDocument.create({
      data: {
        title,
        description,
        projectId,
        assignedToId,
        category,
        priority: normalizedPriority,
        status: 'PENDING',
        currentStage: 'DESIGN',
        sendDate: new Date(),
        history: {
          create: {
            action: 'created',
            fromStage: '',
            toStage: 'DESIGN',
            timestamp: new Date(),
            userId: req.user.id,
            comment: 'Tạo hồ sơ mới'
          }
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Convert currentStage to lowercase for frontend compatibility
    const responseDocument = {
      ...document,
      currentStage: document.currentStage.toLowerCase()
    };

    // Log activity
    await logActivity({
      userId: req.user?.id || 'system',
      action: 'CREATE_APPROVAL_DOCUMENT',
      objectType: 'APPROVAL_DOCUMENT',
      objectId: document.id,
      description: `Created approval document: ${title}`
    });

    res.status(201).json(responseDocument);
  } catch (error) {
    console.error('Error creating approval document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update approval document status
 * @route PUT /api/approvals/:id/status
 */
export const updateApprovalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, stage, rejectionReason, comment } = req.body;

    // Ensure user ID is available
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await prisma.approvalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Approval document not found' });
    }

    // Normalize status and stage to uppercase to match Prisma enums
    const normalizedStatus = status?.toUpperCase() || 'PENDING';
    const normalizedStage = stage?.toUpperCase() || 'DESIGN';

    // Determine if we need to increment version
    let newVersion = document.currentVersion;
    let shouldIncrementVersion = false;

    // Increment version when moving to next stage or when rejected
    if (normalizedStatus === 'REJECTED') {
      shouldIncrementVersion = true;
    } else if (normalizedStage !== document.currentStage) {
      shouldIncrementVersion = true;
    }

    if (shouldIncrementVersion) {
      newVersion = document.currentVersion + 1;
    }

    const updateData: any = {
      status: normalizedStatus,
      currentStage: normalizedStage,
      currentVersion: newVersion,
      updatedAt: new Date()
    };

    if (normalizedStatus === 'APPROVED' && normalizedStage === 'APPROVED') {
      updateData.signDate = new Date();
    }

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedDocument = await prisma.approvalDocument.update({
      where: { id },
      data: {
        ...updateData,
        history: {
          create: {
            action: normalizedStatus === 'REJECTED' ? 'rejected' : 'approved',
            fromStage: document.currentStage,
            toStage: normalizedStage,
            fromVersion: document.currentVersion,
            toVersion: newVersion,
            timestamp: new Date(),
            userId: req.user.id,
            comment: comment || (normalizedStatus === 'REJECTED' ? 'Từ chối hồ sơ' : 'Phê duyệt hồ sơ')
          }
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: req.user?.id || 'system',
      action: 'UPDATE_APPROVAL_STATUS',
      objectType: 'APPROVAL_DOCUMENT',
      objectId: id,
      description: `Updated approval document status to ${normalizedStatus}`
    });

    // Convert currentStage to lowercase for frontend compatibility and add version info
    const responseDocument = {
      ...updatedDocument,
      currentStage: updatedDocument.currentStage.toLowerCase(),
      stageDisplay: `${updatedDocument.currentStage.toLowerCase()} lần ${updatedDocument.currentVersion}`
    };
    res.json(responseDocument);
  } catch (error) {
    console.error('Error updating approval status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add comment to approval document
 * @route POST /api/approvals/:id/comments
 */
export const addApprovalComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Ensure user ID is available
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const document = await prisma.approvalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Approval document not found' });
    }

    const comment = await prisma.approvalComment.create({
      data: {
        content,
        stage: document.currentStage,
        userId: req.user.id,
        approvalDocumentId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: req.user?.id || 'system',
      action: 'ADD_APPROVAL_COMMENT',
      objectType: 'APPROVAL_DOCUMENT',
      objectId: id,
      description: `Added comment to approval document`
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding approval comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete approval document
 * @route DELETE /api/approvals/:id
 */
export const deleteApprovalDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.approvalDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Approval document not found' });
    }

    // Delete related records first
    await prisma.approvalComment.deleteMany({
      where: { approvalDocumentId: id }
    });

    await prisma.approvalHistory.deleteMany({
      where: { approvalDocumentId: id }
    });

    await prisma.approvalDocument.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: req.user?.id || 'system',
      action: 'DELETE_APPROVAL_DOCUMENT',
      objectType: 'APPROVAL_DOCUMENT',
      objectId: id,
      description: `Deleted approval document: ${document.title}`
    });

    res.json({ message: 'Approval document deleted successfully' });
  } catch (error) {
    console.error('Error deleting approval document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update approval document
 * @route PUT /api/approvals/:id
 */
export const updateApprovalDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      projectId,
      assignedToId,
      category,
      priority
    } = req.body;

    // Check if document exists
    const existingDocument = await prisma.approvalDocument.findUnique({
      where: { id }
    });

    if (!existingDocument) {
      return res.status(404).json({ error: 'Approval document not found' });
    }

    // Normalize priority to uppercase
    const normalizedPriority = priority?.toUpperCase() || existingDocument.priority;

    // Update document
    const updatedDocument = await prisma.approvalDocument.update({
      where: { id },
      data: {
        title,
        description,
        projectId,
        assignedToId,
        category,
        priority: normalizedPriority
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true
          }
        },
        history: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    // Add history entry
    await prisma.approvalHistory.create({
      data: {
        approvalDocumentId: id,
        action: 'updated',
        fromStage: existingDocument.currentStage,
        toStage: updatedDocument.currentStage,
        userId: req.user.id,
        comment: 'Document information updated'
      }
    });

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE_APPROVAL_DOCUMENT',
      objectType: 'APPROVAL_DOCUMENT',
      objectId: id,
      description: `Updated approval document: ${updatedDocument.title}`
    });

    // Transform response to match frontend expectations
    const response = {
      ...updatedDocument,
      projectName: updatedDocument.project.name,
      assignedTo: updatedDocument.assignedUser.name,
      currentStage: updatedDocument.currentStage.toLowerCase(),
      status: updatedDocument.status.toLowerCase(),
      priority: updatedDocument.priority.toLowerCase(),
      history: updatedDocument.history.map(h => ({
        ...h,
        userName: h.user.name
      })),
      comments: updatedDocument.comments.map(c => ({
        ...c,
        userName: c.user.name
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating approval document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get approval statistics
 * @route GET /api/approvals/stats
 */
export const getApprovalStats = async (req: Request, res: Response) => {
  try {
    const [total, pending, approved, rejected, completed] = await Promise.all([
      prisma.approvalDocument.count(),
      prisma.approvalDocument.count({ where: { status: 'PENDING' } }),
      prisma.approvalDocument.count({ where: { status: 'APPROVED' } }),
      prisma.approvalDocument.count({ where: { status: 'REJECTED' } }),
      prisma.approvalDocument.count({ where: { status: 'APPROVED' } })
    ]);

    const stageStats = await Promise.all([
      prisma.approvalDocument.count({ where: { currentStage: 'DESIGN' } }),
              prisma.approvalDocument.count({ where: { currentStage: 'KCS' } }),
              prisma.approvalDocument.count({ where: { currentStage: 'VERIFICATION' } }),
              prisma.approvalDocument.count({ where: { currentStage: 'APPRAISAL' } })
    ]);

    const priorityStats = await Promise.all([
      prisma.approvalDocument.count({ where: { priority: 'LOW' } }),
      prisma.approvalDocument.count({ where: { priority: 'MEDIUM' } }),
      prisma.approvalDocument.count({ where: { priority: 'HIGH' } })
    ]);

    // Thống kê theo hạng mục
    const categoryStats = await prisma.approvalDocument.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    // Thống kê theo dự án
    const projectStats = await prisma.approvalDocument.groupBy({
      by: ['projectId'],
      _count: {
        projectId: true
      }
    });

    // Lấy thông tin dự án
    const projectIds = projectStats.map(stat => stat.projectId);
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds }
      },
      select: {
        id: true,
        name: true
      }
    });

    const projectMap = projects.reduce((acc, project) => {
      acc[project.id] = project.name;
      return acc;
    }, {} as any);

    res.json({
      total,
      statusStats: {
        pending,
        approved,
        rejected,
        completed
      },
      stageStats: {
        design: stageStats[0],
        kcs: stageStats[1],
        verification: stageStats[2],
        appraisal: stageStats[3]
      },
      priorityStats: {
        low: priorityStats[0],
        medium: priorityStats[1],
        high: priorityStats[2]
      },
      categoryStats: categoryStats.reduce((acc, stat) => {
        acc[stat.category] = stat._count.category;
        return acc;
      }, {} as any),
      projectStats: projectStats.map(stat => ({
        projectId: stat.projectId,
        projectName: projectMap[stat.projectId] || 'Unknown',
        count: stat._count.projectId
      }))
    });
  } catch (error) {
    console.error('Error fetching approval stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
