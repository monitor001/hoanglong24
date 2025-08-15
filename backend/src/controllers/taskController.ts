import { Request, Response } from 'express';
import { TaskStatus, Priority } from '@prisma/client';
import { Server } from 'socket.io';
import { ApiError } from '../middlewares/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { generateTaskCode } from '../utils/codeGenerator';
import { 
  sendTaskAssignmentNotification, 
  sendTaskCompletionNotification 
} from '../utils/taskNotification';
import { prisma } from '../db';
import { PermissionUtils } from '../utils/permissionUtils';

declare const io: Server;

/**
 * Get all tasks with enhanced filtering and pagination
 * @route GET /api/tasks
 */
export const getTasks = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      status, 
      priority, 
      assigneeId, 
      projectId,
      search,
      category,
      dueDateRange,
      overdue,
      upcoming,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Build enhanced filter conditions
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    
    if (projectId) {
      where.projectId = projectId;
    }

    if (category) {
      where.category = category;
    }
    
    // Enhanced search with multiple fields
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
        { assignee: { name: { contains: search as string, mode: 'insensitive' } } },
        { project: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    // Date range filtering
    if (dueDateRange) {
      const [startDate, endDate] = (dueDateRange as string).split(',');
      if (startDate && endDate) {
        where.dueDate = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }
    }

    // Overdue tasks filter
    if (overdue === 'true') {
      where.AND = [
        { dueDate: { lt: new Date() } },
        { status: { notIn: ['COMPLETED'] } }
      ];
    }

    // Upcoming tasks filter (due within 7 days)
    if (upcoming === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      where.AND = [
        { dueDate: { gte: new Date(), lte: sevenDaysFromNow } },
        { status: { notIn: ['COMPLETED'] } }
      ];
    }

    // Check user permissions
    if (req.user?.role !== 'ADMIN') {
      // Users can only see tasks from projects they're members of
      const userProjects = await prisma.projectMember.findMany({
        where: { userId: req.user?.id },
        select: { projectId: true }
      });
      
      const projectIds = userProjects.map(pm => pm.projectId);
      where.projectId = { in: projectIds };
    }

    // Enhanced sorting
    const orderBy: any[] = [];
    if (sortBy === 'dueDate') {
      orderBy.push({ dueDate: sortOrder });
    } else if (sortBy === 'priority') {
      orderBy.push({ priority: sortOrder });
    } else if (sortBy === 'status') {
      orderBy.push({ status: sortOrder });
    } else if (sortBy === 'createdAt') {
      orderBy.push({ createdAt: sortOrder });
    } else if (sortBy === 'assignee') {
      orderBy.push({ assignee: { name: sortOrder } });
    }
    
    // Default sorting for better UX
    if (orderBy.length === 0) {
      orderBy.push(
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      );
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
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
            orderBy: { createdAt: 'desc' }
          },
          documents: {
            include: {
              document: {
                select: {
                  id: true,
                  name: true,
                  fileUrl: true
                }
              }
            }
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              comments: true,
              documents: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit as string)
      }),
      prisma.task.count({ where })
    ]);

    // Add computed fields for better UX
    const enhancedTasks = tasks.map(task => {
      const now = new Date();
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      
      let urgencyLevel = 'normal';
      let daysUntilDue = null;
      let isOverdue = false;
      let isWarning = false; // Cảnh báo trước 3 ngày
      
      if (dueDate && task.status !== 'COMPLETED') {
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
        ...task,
        urgencyLevel,
        daysUntilDue,
        isOverdue,
        isWarning
      };
    });

    res.status(200).json({
      tasks: enhancedTasks,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      },
      filters: {
        applied: {
          status,
          priority,
          assigneeId,
          projectId,
          search,
          category,
          dueDateRange,
          overdue,
          upcoming
        },
        available: {
          statuses: Object.values(TaskStatus),
          priorities: Object.values(Priority),
          categories: await getTaskCategories()
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Get task by ID
 * @route GET /api/tasks/:id
 */
export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                fileUrl: true,
                fileType: true,
                version: true
              }
            }
          }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if user has access to this task
    if (req.user?.role !== 'ADMIN') {
      const isProjectMember = task.project.members.some(
        (member: any) => member.user.id === req.user?.id
      );
      
      if (!isProjectMember) {
        throw new ApiError(403, 'You do not have access to this task');
      }
    }

    res.status(200).json(task);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }
};

