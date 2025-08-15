import { Router } from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import {
  getAllTodos,
  getTodosByDate,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getTodosByRange
} from '../controllers/todoController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all todos for a user
router.get('/', getAllTodos);

// Get todos by date
router.get('/date', getTodosByDate);

// Get todos by date range
router.get('/range', getTodosByRange);

// Create new todo
router.post('/', createTodo);

// Update todo
router.put('/:id', updateTodo);

// Delete todo
router.delete('/:id', deleteTodo);

// Toggle todo completion
router.patch('/:id/toggle', toggleTodo);

export default router; 