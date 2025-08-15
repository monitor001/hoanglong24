import express from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import {
  getChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  updateChecklistItem,
  createChecklistItem,
  getCategories,
  getCategoriesWithDefaults,
  createCategory,
  updateCategory,
  deleteCategory,
  createChecklistWithDefaults,
  createTemplate,
  getTemplates,
  createChecklistFromTemplate
} from '../controllers/checklistController';

const router = express.Router();

// Public routes (không cần authentication)
router.get('/categories-with-defaults', getCategoriesWithDefaults);
router.get('/templates', getTemplates);

// Áp dụng middleware xác thực cho các routes còn lại
router.use(authMiddleware);

// Routes cho checklist
router.get('/checklists', getChecklists);
router.get('/checklists/:id', getChecklistById);
router.post('/checklists', createChecklist);
router.post('/checklists-with-defaults', createChecklistWithDefaults);
router.put('/checklists/:id', updateChecklist);
router.delete('/checklists/:id', deleteChecklist);

// Routes cho checklist items
router.post('/checklist-items', createChecklistItem);
router.put('/checklist-items/:id', updateChecklistItem);

// Routes cho categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Routes cho templates (chỉ POST cần auth)
router.post('/templates', createTemplate);
router.post('/templates/:templateId/create-checklist', createChecklistFromTemplate);

export default router; 