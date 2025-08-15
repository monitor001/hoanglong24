import { Request, Response } from 'express';
import { ApiError } from '../middlewares/errorHandler';
import path from 'path';
import fs from 'fs';
import { logActivity } from '../utils/activityLogger';
import { uploadFileToCloudinary } from '../services/cloudinaryService';
import { prisma } from '../db';
import { generateIssueCode } from '../utils/codeGenerator';

// Lấy danh sách issue (có filter, phân trang)
export const getIssues = async (req: Request, res: Response) => {
  try {
    const { projectId, status, priority, type, search, page = 1, limit = 20 } = req.query;
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Handle status filtering including overdue and warnings
    if (status) {
      if (status === 'OVERDUE') {
        // Filter by actual overdue condition (due date < today) and not completed
        where.AND = [
          { dueDate: { lt: new Date() } },
          { status: { notIn: ['RESOLVED', 'CLOSED'] } }
        ];
      } else if (status === 'WARNING') {
        // Filter by warning condition (due within 3 days) and not completed
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        where.AND = [
          { dueDate: { gte: new Date(), lte: threeDaysFromNow } },
          { status: { notIn: ['RESOLVED', 'CLOSED'] } }
        ];
      } else {
        where.status = status;
      }
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          project: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.issue.count({ where })
    ]);

    // Add computed fields for better UX
    const enhancedIssues = issues.map(issue => {
      const now = new Date();
      const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
      
      let urgencyLevel = 'normal';
      let daysUntilDue = null;
      let isOverdue = false;
      let isWarning = false; // Cảnh báo trước 3 ngày
      
      if (dueDate && !['RESOLVED', 'CLOSED'].includes(issue.status)) {
        daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        isOverdue = dueDate < now;
        isWarning = daysUntilDue <= 3 && daysUntilDue > 0; // Cảnh báo trước 3 ngày
        
        if (isOverdue) {
          urgencyLevel = 'critical';
        } else if (isWarning) {
          urgencyLevel = 'high';
        } else if (daysUntilDue <= 1) {
          urgencyLevel = 'urgent';
        } else if (daysUntilDue <= 7) {
          urgencyLevel = 'medium';
        }
      }

      return {
        ...issue,
        urgencyLevel,
        daysUntilDue,
        isOverdue,
        isWarning
      };
    });

    res.json({ 
      issues: enhancedIssues, 
      total, 
      page: Number(page), 
      limit: Number(limit) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

// Lấy chi tiết issue
export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
};

// Tạo mới issue
export const createIssue = async (req: Request, res: Response) => {
  try {
    const { code, title, description, type, status, priority, dueDate, projectId, assigneeId, attachments } = req.body;
    const createdById = req.user?.id;
    if (!title || !type || !status || !priority || !projectId) {
      throw new ApiError(400, 'Missing required fields');
    }
    
    // Tự động tạo code nếu không có
    let issueCode = code;
    if (!issueCode) {
      issueCode = generateIssueCode(type);
    }

    // Xử lý attachments và nhúng ảnh vào description
    let enhancedDescription = description || '';
    let processedAttachments: any[] = [];

    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.type === 'image/png' && attachment.url) {
          // Nhúng ảnh screenshot vào description
          enhancedDescription += `\n\n![Screenshot](${attachment.url})`;
        } else {
          // Thêm file khác vào attachments
          processedAttachments.push({
            originalname: attachment.name,
            filename: attachment.name,
            mimetype: attachment.type,
            size: attachment.size,
            url: attachment.url
          });
        }
      }
    }
    
    const issue = await prisma.issue.create({
      data: {
        code: issueCode,
        title,
        description: enhancedDescription,
        type,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        createdById,
        assigneeId,
      }
    });
    // Ghi log audit trail
    if (createdById) {
      await logActivity({
        userId: createdById,
        action: 'create',
        objectType: 'issue',
        objectId: issue.id,
        description: `Tạo vấn đề mới: "${title}"`,
        notify: true
      });
    }
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error in createIssue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

// Cập nhật issue
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, status, priority, dueDate, assigneeId } = req.body;
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new ApiError(404, 'Issue not found');
    // Phân quyền: chỉ ADMIN, PROJECT_MANAGER, BIM_MANAGER, người tạo hoặc assignee được sửa
    if (
      req.user?.role !== 'ADMIN' &&
      req.user?.role !== 'PROJECT_MANAGER' &&
      req.user?.role !== 'BIM_MANAGER' &&
      req.user?.id !== issue.createdById &&
      req.user?.id !== issue.assigneeId
    ) {
      throw new ApiError(403, 'No permission to update this issue');
    }
    const updated = await prisma.issue.update({
      where: { id },
      data: { title, description, type, status, priority, dueDate: dueDate ? new Date(dueDate) : null, assigneeId }
    });
    // Ghi log audit trail
    if (req.user?.id) {
      await logActivity({
        userId: req.user.id,
        action: 'update',
        objectType: 'issue',
        objectId: id,
        description: `Cập nhật vấn đề: "${title}"`,
        notify: true
      });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue' });
  }
};

