import express from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import {
  shareNote,
  getNoteShares,
  revokeNoteShare,
  getSharedNotes,
  respondToShare,
} from '../controllers/noteShareController';

const router = express.Router();

router.use(authMiddleware);

// Share a note
router.post('/notes/:id/share', shareNote);

// Get shares for a note
router.get('/notes/:id/shares', getNoteShares);

// Revoke a share
router.delete('/notes/:id/shares/:shareId', revokeNoteShare);

// Get shared notes for current user
router.get('/shared-notes', getSharedNotes);

// Respond to a share (accept/decline)
router.put('/shares/:shareId/respond', respondToShare);

export default router; 