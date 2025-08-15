import express from 'express';
import {
  getApprovalDocuments,
  getApprovalDocumentById,
  createApprovalDocument,
  updateApprovalStatus,
  updateApprovalDocument,
  addApprovalComment,
  deleteApprovalDocument,
  getApprovalStats
} from '../controllers/approvalController';
import { authMiddleware } from '../middlewares/simpleAuth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all approval documents with filtering
router.get('/', getApprovalDocuments);

// Get approval statistics
router.get('/stats', getApprovalStats);

// Get approval document by ID
router.get('/:id', getApprovalDocumentById);

// Create new approval document
router.post('/', createApprovalDocument);

// Update approval document status
router.put('/:id/status', updateApprovalStatus);

// Update approval document
router.put('/:id', updateApprovalDocument);

// Add comment to approval document
router.post('/:id/comments', addApprovalComment);

// Delete approval document
router.delete('/:id', deleteApprovalDocument);

export default router;
