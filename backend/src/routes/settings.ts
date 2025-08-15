import { Router } from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import { requirePermission } from '../utils/permissionUtils';
import { prisma } from '../db';
import { 
  getPermissionMatrix, 
  updatePermissionMatrix, 
  getSystemConfig,
  updateSystemConfig,
  getUserPermissions,
  getAllPermissions,
  getAllRoles,
  resetPermissionMatrix,
  getPermissionStatistics
} from '../controllers/settingsController';

const router = Router();

// Get ISO 19650 configuration from database
router.get('/iso/config', authMiddleware, requirePermission('view_settings'), async (req, res) => {
  try {
    // Get ISO configs from database
    const isoConfigs = await prisma.iSOConfig.findMany({
      where: { isActive: true }
    });

    // Convert to expected format
    const config: any = {};
    isoConfigs.forEach(configItem => {
      config[configItem.key] = configItem.value;
    });

    // If no configs exist, return default
    if (Object.keys(config).length === 0) {
      config.documentStatuses = [
        { id: 'wip', name: 'WIP', nameVi: 'Đang thực hiện', color: '#faad14', isActive: true },
        { id: 'shared', name: 'Shared', nameVi: 'Đã chia sẻ', color: '#1890ff', isActive: true },
        { id: 'published', name: 'Published', nameVi: 'Đã xuất bản', color: '#52c41a', isActive: true },
        { id: 'archived', name: 'Archived', nameVi: 'Đã lưu trữ', color: '#8c8c8c', isActive: true }
      ];
      config.metadataFields = [
        { id: 'discipline', name: 'Discipline', nameVi: 'Chuyên ngành kỹ thuật', isRequired: true, isActive: true },
        { id: 'originator', name: 'Originator', nameVi: 'Tổ chức tạo tài liệu', isRequired: true, isActive: true },
        { id: 'zone', name: 'Zone/System', nameVi: 'Khu vực hoặc hệ thống', isRequired: false, isActive: true }
      ];
      config.approvalSteps = [
        {
          id: 'create',
          name: 'Create Document',
          nameVi: 'Tạo tài liệu',
          description: 'Tài liệu được tạo với trạng thái WIP',
          isAutomatic: true,
          isRequired: true,
          order: 1
        },
        {
          id: 'internal-review',
          name: 'Internal Review',
          nameVi: 'Kiểm tra nội bộ',
          description: 'Kiểm tra chất lượng nội bộ trước khi chia sẻ',
          isAutomatic: false,
          isRequired: true,
          order: 2
        },
        {
          id: 'team-share',
          name: 'Share with Team',
          nameVi: 'Chia sẻ với team',
          description: 'Chuyển sang trạng thái Shared để team review',
          isAutomatic: false,
          isRequired: true,
          order: 3
        },
        {
          id: 'final-approval',
          name: 'Final Approval',
          nameVi: 'Phê duyệt cuối',
          description: 'Phê duyệt chính thức để Published',
          isAutomatic: false,
          isRequired: true,
          approverRole: 'Project Manager',
          order: 4
        }
      ];
      config.fileNamingRule = {
        template: '{Project}-{Originator}-{Zone}-{Level}-{Type}-{Role}-{Number}',
        example: 'ABC-XYZ-00-00-DR-A-001.pdf',
        isActive: true
      };
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching ISO config:', error);
    res.status(500).json({ error: 'Failed to fetch ISO configuration' });
  }
});

// Update ISO 19650 configuration to database
router.put('/iso/config', authMiddleware, requirePermission('edit_settings'), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { documentStatuses, metadataFields, approvalSteps, fileNamingRule } = req.body;
    
    // Save each config section to database
    const configs = [
      { key: 'documentStatuses', value: documentStatuses, description: 'Document statuses configuration' },
      { key: 'metadataFields', value: metadataFields, description: 'Metadata fields configuration' },
      { key: 'approvalSteps', value: approvalSteps, description: 'Approval steps configuration' },
      { key: 'fileNamingRule', value: fileNamingRule, description: 'File naming rule configuration' }
    ];

    for (const config of configs) {
      // Check if config exists
      const existingConfig = await prisma.iSOConfig.findUnique({
        where: { key: config.key }
      });

      if (existingConfig) {
        // Update existing config
        await prisma.iSOConfig.update({
          where: { id: existingConfig.id },
          data: {
            value: config.value,
            description: config.description,
            updatedById: userId
          }
        });
      } else {
        // Create new config
        await prisma.iSOConfig.create({
          data: {
            key: config.key,
            value: config.value,
            description: config.description,
            createdById: userId
          }
        });
      }
    }

    res.json({ message: 'ISO configuration updated successfully' });
  } catch (error) {
    console.error('Error updating ISO config:', error);
    res.status(500).json({ error: 'Failed to update ISO configuration' });
  }
});