/**
 * Create new task
 * @route POST /api/tasks
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, dueDate, startDate, assigneeId, projectId, priority, category } = req.body;

    // Tạm thời bypass permission check để test
    /*
    // Check permission to create tasks
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'create_tasks'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to create tasks');
      }
    }
    */

    // Validate required fields
    if (!title || !status || !projectId) {
      console.error('❌ Validation failed:', { title, status, projectId });
      throw new ApiError(400, 'Title, status, and project ID are required');
    }

    if (typeof title !== 'string' || title.trim().length < 3) {
      throw new ApiError(400, 'Task title must be at least 3 characters');
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Tạm thời bypass project access check
    /*
    if (req.user?.role !== 'ADMIN') {
      const isProjectMember = project.members.some(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!isProjectMember) {
        throw new ApiError(403, 'You do not have access to this project');
      }

      // Only project managers and BIM managers can create tasks
      const userMembership = project.members.find(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!['PROJECT_MANAGER', 'BIM_MANAGER'].includes(userMembership?.role || '')) {
        throw new ApiError(403, 'You do not have permission to create tasks in this project');
      }
    }
    */

    // Check if assignee exists and is a project member
    if (assigneeId) {
      try {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!assignee) {
        throw new ApiError(404, 'Assignee not found');
      }

      const isAssigneeMember = project.members.some(
        (member: any) => member.userId === assigneeId
      );

      if (!isAssigneeMember) {
        throw new ApiError(400, 'Assignee must be a member of the project');
        }
      } catch (error) {
        console.error('Error checking assignee:', error);
        throw new ApiError(400, 'Invalid assignee ID or user not found');
      }
    }

    // Generate task code
    const taskCode = generateTaskCode(title.trim(), project.code);
    
    // Create task
    const task = await prisma.task.create({
      data: {
        code: taskCode,
        title: title.trim(),
        description: description?.trim() || null,
        status: status as TaskStatus,
        priority: (priority as Priority) || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        assigneeId: assigneeId || null,
        projectId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Create task history
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        action: 'TASK_CREATED',
        details: `Task "${task.title}" created`,
        userId: req.user?.id as string
      }
    });

    // Emit socket event
    if (typeof io !== 'undefined') {
      io.to(`project:${projectId}`).emit('task:created', {
        task,
        createdBy: req.user?.id
      });
    }

    // Send assignment notification if assignee is set
    if (assigneeId) {
      await sendTaskAssignmentNotification(task.id, assigneeId);
    }
    
    // Notify task creation via Socket.IO
    global.io.to(`project:${projectId}`).emit('task:created', {
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId
      },
      createdBy: req.user?.id
    });
    
    // Log activity
    if (req.user?.id) {
      await logActivity({
        userId: req.user.id,
        action: 'create',
        objectType: 'task',
        objectId: task.id,
        description: `Tạo công việc "${task.title}"`
      });
    }
    
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
};

