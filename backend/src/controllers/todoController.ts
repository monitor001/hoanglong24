import { Request, Response } from 'express';
import { TodoPriority } from '@prisma/client';
import { ApiError } from '../middlewares/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { prisma } from '../db';

/**
 * Get all todos for a user
 * @route GET /api/todos
 */
export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    res.json({
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate.toISOString(),
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        userId: todo.userId,
        userName: todo.user.name
      }))
    });
  } catch (error) {
    console.error('Error fetching all todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

/**
 * Get todos by specific date
 * @route GET /api/todos/date
 */
export const getTodosByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const targetDate = new Date(date as string);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const todos = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: {
          gte: targetDate,
          lt: nextDay
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    res.json({
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate.toISOString(),
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        userId: todo.userId,
        userName: todo.user.name
      }))
    });
  } catch (error) {
    console.error('Error fetching todos by date:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

/**
 * Get a single todo by ID
 * @route GET /api/todos/:id
 */
export const getTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId
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

    if (!todo) {
      throw new ApiError(404, 'Todo not found');
    }

    res.json({
      ...todo,
      userName: todo.user.name
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Create a new todo
 * @route POST /api/todos
 */
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description, priority = 'MEDIUM', dueDate } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    if (!dueDate) {
      throw new ApiError(400, 'Due date is required');
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: (priority as string).toUpperCase() as TodoPriority,
        dueDate: new Date(dueDate),
        userId
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

    // Log activity
    await logActivity({
      action: 'CREATE_TODO',
      userId,
      objectType: 'TODO',
      objectId: todo.id,
      description: `Created todo: ${title}`
    });

    res.status(201).json({
      ...todo,
      userName: todo.user.name
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error creating todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Update a todo
 * @route PUT /api/todos/:id
 */
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingTodo) {
      throw new ApiError(404, 'Todo not found');
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        description,
        priority: priority ? (priority as string).toUpperCase() as TodoPriority : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
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

    // Log activity
    await logActivity({
      action: 'UPDATE_TODO',
      userId,
      objectType: 'TODO',
      objectId: todo.id,
      description: `Updated todo: ${title}`
    });

    res.json({
      ...todo,
      userName: todo.user.name
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Toggle todo completion status
 * @route PATCH /api/todos/:id/toggle
 */
export const toggleTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingTodo) {
      throw new ApiError(404, 'Todo not found');
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        completed: !existingTodo.completed
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

    // Log activity
    await logActivity({
      action: 'TOGGLE_TODO',
      userId,
      objectType: 'TODO',
      objectId: todo.id,
      description: `${todo.completed ? 'Completed' : 'Uncompleted'} todo: ${todo.title}`
    });

    res.json({
      ...todo,
      userName: todo.user.name
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error toggling todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Delete a todo
 * @route DELETE /api/todos/:id
 */
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingTodo) {
      throw new ApiError(404, 'Todo not found');
    }

    await prisma.todo.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      action: 'DELETE_TODO',
      userId,
      objectType: 'TODO',
      objectId: id,
      description: `Deleted todo: ${existingTodo.title}`
    });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get todo statistics
 * @route GET /api/todos/stats
 */
export const getTodoStats = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const where: any = { userId };

    if (date) {
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.dueDate = {
        gte: targetDate,
        lt: nextDay
      };
    }

    // Get basic stats
    const total = await prisma.todo.count({ where });
    const completed = await prisma.todo.count({
      where: { ...where, completed: true }
    });
    const pending = total - completed;

    // Get priority distribution
    const priorityStats = await prisma.todo.groupBy({
      by: ['priority'],
      where,
      _count: {
        priority: true
      }
    });

    // Get completion rate by date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const dailyStats = await Promise.all(
      last7Days.map(async (dateStr) => {
        const dayStart = new Date(dateStr);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayTodos = await prisma.todo.count({
          where: {
            ...where,
            dueDate: {
              gte: dayStart,
              lt: dayEnd
            }
          }
        });

        const dayCompleted = await prisma.todo.count({
          where: {
            ...where,
            dueDate: {
              gte: dayStart,
              lt: dayEnd
            },
            completed: true
          }
        });

        return {
          date: dateStr,
          total: dayTodos,
          completed: dayCompleted,
          completionRate: dayTodos > 0 ? Math.round((dayCompleted / dayTodos) * 100) : 0
        };
      })
    );

    res.json({
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityDistribution: priorityStats.reduce((acc, stat) => {
        acc[stat.priority.toLowerCase()] = stat._count.priority;
        return acc;
      }, {} as any),
      dailyStats: dailyStats.reverse()
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching todo stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}; 

/**
 * Get todos by date range
 * @route GET /api/todos/range
 */
export const getTodosByRange = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const userId = req.user?.id;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Add one day to end date to include the end date
    endDate.setDate(endDate.getDate() + 1);

    const todos = await prisma.todo.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lt: endDate
        },
        userId: userId
      },
      orderBy: {
        dueDate: 'asc'
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

    res.json({
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate.toISOString(),
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        userId: todo.userId,
        userName: todo.user.name
      }))
    });
  } catch (error) {
    console.error('Error fetching todos by range:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
}; 