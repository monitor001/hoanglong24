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
 * Simple authentication middleware - chỉ kiểm tra đăng nhập cơ bản
 * Bỏ qua tất cả kiểm tra phân quyền phức tạp để tập trung phát triển
 */
export const simpleAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    console.error('Simple auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Simple role check middleware - chỉ kiểm tra role cơ bản
 */
export const simpleRoleCheck = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    next();
  };
};

/**
 * Admin only middleware - chỉ cho phép admin
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};

// Export aliases for backward compatibility
export const authMiddleware = simpleAuthMiddleware;
export const authenticate = simpleAuthMiddleware;
export const authorize = simpleRoleCheck;
