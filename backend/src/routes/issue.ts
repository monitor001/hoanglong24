import express from 'express';
import { getIssues, getIssueById, createIssue, updateIssue, deleteIssue, getIssueComments, createIssueComment, deleteComment, getOverdueIssues } from '../controllers/issueController';
import { authMiddleware } from '../middlewares/simpleAuth';
import multer from 'multer';
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const router = express.Router();

// Lấy danh sách issue
router.get('/', authMiddleware, getIssues);
// Lấy overdue và warning issues
router.get('/overdue', authMiddleware, getOverdueIssues);
// Lấy chi tiết issue
router.get('/:id', authMiddleware, getIssueById);
// Tạo mới issue
router.post('/', authMiddleware, createIssue);
// Cập nhật issue
router.put('/:id', authMiddleware, updateIssue);
// Xoá issue
router.delete('/:id', authMiddleware, deleteIssue);
// Lấy danh sách comment của issue
router.get('/:id/comments', authMiddleware, getIssueComments);
// Tạo comment cho issue (có upload file)
router.post('/:id/comments', authMiddleware, upload.array('files', 5) as any, createIssueComment);
// Xóa comment
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

export default router; 