// ===== System Settings =====
router.get('/system-settings', authMiddleware, requirePermission('view_settings'), async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

router.post('/system-settings', authMiddleware, requirePermission('edit_settings'), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { key, value, description, category, isActive } = req.body;
    
    // Validate required fields
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    // Check if key already exists
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key }
    });
    if (existingSetting) {
      return res.status(400).json({ error: 'Setting key already exists' });
    }

    const setting = await prisma.systemSetting.create({
      data: { 
        key, 
        value, 
        description, 
        category, 
        isActive: isActive !== undefined ? isActive : true,
        createdById: userId
      }
    });
    res.json(setting);
  } catch (error) {
    console.error('Error creating system setting:', error);
    res.status(500).json({ error: 'Failed to create system setting' });
  }
});

router.put('/system-settings/:id', authMiddleware, requirePermission('edit_settings'), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { key, value, description, category, isActive } = req.body;
    
    // Validate required fields
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    // Check if key already exists for other settings
    const existingSetting = await prisma.systemSetting.findFirst({
      where: { 
        key,
        id: { not: id }
      }
    });
    if (existingSetting) {
      return res.status(400).json({ error: 'Setting key already exists' });
    }

    const setting = await prisma.systemSetting.update({
      where: { id },
      data: { 
        key, 
        value, 
        description, 
        category, 
        isActive: isActive !== undefined ? isActive : true,
        updatedById: userId
      }
    });
    res.json(setting);
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({ error: 'Failed to update system setting' });
  }
});

router.delete('/system-settings/:id', authMiddleware, requirePermission('edit_settings'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.systemSetting.delete({ where: { id } });
    res.json({ message: 'System setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting system setting:', error);
    res.status(500).json({ error: 'Failed to delete system setting' });
  }
});

// ===== User Roles (Simple Role Management) =====
// Get roles for permission matrix (exclude ADMIN)
router.get('/roles', authMiddleware, requirePermission('view_settings'), async (req, res) => {
  try {
    const roles = [
      { id: 'PROJECT_MANAGER', name: 'Project Manager', nameVi: 'Quản lý dự án', color: '#1890ff' },
      { id: 'BIM_MANAGER', name: 'BIM Manager', nameVi: 'Quản lý BIM', color: '#722ed1' },
      { id: 'CONTRIBUTOR', name: 'Contributor', nameVi: 'Cộng tác viên', color: '#52c41a' },
      { id: 'VIEWER', name: 'Viewer', nameVi: 'Người xem', color: '#faad14' },
      { id: 'USER', name: 'User', nameVi: 'Người dùng', color: '#8c8c8c' }
    ];
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get all roles including ADMIN (for user management)
router.get('/roles/all', authMiddleware, requirePermission('view_settings'), async (req, res) => {
  try {
    const allRoles = [
      { id: 'ADMIN', name: 'Administrator', nameVi: 'Quản trị viên', color: '#ff4d4f' },
      { id: 'PROJECT_MANAGER', name: 'Project Manager', nameVi: 'Quản lý dự án', color: '#1890ff' },
      { id: 'BIM_MANAGER', name: 'BIM Manager', nameVi: 'Quản lý BIM', color: '#722ed1' },
      { id: 'CONTRIBUTOR', name: 'Contributor', nameVi: 'Cộng tác viên', color: '#52c41a' },
      { id: 'VIEWER', name: 'Viewer', nameVi: 'Người xem', color: '#faad14' },
      { id: 'USER', name: 'User', nameVi: 'Người dùng', color: '#8c8c8c' }
    ];
    res.json(allRoles);
  } catch (error) {
    console.error('Error fetching all roles:', error);
    res.status(500).json({ error: 'Failed to fetch all roles' });
  }
});

// ===== Permissions Management =====
// Get permission matrix (using controller)
router.get('/permissions-config', authMiddleware, requirePermission('view_settings'), getPermissionMatrix);

// Update permission matrix (using controller)
router.put('/permissions', authMiddleware, requirePermission('manage_permissions'), updatePermissionMatrix);

// Get system configuration (using controller)
router.get('/system-config', authMiddleware, requirePermission('view_settings'), getSystemConfig);

// DEPRECATED: Use /permissions/user/:userId instead
// This endpoint is kept for backward compatibility but should be removed
router.get('/user-permissions/:userId?', authMiddleware, async (req, res, next) => {
  const targetUserId = req.params.userId || (req as any).user.id;
  const currentUserId = (req as any).user.id;
  
  // If user is requesting their own permissions, allow it
  if (targetUserId === currentUserId) {
    return getUserPermissions(req, res);
  }
  
  // If user is requesting someone else's permissions, require view_settings permission
  const permissionMiddleware = requirePermission('view_settings');
  return permissionMiddleware(req, res, next);
}, getUserPermissions);

// Get all available permissions (using controller)
router.get('/all-permissions', authMiddleware, requirePermission('view_settings'), getAllPermissions);

// Get all available roles (using controller)
router.get('/all-roles', authMiddleware, requirePermission('view_settings'), getAllRoles);

// Reset permission matrix to default (using controller)
router.post('/permissions/reset', authMiddleware, requirePermission('manage_permissions'), resetPermissionMatrix);

// Update system configuration (using controller)
router.put('/system-config', authMiddleware, requirePermission('edit_settings'), updateSystemConfig);

// Get permission statistics (using controller)
router.get('/permissions/statistics', authMiddleware, requirePermission('view_settings'), getPermissionStatistics);

export default router; 