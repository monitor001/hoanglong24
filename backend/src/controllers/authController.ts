import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { ApiError } from '../middlewares/errorHandler';
import { logActivity } from '../utils/activityLogger';
import { prisma } from '../db';

// Helper function to get client IP address
const getClientIP = (req: Request): string => {
  return req.headers['x-forwarded-for'] as string || 
         req.headers['x-real-ip'] as string || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
};

// Helper function to get device info from user agent
const getDeviceInfo = (userAgent: string): string => {
  // Simple device detection logic
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
};

// Helper function to deactivate all other sessions for a user
const deactivateOtherSessions = async (userId: string, currentSessionId: string) => {
  try {
    console.log(`🔄 Deactivating other sessions for user ${userId}, keeping session ${currentSessionId}`);
    
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        sessionId: { not: currentSessionId },
        isActive: true
      },
      data: {
        isActive: false
      }
    });
    
    console.log(`✅ Deactivated ${result.count} other sessions for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('❌ Error deactivating other sessions:', error);
    throw error;
  }
};

// Helper function to create a new session
const createUserSession = async (userId: string, token: string, req: Request) => {
  try {
    const sessionId = uuidv4();
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceInfo = getDeviceInfo(userAgent);
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    console.log(`🔄 Creating new session for user ${userId} from ${deviceInfo} (${ipAddress})`);
    
    // Calculate expiration time
    const expiresAt = new Date();
    if (expiresIn.includes('d')) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    } else if (expiresIn.includes('h')) {
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
    } else {
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));
    }

    // Deactivate all other sessions for this user
    const deactivatedCount = await deactivateOtherSessions(userId, sessionId);

    // Create new session
    const session = await prisma.userSession.create({
      data: {
        userId,
        sessionId,
        deviceInfo,
        ipAddress,
        userAgent,
        isActive: true,
        expiresAt,
        lastActivity: new Date()
      }
    });

    console.log(`✅ Created new session ${sessionId} for user ${userId}, deactivated ${deactivatedCount} previous sessions`);
    return session;
  } catch (error) {
    console.error('❌ Error creating user session:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, organization, code, middleName, gender, dob, address, role, phone, department, status } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      throw new ApiError(400, 'Email, password, and name are required');
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ApiError(409, 'User already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with proper data transformation
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role: role || 'USER', // Use provided role or default to USER
    };
    
    // Add optional fields if provided
    if (organization) userData.organization = organization;
    if (code) userData.code = code;
    if (middleName) userData.middleName = middleName;
    if (gender) userData.gender = gender;
    if (address) userData.address = address;
    if (dob) userData.dob = new Date(dob);
    if (phone) userData.phone = phone;
    if (department) userData.department = department;
    if (status) userData.status = status;
    
    const user = await prisma.user.create({ 
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        phone: true,
        department: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    
    // Return user data
    res.status(201).json({
      user: user,
      token
    });
    await logActivity({
      userId: user.id,
      action: 'register',
      objectType: 'user',
      objectId: user.id,
      description: `Đăng ký tài khoản cho email ${user.email}`
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Check if 2FA is enabled
    if (user.twoFactorSecret) {
      return res.status(200).json({
        requireTwoFactor: true,
        userId: user.id
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    
    // Create user session
    const session = await createUserSession(user.id, token, req);
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`✅ Login successful for user ${user.email} with session ${session.sessionId}`);
    
    res.status(200).json({
      user: userWithoutPassword,
      token,
      sessionId: session.sessionId
    });
    
    await logActivity({
      userId: user.id,
      action: 'login',
      objectType: 'user',
      objectId: user.id,
      description: `Đăng nhập hệ thống từ ${session.ipAddress}`
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
};

/**
 * Verify 2FA token
 * @route POST /api/auth/verify-2fa
 */
export const verifyTwoFactor = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    
    // Validate input
    if (!userId || !token) {
      throw new ApiError(400, 'User ID and token are required');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.twoFactorSecret) {
      throw new ApiError(401, 'Invalid user or 2FA not enabled');
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      throw new ApiError(401, 'Invalid 2FA token');
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    
    // Create user session
    const session = await createUserSession(user.id, jwtToken, req);
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      user: userWithoutPassword,
      token: jwtToken,
      sessionId: session.sessionId
    });
    
    await logActivity({
      userId: user.id,
      action: 'login',
      objectType: 'user',
      objectId: user.id,
      description: `Đăng nhập hệ thống với 2FA từ ${session.ipAddress}`
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: '2FA verification failed' });
    }
  }
};

/**
 * Setup 2FA
 * @route POST /api/auth/setup-2fa
 */
export const setupTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `HoangLong24 (${req.user?.email})`
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    
    // Store temporary secret
    // In a real app, you would store this in a temporary storage or session
    // Here we're just sending it back to the client
    
    res.status(200).json({
      secret: secret.base32,
      qrCodeUrl
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: '2FA setup failed' });
    }
  }
};

/**
 * Verify and enable 2FA
 * @route POST /api/auth/enable-2fa
 */
export const enableTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { secret, token } = req.body;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    if (!secret || !token) {
      throw new ApiError(400, 'Secret and token are required');
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      throw new ApiError(401, 'Invalid 2FA token');
    }
    
    // Save secret to user
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });
    
    res.status(200).json({
      message: '2FA enabled successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('2FA enable error:', error);
      res.status(500).json({ error: '2FA enable failed' });
    }
  }
};

/**
 * Disable 2FA
 * @route POST /api/auth/disable-2fa
 */
export const disableTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Remove 2FA secret
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null }
    });
    
    res.status(200).json({
      message: '2FA disabled successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('2FA disable error:', error);
      res.status(500).json({ error: '2FA disable failed' });
    }
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
        // Include whether 2FA is enabled, but not the secret
        twoFactorSecret: true
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Convert twoFactorSecret to boolean indicating if 2FA is enabled
    const { twoFactorSecret, ...userInfo } = user;
    
    res.status(200).json({
      ...userInfo,
      twoFactorEnabled: !!twoFactorSecret
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  }
};

/**
 * Update current user profile
 * @route PUT /api/auth/me
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const { name, email, organization } = req.body;
    
    // Validate input
    if (!name || !email) {
      throw new ApiError(400, 'Name and email are required');
    }
    
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });
    
    if (existingUser) {
      throw new ApiError(409, 'Email is already taken');
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        organization: organization || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.status(200).json(updatedUser);
    
    await logActivity({
      userId,
      action: 'update_profile',
      objectType: 'user',
      objectId: userId,
      description: `Cập nhật thông tin cá nhân`
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // In a real application, generate a reset token and send email
    // For this example, we'll just return a success message
    
    res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Password reset request failed' });
    }
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      throw new ApiError(400, 'Token and password are required');
    }
    
    // In a real application, verify the reset token and update the password
    // For this example, we'll just return a success message
    
    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Password reset failed' });
    }
  }
}; 

/**
 * Create test user (for debugging only)
 * @route POST /api/auth/create-test-user
 */
export const createTestUser = async (req: Request, res: Response) => {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (existingUser) {
      return res.status(200).json({ 
        message: 'Test user already exists',
        user: { email: existingUser.email, name: existingUser.name }
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'ADMIN',
        status: 'active',
        organization: 'Test Organization',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        organization: true,
        createdAt: true
      }
    });
    
    res.status(201).json({
      message: 'Test user created successfully',
      user,
      credentials: {
        email: 'test@example.com',
        password: 'test123'
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
}; 

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Decode token to get user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      // Deactivate current session
      await prisma.userSession.updateMany({
        where: {
          userId: decoded.id,
          isActive: true
        },
        data: {
          isActive: false
        }
      });
      
      await logActivity({
        userId: decoded.id,
        action: 'logout',
        objectType: 'user',
        objectId: decoded.id,
        description: 'Đăng xuất hệ thống'
      });
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Get user sessions (admin only)
 * @route GET /api/auth/sessions
 */
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    // Only admins can view sessions
    if (req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can view sessions');
    }
    
    const { userId } = req.query;
    
    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }
    
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: userId as string
      },
      orderBy: {
        createdAt: 'desc'
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
    
    res.status(200).json(sessions);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }
};

/**
 * Force logout user from all devices (admin only)
 * @route POST /api/auth/force-logout
 */
export const forceLogoutUser = async (req: Request, res: Response) => {
  try {
    // Only admins can force logout
    if (req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can force logout');
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }
    
    // Deactivate all sessions for the user
    await prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });
    
    await logActivity({
      userId: req.user.id,
      action: 'force_logout',
      objectType: 'user',
      objectId: userId,
      description: `Force logout user ${userId} from all devices`
    });
    
    res.status(200).json({ message: 'User logged out from all devices' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Force logout error:', error);
      res.status(500).json({ error: 'Failed to force logout' });
    }
  }
}; 

/**
 * Get current user sessions
 * @route GET /api/auth/my-sessions
 */
export const getMySessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        lastActivity: 'desc'
      },
      select: {
        id: true,
        sessionId: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        isActive: true,
        lastActivity: true,
        createdAt: true,
        expiresAt: true
      }
    });
    
    res.status(200).json({
      sessions,
      totalActive: sessions.length
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get my sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }
};

/**
 * Check current session status
 * @route GET /api/auth/check-session
 */
export const checkSessionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }
    
    if (!sessionId) {
      // Nếu không có sessionId, kiểm tra xem user có session active nào không
      const activeSession = await prisma.userSession.findFirst({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });
      
      return res.status(200).json({
        isValid: !!activeSession,
        message: activeSession ? 'Session is valid' : 'No active session found'
      });
    }
    
    // Kiểm tra session cụ thể
    const session = await prisma.userSession.findFirst({
      where: {
        userId,
        sessionId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!session) {
      return res.status(200).json({
        isValid: false,
        message: 'Session not found or inactive'
      });
    }
    
    // Cập nhật lastActivity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivity: new Date() }
    });
    
    res.status(200).json({
      isValid: true,
      message: 'Session is valid',
      sessionInfo: {
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Check session status error:', error);
      res.status(500).json({ error: 'Failed to check session status' });
    }
  }
};

/**
 * Logout from current session only
 * @route POST /api/auth/logout-current
 */
export const logoutCurrentSession = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Decode token to get user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      // Find current session and deactivate it
      const currentSession = await prisma.userSession.findFirst({
        where: {
          userId: decoded.id,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });
      
      if (currentSession) {
        await prisma.userSession.update({
          where: { id: currentSession.id },
          data: { isActive: false }
        });
      }
      
      await logActivity({
        userId: decoded.id,
        action: 'logout_current',
        objectType: 'user',
        objectId: decoded.id,
        description: 'Đăng xuất phiên hiện tại'
      });
    }
    
    res.status(200).json({ message: 'Logged out from current session' });
  } catch (error) {
    console.error('Logout current session error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}; 