/**
 * Update task
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, startDate, assigneeId, priority, category } = req.body;

    // Check permission to edit tasks
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'edit_tasks'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to edit tasks');
      }
    }

    // Find existing task
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!existingTask) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if user has access to this task
    if (req.user?.role !== 'ADMIN') {
      const isProjectMember = existingTask.project.members.some(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!isProjectMember) {
        throw new ApiError(403, 'You do not have access to this task');
      }

      // Only project managers, BIM managers, or the assignee can update tasks
      const userMembership = existingTask.project.members.find(
        (member: any) => member.userId === req.user?.id
      );
      
      const canUpdate = ['PROJECT_MANAGER', 'BIM_MANAGER'].includes(userMembership?.role || '') ||
                       existingTask.assigneeId === req.user?.id;

      if (!canUpdate) {
        throw new ApiError(403, 'You do not have permission to update this task');
      }
    }

    // Check if assignee exists and is a project member
    if (assigneeId && assigneeId !== existingTask.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });

      if (!assignee) {
        throw new ApiError(404, 'Assignee not found');
      }

      const isAssigneeMember = existingTask.project.members.some(
        (member: any) => member.userId === assigneeId
      );

      if (!isAssigneeMember) {
        throw new ApiError(400, 'Assignee must be a member of the project');
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 3) {
        throw new ApiError(400, 'Task title must be at least 3 characters');
      }
      updateData.title = title.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    
    if (status !== undefined) {
      updateData.status = status as TaskStatus;
    }
    
    if (priority !== undefined) {
      updateData.priority = priority as Priority;
    }
    
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    
    if (assigneeId !== undefined) {
      updateData.assigneeId = assigneeId || null;
    }
    
    if (category !== undefined) {
      updateData.category = category || 'OTHER';
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    // Create task history
    await prisma.taskHistory.create({
      data: {
        taskId: updatedTask.id,
        action: 'TASK_UPDATED',
        details: `Task "${updatedTask.title}" updated`,
        userId: req.user?.id as string
      }
    });

    // Send notifications based on changes
    const previousStatus = existingTask.status;
    const previousAssigneeId = existingTask.assigneeId;
    
    // Send completion notification if task was completed
    if (status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      await sendTaskCompletionNotification(updatedTask.id);
    }
    
    // Send assignment notification if assignee changed
    if (assigneeId && assigneeId !== previousAssigneeId) {
      await sendTaskAssignmentNotification(updatedTask.id, assigneeId);
    }
    
    // Emit socket event
    if (typeof io !== 'undefined') {
      io.to(`project:${existingTask.projectId}`).emit('task:updated', {
        task: updatedTask,
        updatedBy: req.user?.id
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
};

/**
 * Delete task
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check permission to delete tasks
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'delete_tasks'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to delete tasks');
      }
    }

    // Find existing task
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!existingTask) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if user has permission to delete this task
    if (req.user?.role !== 'ADMIN') {
      const isProjectMember = existingTask.project.members.some(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!isProjectMember) {
        throw new ApiError(403, 'You do not have access to this task');
      }

      // Only project managers and BIM managers can delete tasks
      const userMembership = existingTask.project.members.find(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!['PROJECT_MANAGER', 'BIM_MANAGER'].includes(userMembership?.role || '')) {
        throw new ApiError(403, 'You do not have permission to delete this task');
      }
    }

    // Delete related records first
    await prisma.comment.deleteMany({
      where: { taskId: id }
    });

    await prisma.taskDocument.deleteMany({
      where: { taskId: id }
    });

    await prisma.taskHistory.deleteMany({
      where: { taskId: id }
    });

    // Delete task
    await prisma.task.delete({
      where: { id }
    });

    // Emit socket event
    if (typeof io !== 'undefined') {
      io.to(`project:${existingTask.projectId}`).emit('task:deleted', {
        taskId: id,
        deletedBy: req.user?.id
      });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
};

/**
 * Add comment to task
 * @route POST /api/tasks/:id/comments
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check permission to comment on tasks
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'comment_tasks'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to comment on tasks');
      }
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ApiError(400, 'Comment content is required');
    }

    // Check if task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    if (req.user?.role !== 'ADMIN') {
      const isProjectMember = task.project.members.some(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!isProjectMember) {
        throw new ApiError(403, 'You do not have access to this task');
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId: id,
        userId: req.user?.id as string
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emit socket event
    if (typeof io !== 'undefined') {
      io.to(`project:${task.projectId}`).emit('task:comment:added', {
        taskId: id,
        comment,
        addedBy: req.user?.id
      });
    }

    // Notify comment creation via Socket.IO
    global.io.to(`task:${id}`).emit('task:comment:created', {
      taskId: id,
      comment: {
        id: comment.id,
        content: comment.content,
        user: comment.user
      },
      createdBy: req.user?.id
    });
    
    // Log activity
    if (req.user?.id) {
      await logActivity({
        userId: req.user.id,
        action: 'comment',
        objectType: 'task',
        objectId: id,
        description: `Thêm bình luận cho công việc "${task.title}"`
      });
    }
    
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }
};

/**
 * Get task history
 * @route GET /api/tasks/:id/history
 */
