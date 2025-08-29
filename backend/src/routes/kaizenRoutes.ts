import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/auth';
import {
  getKaizens,
  getKaizenById,
  createKaizen,
  updateKaizen,
  deleteKaizen,
  toggleLike,
  addComment,
  shareKaizen,
  getKaizenStats
} from '../controllers/kaizenController';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('application/') ||
        file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Kaizen routes
router.get('/', getKaizens);
router.get('/stats', getKaizenStats);
router.get('/:id', getKaizenById);

router.post('/', 
  upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]), 
  createKaizen
);

router.put('/:id', 
  upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]), 
  updateKaizen
);

router.delete('/:id', deleteKaizen);

// Interaction routes
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.post('/:id/share', shareKaizen);

export default router;