// Xoá issue
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new ApiError(404, 'Issue not found');
    // Phân quyền: chỉ ADMIN, PROJECT_MANAGER, BIM_MANAGER, người tạo hoặc assignee được xoá
    if (
      req.user?.role !== 'ADMIN' &&
      req.user?.role !== 'PROJECT_MANAGER' &&
      req.user?.role !== 'BIM_MANAGER' &&
      req.user?.id !== issue.createdById &&
      req.user?.id !== issue.assigneeId
    ) {
      throw new ApiError(403, 'No permission to delete this issue');
    }
    await prisma.issue.delete({ where: { id } });
    // Ghi log audit trail
    if (req.user?.id) {
      await logActivity({
        userId: req.user.id,
        action: 'delete',
        objectType: 'issue',
        objectId: id,
        description: `Xoá vấn đề: "${issue.title}"`,
        notify: true
      });
    }
    res.json({ message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete issue' });
  }
};

// Lấy danh sách comment của issue
export const getIssueComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { issueId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Tạo comment cho issue (hỗ trợ upload file lên OneDrive)
export const createIssueComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    type Attachment = { 
      originalname: string; 
      filename: string; 
      mimetype: string; 
      size: number; 
      url: string;
      oneDriveId?: string;
      downloadUrl?: string;
    };
    let attachments: Attachment[] | undefined = undefined;
    
    if (req.files && Array.isArray(req.files)) {
      // Upload files lên OneDrive sử dụng tài khoản có sẵn
      attachments = [];
      for (const file of req.files) {
        console.log('Processing file for upload:', {
          originalname: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
        
        try {
          const fileBuffer = fs.readFileSync(file.path);
          console.log('File buffer size:', fileBuffer.length);
          console.log('Starting OneDrive upload for file:', file.originalname);
          
          const uploadResult = await uploadFileToCloudinary({
            issueId: id,
            file: fileBuffer,
            filename: file.originalname
          });
          
          console.log('OneDrive upload successful:', {
            originalname: file.originalname,
            fileId: uploadResult.fileId,
            shareLink: uploadResult.shareLink,
            downloadUrl: uploadResult.downloadUrl
          });
          
          attachments.push({
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: uploadResult.shareLink,
            oneDriveId: uploadResult.fileId,
            downloadUrl: uploadResult.downloadUrl
          });
          
          // Xóa file tạm sau khi upload
          fs.unlinkSync(file.path);
          console.log('Local temp file deleted:', file.path);
        } catch (uploadError) {
          console.error('Cloudinary upload error for file:', file.originalname, uploadError);
          // Fallback: lưu local nếu upload Cloudinary thất bại
          console.log('Using local fallback for file:', file.originalname);
          
          // Đảm bảo file được copy đến thư mục uploads
          const uploadsDir = path.join(__dirname, '../../uploads');
          const targetPath = path.join(uploadsDir, file.filename);
          
          try {
            // Copy file từ temp đến uploads directory
            fs.copyFileSync(file.path, targetPath);
            console.log('File copied to uploads directory:', targetPath);
            
            attachments.push({
              originalname: file.originalname,
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size,
              url: `/uploads/${file.filename}`
            });
          } catch (copyError) {
            console.error('Failed to copy file to uploads directory:', copyError);
            // Nếu không copy được, vẫn giữ file temp
            attachments.push({
              originalname: file.originalname,
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size,
              url: `/uploads/${file.filename}`
            });
          }
        }
      }
    }
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized: missing user id' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        issueId: id,
        userId: req.user.id,
        attachments: attachments ? attachments : undefined
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    
    // Ghi log audit trail
    await logActivity({
      userId: req.user.id,
      action: 'comment',
      objectType: 'issue',
      objectId: id,
      description: `Thêm bình luận cho vấn đề: ${content?.slice(0, 100)}`,
      notify: true
    });
    
    // Phát socket cho realtime
    const issue = await prisma.issue.findUnique({ where: { id }, select: { projectId: true } });
    if (global.io) {
      if (issue?.projectId) {
        global.io.to(`project:${issue.projectId}`).emit('issue:comment:created', { issueId: id, comment });
      } else {
        global.io.emit('issue:comment:created', { issueId: id, comment });
      }
    }
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}; 

// Xóa comment (chỉ admin hoặc người tạo comment)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Tìm comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { 
        user: { select: { id: true, name: true } },
        issue: { select: { projectId: true } }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Kiểm tra quyền: admin hoặc người tạo comment
    const canDelete = req.user.role === 'ADMIN' || comment.userId === req.user.id;
    if (!canDelete) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    // Xóa comment
    await prisma.comment.delete({
      where: { id: commentId }
    });

    // Ghi log audit trail
    await logActivity({
      userId: req.user.id,
      action: 'delete',
      objectType: 'comment',
      objectId: commentId,
      description: `Xóa bình luận: ${comment.content?.slice(0, 100)}`,
      notify: true
    });

    // Phát socket cho realtime
    if (global.io && comment.issue?.projectId) {
      global.io.to(`project:${comment.issue.projectId}`).emit('issue:comment:deleted', { 
        issueId: id, 
        commentId: commentId 
      });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}; 

/**
 * Get overdue and warning issues (overdue + due within 3 days)
 * @route GET /api/issues/overdue
 */
export const getOverdueIssues = async (req: Request, res: Response) => {
  try {
    const { userId, includeWarnings = 'true' } = req.query;
    
    // Tính toán ngày 3 ngày tới
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const where: any = {
      status: { notIn: ['RESOLVED', 'CLOSED'] }
    };

    // Nếu includeWarnings = true, lấy cả overdue và warning (trước 3 ngày)
    if (includeWarnings === 'true') {
      where.dueDate = {
        lte: threeDaysFromNow
      };
    } else {
      // Chỉ lấy overdue
      where.dueDate = { lt: new Date() };
    }

    // Filter by user if specified
    if (userId) {
      where.assigneeId = userId;
    }

    // Check user permissions
    if (req.user?.role !== 'ADMIN') {
      const userProjects = await prisma.projectMember.findMany({
        where: { userId: req.user?.id },
        select: { projectId: true }
      });
      
      const projectIds = userProjects.map(pm => pm.projectId);
      where.projectId = { in: projectIds };
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        assignee: {
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    // Phân loại issues thành overdue và warning
    const now = new Date();
    const overdueIssues = issues.filter(issue => 
      issue.dueDate && issue.dueDate < now
    );
    const warningIssues = issues.filter(issue => 
      issue.dueDate && issue.dueDate >= now && issue.dueDate <= threeDaysFromNow
    );

    // Calculate statistics
    const stats = {
      total: issues.length,
      overdue: overdueIssues.length,
      warnings: warningIssues.length,
      byPriority: {
        HIGH: issues.filter(i => i.priority === 'HIGH').length,
        MEDIUM: issues.filter(i => i.priority === 'MEDIUM').length,
        LOW: issues.filter(i => i.priority === 'LOW').length
      },
      byType: {
        ISSUE: issues.filter(i => i.type === 'ISSUE').length,
        RFI: issues.filter(i => i.type === 'RFI').length
      },
      byProject: {}
    };

    // Group by project
    issues.forEach(issue => {
      const projectName = issue.project?.name || 'Unknown';
      if (!stats.byProject[projectName]) {
        stats.byProject[projectName] = { overdue: 0, warnings: 0, total: 0 };
      }
      if (issue.dueDate && issue.dueDate < now) {
        stats.byProject[projectName].overdue++;
      } else if (issue.dueDate && issue.dueDate >= now && issue.dueDate <= threeDaysFromNow) {
        stats.byProject[projectName].warnings++;
      }
      stats.byProject[projectName].total++;
    });

    res.status(200).json({
      issues: issues.map(issue => {
        const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
        const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const isOverdue = dueDate && dueDate < now;
        const isWarning = dueDate && dueDate >= now && dueDate <= threeDaysFromNow;
        
        return {
          ...issue,
          daysUntilDue,
          isOverdue,
          isWarning,
          urgencyLevel: isOverdue ? 'critical' : isWarning ? 'high' : 'normal'
        };
      }),
      stats,
      overdueIssues,
      warningIssues
    });
  } catch (error) {
    console.error('Get overdue issues error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue issues' });
  }
}; 