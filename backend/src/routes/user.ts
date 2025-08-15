import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserDetails,
  getUserProjects,
  getUserTasks,
  getAssignableUsers,
  testUsers,
  getAllUsers
} from '../controllers/userController';
import { authMiddleware, authorize } from '../middlewares/simpleAuth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', authorize(['ADMIN']), getUsers);

// Get all users for task assignment (authenticated users)
router.get('/all', getAllUsers);

// Get assignable users for task assignment
router.get('/assignable', getAssignableUsers);

// Test endpoint - no auth required
router.get('/test', testUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create user (admin only)
router.post('/', authorize(['ADMIN']), createUser);

// Update user
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', authorize(['ADMIN']), deleteUser);

// Get user details with associated data counts (admin only)
router.get('/:id/details', authorize(['ADMIN']), getUserDetails);

// Get user projects
router.get('/:id/projects', getUserProjects);

// Get user tasks
router.get('/:id/tasks', getUserTasks);

export default router; 