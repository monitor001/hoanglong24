import { Router } from 'express';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  addComment, 
  getTaskHistory,
  getOverdueTasks,
  getUpcomingTasks
} from '../controllers/taskController';
import { authMiddleware } from '../middlewares/simpleAuth';

const router = Router();

// Task CRUD operations - bỏ hoàn toàn permission checks
router.get('/', authMiddleware, getTasks);
router.get('/:id', authMiddleware, getTask);
router.post('/', authMiddleware, createTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

// Enhanced task filtering
router.get('/overdue', authMiddleware, getOverdueTasks);
router.get('/upcoming', authMiddleware, getUpcomingTasks);

// Task comments and history
router.post('/:id/comments', authMiddleware, addComment);
router.get('/:id/history', authMiddleware, getTaskHistory);

export default router; 