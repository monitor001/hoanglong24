import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  createLicense,
  getLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
  activateLicense,
  getLicenseStats
} from '../controllers/licenseController';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authMiddleware);

// Routes cho quản lý license (tạm thời bỏ qua permission check)
router.post('/', createLicense);
router.get('/', getLicenses);
router.get('/stats', getLicenseStats);
router.get('/:id', getLicenseById);
router.put('/:id', updateLicense);
router.delete('/:id', deleteLicense);

// Route cho kích hoạt license (có thể được sử dụng bởi client)
router.post('/activate', activateLicense);

export default router;
