import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
  getKaizenTags,
  getKaizenTagById,
  createKaizenTag,
  updateKaizenTag,
  deleteKaizenTag,
  getPopularTags
} from '../controllers/kaizenTagController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Tag routes
router.get('/', getKaizenTags);
router.get('/popular', getPopularTags);
router.get('/:id', getKaizenTagById);

router.post('/', createKaizenTag);
router.put('/:id', updateKaizenTag);
router.delete('/:id', deleteKaizenTag);

export default router;
