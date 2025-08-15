import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  // Handle permission errors
  if (err.status === 403) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Bạn chưa được cấp quyền để thực hiện thao tác này!',
      hint: 'Vui lòng liên hệ quản trị viên để được cấp quyền.',
      requiredPermission: err.requiredPermission || 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  // Handle authentication errors
  if (err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Bạn cần đăng nhập để thực hiện thao tác này.',
      timestamp: new Date().toISOString()
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Dữ liệu không hợp lệ.',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle database errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Dữ liệu đã tồn tại trong hệ thống.',
      timestamp: new Date().toISOString()
    });
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database Error',
      message: 'Lỗi cơ sở dữ liệu.',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
      : err.message,
    timestamp: new Date().toISOString()
  });
}; 