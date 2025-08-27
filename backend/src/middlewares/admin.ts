import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user has admin privileges
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};
