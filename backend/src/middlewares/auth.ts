import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
      };
    }
  }
}

/**
 * Simplified authentication middleware - tạm thời bỏ qua phân quyền phức tạp
 * Chỉ kiểm tra đăng nhập cơ bản để tập trung phát triển tính năng chính
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        role: true,
        status: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    // Check if user has an active session (khôi phục tính năng ghi nhớ đăng nhập)
    const activeSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!activeSession) {
      return res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
    }

    // Update last activity
    await prisma.userSession.update({
      where: { id: activeSession.id },
      data: { lastActivity: new Date() }
    });

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: [] // Empty permissions array for compatibility
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Add alias for backward compatibility with auth.js
export const authenticate = authMiddleware;

/**
 * Simplified role-based authorization middleware
 * @param roles - Array of allowed roles
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

/**
 * Simplified project access middleware - tạm thời cho phép tất cả
 */
export const projectAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Tạm thời cho phép tất cả user truy cập project
    // TODO: Khôi phục kiểm tra project access khi cần thiết
    next();
  } catch (error) {
    console.error('Project access middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Simplified document access middleware - tạm thời cho phép tất cả
 */
export const documentAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Tạm thời cho phép tất cả user truy cập document
    // TODO: Khôi phục kiểm tra document access khi cần thiết
    next();
  } catch (error) {
    console.error('Document access middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Simplified dashboard permission middleware - tạm thời cho phép tất cả
 */
export const checkDashboardPermission = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Tạm thời cho phép tất cả user truy cập dashboard
      // TODO: Khôi phục kiểm tra dashboard permission khi cần thiết
      next();
    } catch (error) {
      console.error('Dashboard permission check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Simplified project permission middleware - tạm thời cho phép tất cả
 */
export const checkProjectPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Tạm thời cho phép tất cả user thực hiện action
      // TODO: Khôi phục kiểm tra project permission khi cần thiết
      next();
    } catch (error) {
      console.error('Project permission middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Simplified multiple project permissions middleware - tạm thời cho phép tất cả
 */
export const checkAnyProjectPermission = (permissions: Array<{ resource: string; action: string }>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Tạm thời cho phép tất cả user thực hiện action
      // TODO: Khôi phục kiểm tra project permission khi cần thiết
      next();
    } catch (error) {
      console.error('Any project permission middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}; 