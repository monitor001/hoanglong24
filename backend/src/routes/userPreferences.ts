import { Router } from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import {
  getUserPreferences,
  updateUserPreference,
  updateMultipleUserPreferences,
  deleteUserPreference,
  syncPreferencesFromLocalStorage,
  getDefaultPreferences
} from '../controllers/userPreferencesController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get user preferences
router.get('/', getUserPreferences);

// Update single user preference
router.put('/', updateUserPreference);

// Update multiple user preferences
router.put('/multiple', updateMultipleUserPreferences);

// Delete user preference
router.delete('/:key', deleteUserPreference);

// Sync preferences from localStorage
router.post('/sync', syncPreferencesFromLocalStorage);

// Get default preferences
router.get('/defaults', getDefaultPreferences);

export default router;
