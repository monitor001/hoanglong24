import express from 'express';
import {
  register,
  login,
  verifyTwoFactor,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  createTestUser,
  logout,
  getUserSessions,
  forceLogoutUser,
  getMySessions,
  logoutCurrentSession,
  checkSessionStatus
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/simpleAuth';
import { PermissionUtils } from '../utils/permissionUtils';

const router = express.Router();

// Public routes
router.post('/register', register); // Temporarily enabled for testing
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactor);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateProfile);
router.post('/setup-2fa', authMiddleware, setupTwoFactor);
router.post('/enable-2fa', authMiddleware, enableTwoFactor);
router.post('/disable-2fa', authMiddleware, disableTwoFactor);
router.post('/logout', authMiddleware, logout);

// Permission check endpoint
router.post('/check-permission', authMiddleware, async (req, res) => {
  try {
    const { permission } = req.body;
    const userId = (req as any).user.id;

    if (!permission) {
      return res.status(400).json({ 
        error: 'Permission parameter is required' 
      });
    }

    const hasPermission = await PermissionUtils.hasPermission({
      userId,
      permission
    });

    res.json({
      success: true,
      data: {
        hasPermission,
        permission,
        userId
      }
    });
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check permission'
    });
  }
});

// Session management routes
router.get('/check-session', authMiddleware, checkSessionStatus);
router.get('/my-sessions', authMiddleware, getMySessions);
router.post('/logout-current', authMiddleware, logoutCurrentSession);

// Session management routes (admin only)
router.get('/sessions', authMiddleware, getUserSessions);
router.post('/force-logout', authMiddleware, forceLogoutUser);

// Test endpoint for creating test user
router.post('/create-test-user', createTestUser);

export default router; 