export const getTaskHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;

    // Check permission to view task history
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'view_task_history'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to view task history');
      }
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Check if task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    if (req.user?.role !== 'ADMIN') {
      const isProjectMember = task.project.members.some(
        (member: any) => member.userId === req.user?.id
      );
      
      if (!isProjectMember) {
        throw new ApiError(403, 'You do not have access to this task');
      }
    }

    // Get task history
    const [history, total] = await Promise.all([
      prisma.taskHistory.findMany({
        where: { taskId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.taskHistory.count({
        where: { taskId: id }
      })
    ]);

    res.status(200).json({
      history,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get task history error:', error);
      res.status(500).json({ error: 'Failed to fetch task history' });
    }
  }
}; 

/**
 * Get task categories for filtering
 */
const getTaskCategories = async () => {
  const categories = await prisma.task.findMany({
    select: { category: true },
    where: { category: { not: null } },
    distinct: ['category']
  });
  return categories.map(c => c.category).filter(Boolean);
};

/**
 * Get overdue and warning tasks (overdue + due within 3 days)
 * @route GET /api/tasks/overdue
 */
export const getOverdueTasks = async (req: Request, res: Response) => {
  try {
    const { userId, includeWarnings = 'true' } = req.query;

    // Check permission to view overdue tasks
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'view_overdue_tasks'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to view overdue tasks');
      }
    }
    
    // Tính toán ngày 3 ngày tới
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const where: any = {
      status: { notIn: ['COMPLETED'] }
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

    const tasks = await prisma.task.findMany({
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
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    // Phân loại tasks thành overdue và warning
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.dueDate && task.dueDate < now
    );
    const warningTasks = tasks.filter(task => 
      task.dueDate && task.dueDate >= now && task.dueDate <= threeDaysFromNow
    );

    // Calculate statistics
    const stats = {
      total: tasks.length,
      overdue: overdueTasks.length,
      warnings: warningTasks.length,
      byPriority: {
        URGENT: tasks.filter(t => t.priority === 'URGENT').length,
        HIGH: tasks.filter(t => t.priority === 'HIGH').length,
        MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
        LOW: tasks.filter(t => t.priority === 'LOW').length
      },
      byProject: {}
    };

    // Group by project
    tasks.forEach(task => {
      const projectName = task.project.name;
      if (!stats.byProject[projectName]) {
        stats.byProject[projectName] = { overdue: 0, warnings: 0, total: 0 };
      }
      if (task.dueDate && task.dueDate < now) {
        stats.byProject[projectName].overdue++;
      } else if (task.dueDate && task.dueDate >= now && task.dueDate <= threeDaysFromNow) {
        stats.byProject[projectName].warnings++;
      }
      stats.byProject[projectName].total++;
    });

    res.status(200).json({
      tasks: tasks.map(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const isOverdue = dueDate && dueDate < now;
        const isWarning = dueDate && dueDate >= now && dueDate <= threeDaysFromNow;
        
        return {
          ...task,
          daysUntilDue,
          isOverdue,
          isWarning,
          urgencyLevel: isOverdue ? 'critical' : isWarning ? 'high' : 'normal'
        };
      }),
      stats,
      overdueTasks,
      warningTasks
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
};

/**
 * Get upcoming tasks (due within specified days)
 * @route GET /api/tasks/upcoming
 */
export const getUpcomingTasks = async (req: Request, res: Response) => {
  try {
    const { days = '7', userId } = req.query;

    // Check permission to view upcoming tasks
    if (req.user?.role !== 'ADMIN') {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user?.id || '',
        permission: 'view_upcoming_tasks'
      });

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to view upcoming tasks');
      }
    }
    const daysFromNow = parseInt(days as string);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    
    const where: any = {
      dueDate: {
        gte: new Date(),
        lte: futureDate
      },
      status: { notIn: ['COMPLETED'] }
    };

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

    const upcomingTasks = await prisma.task.findMany({
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
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    res.status(200).json({
      tasks: upcomingTasks,
      daysFromNow,
      total: upcomingTasks.length
    });
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
  }
}; 