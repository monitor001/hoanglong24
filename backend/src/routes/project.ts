import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectMemberPermissions,
  updateProjectMemberPermissions,
  getDefaultRolePermissions,
  getProjectNotes,
  createProjectNote,
  deleteProjectNote,
  updateProjectNote,
  uploadProjectImages,
  getProjectImages,
  deleteProjectImage,
  getProjectComments,
  createProjectComment,
  deleteProjectComment,
  getProjectStats,
  exportProject,
  shareProject,
  getProjectShares,
  revokeProjectShare
} from '../controllers/projectController';
import { 
  authMiddleware
} from '../middlewares/simpleAuth';

const router = express.Router();

// Get all projects (with filtering and pagination)
router.get('/', authMiddleware, getProjects);

// Get project by ID
router.get('/:id', authMiddleware, getProjectById);

// Create project
router.post('/', authMiddleware, createProject);

// Update project
router.put('/:id', authMiddleware, updateProject);

// Delete project
router.delete('/:id', authMiddleware, deleteProject);

// Project members
router.post('/:id/members', authMiddleware, addProjectMember);
router.delete('/:id/members/:memberId', authMiddleware, removeProjectMember);
router.put('/:id/members/:memberId', authMiddleware, updateProjectMemberRole);

// Project member permissions
router.get('/:id/members/:memberId/permissions', authMiddleware, getProjectMemberPermissions);
router.put('/:id/members/:memberId/permissions', authMiddleware, updateProjectMemberPermissions);

// Default role permissions
router.get('/default-role-permissions', authMiddleware, getDefaultRolePermissions);

// Project notes
router.get('/:id/notes', authMiddleware, getProjectNotes);
router.post('/:id/notes', authMiddleware, createProjectNote);
router.delete('/:id/notes/:noteId', authMiddleware, deleteProjectNote);
router.put('/:id/notes/:noteId', authMiddleware, updateProjectNote);

// Project images
router.post('/:id/images', authMiddleware, uploadProjectImages);
router.get('/:id/images', authMiddleware, getProjectImages);
router.delete('/:id/images/:imageId', authMiddleware, deleteProjectImage);

// Project comments
router.get('/:id/comments', authMiddleware, getProjectComments);
router.post('/:id/comments', authMiddleware, createProjectComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteProjectComment);

// Project statistics
router.get('/:id/stats', authMiddleware, getProjectStats);

// Project export
router.get('/:id/export', authMiddleware, exportProject);

// Project sharing
router.post('/:id/share', authMiddleware, shareProject);
router.get('/:id/shares', authMiddleware, getProjectShares);
router.delete('/:id/shares/:shareId', authMiddleware, revokeProjectShare);

export default router; 