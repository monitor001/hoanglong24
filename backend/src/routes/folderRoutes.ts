import express from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import {
  getAllFolders,
  createFolder,
  getFolderById,
  updateFolder,
  deleteFolder,
} from '../controllers/folderController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllFolders);
router.post('/', createFolder);
router.get('/:id', getFolderById);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

export default router; 