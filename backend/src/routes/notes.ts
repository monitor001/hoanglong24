import express from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteById,
} from '../controllers/noteController';

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả routes
router.use(authMiddleware);

// Routes cho Notes - bỏ hoàn toàn permission checks
router.get('/', getAllNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router; 