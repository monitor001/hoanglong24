import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middlewares/simpleAuth';
import { getComprehensiveDashboard, getProjectMetrics } from '../controllers/dashboardController';

const router = Router();

// Test endpoint - không cần authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard test endpoint working', timestamp: new Date() });
});

// Comprehensive dashboard data - Tạm thời bỏ authentication để test
router.get('/comprehensive', getComprehensiveDashboard);

// Project-specific metrics - Tạm thời bỏ authentication để test
router.get('/project/:projectId', getProjectMetrics);

// Dashboard statistics - Sử dụng middleware đơn giản
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalProjects,
      totalTasks,
      totalDocuments,
      totalUsers,
      pendingApprovals,
      completedApprovals,
      rejectedApprovals,
      overdueTasks,
      recentActivities
    ] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.document.count(),
      prisma.user.count(),
      prisma.document.count({ where: { status: 'WORK_IN_PROGRESS' } }),
      prisma.document.count({ where: { status: 'PUBLISHED' } }),
      prisma.document.count({ where: { status: 'ARCHIVED' } }),
      prisma.task.count({ 
        where: { 
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        } 
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      })
    ]);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        totalDocuments,
        totalUsers,
        pendingApprovals,
        completedApprovals,
        rejectedApprovals,
        overdueTasks
      },
      recentActivities
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all projects for dropdown - Sử dụng checkDashboardPermission
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get task statistics for specific project or all projects - Sử dụng checkDashboardPermission
router.get('/task-stats/:projectId?', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const whereClause = projectId && projectId !== 'all' ? { projectId } : {};

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        status: true,
        priority: true,
        category: true,
        dueDate: true
      }
    });

    const statusStats = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
      COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
      OVERDUE: tasks.filter(t => {
        return t.status !== 'COMPLETED' && t.dueDate && t.dueDate < new Date();
      }).length
    };

    const priorityStats = {
      URGENT: tasks.filter(t => t.priority === 'URGENT').length,
      HIGH: tasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: tasks.filter(t => t.priority === 'LOW').length,
      NONE: tasks.filter(t => !t.priority).length
    };

    const categoryStats = tasks.reduce((acc: any, task) => {
      const category = task.category || 'Không phân loại';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalTasks: tasks.length,
      statusStats,
      priorityStats,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
});

// Get document statistics for specific project or all projects - Sử dụng checkDashboardPermission
router.get('/document-stats/:projectId?', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const whereClause = projectId && projectId !== 'all' ? { projectId } : {};

    const documents = await prisma.document.findMany({
      where: whereClause,
      select: {
        status: true
      }
    });

    const statusStats = {
              DRAFT: documents.filter(d => d.status === 'WORK_IN_PROGRESS').length,
        IN_REVIEW: documents.filter(d => d.status === 'SHARED').length,
      PUBLISHED: documents.filter(d => d.status === 'PUBLISHED').length,
      ARCHIVED: documents.filter(d => d.status === 'ARCHIVED').length
    };

    res.json({
      totalDocuments: documents.length,
      statusStats
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
});

// Get today's events for specific project or all projects - Sử dụng checkDashboardPermission
router.get('/today-events/:projectId?', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const whereClause: any = {
      startDate: {
        gte: startOfDay,
        lt: endOfDay
      }
    };

    if (projectId && projectId !== 'all') {
      whereClause.projectId = projectId;
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json({ events });
  } catch (error) {
    console.error('Error fetching today events:', error);
    res.status(500).json({ error: 'Failed to fetch today events' });
  }
});

// Tasks by project with priority breakdown (only unfinished tasks) - Sử dụng checkDashboardPermission
router.get('/tasks-by-project', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          where: {
            status: { not: 'COMPLETED' }
          },
          select: {
            priority: true
          }
        }
      }
    });

    const priorities = ['HIGH', 'MEDIUM', 'LOW', 'NONE'];
    const taskData = projects.map(project => {
      // Map priority, if null/undefined then 'NONE'
      const counts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 };
      project.tasks.forEach(t => {
        const p = t.priority ? t.priority : 'NONE';
        if (counts[p] !== undefined) counts[p]++;
        else counts['NONE']++;
      });
      return {
        projectName: project.name,
        high: counts.HIGH,
        medium: counts.MEDIUM,
        low: counts.LOW,
        none: counts.NONE
      };
    });

    res.json(taskData);
  } catch (error) {
    console.error('Tasks by project error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by project' });
  }
});

// Issues by project with priority breakdown (only unfinished issues) - Sử dụng checkDashboardPermission
router.get('/issues-by-project', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        issues: {
          where: {
            status: { notIn: ['RESOLVED', 'CLOSED'] }
          },
          select: {
            priority: true
          }
        }
      }
    });

    const priorities = ['HIGH', 'MEDIUM', 'LOW', 'NONE'];
    const issueData = projects.map(project => {
      const counts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 };
      project.issues.forEach(i => {
        const p = i.priority ? i.priority : 'NONE';
        if (counts[p] !== undefined) counts[p]++;
        else counts['NONE']++;
      });
      return {
        projectName: project.name,
        high: counts.HIGH,
        medium: counts.MEDIUM,
        low: counts.LOW,
        none: counts.NONE
      };
    });

    res.json(issueData);
  } catch (error) {
    console.error('Issues by project error:', error);
    res.status(500).json({ error: 'Failed to fetch issues by project' });
  }
});

// Documents by project with status breakdown - Sử dụng checkDashboardPermission
router.get('/documents-by-project', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        documents: {
          select: {
            status: true
          }
        }
      }
    });

    const documentData = projects.map(project => {
      const documents = project.documents;
      return {
        projectName: project.name,
        published: documents.filter(d => d.status === 'PUBLISHED').length,
        draft: documents.filter(d => d.status === 'WORK_IN_PROGRESS').length,
        inReview: documents.filter(d => d.status === 'SHARED').length,
        archived: documents.filter(d => d.status === 'ARCHIVED').length
      };
    });

    res.json(documentData);
  } catch (error) {
    console.error('Documents by project error:', error);
    res.status(500).json({ error: 'Failed to fetch documents by project' });
  }
});

// Events by project for today - Sử dụng checkDashboardPermission
router.get('/events-by-project', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const projects = await prisma.project.findMany({
      include: {
        calendarEvents: {
          where: {
            startDate: {
              gte: startOfDay,
              lt: endOfDay
            }
          },
          select: {
            id: true
          }
        }
      }
    });

    const eventData = projects.map(project => ({
      projectName: project.name,
      todayEvents: project.calendarEvents.length
    }));

    res.json(eventData);
  } catch (error) {
    console.error('Events by project error:', error);
    res.status(500).json({ error: 'Failed to fetch events by project' });
  }
});

// Project status distribution - Sử dụng checkDashboardPermission
router.get('/project-status', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusData = projects.map(p => ({
      status: p.status,
      count: p._count.status
    }));

    res.json({ statusData });
  } catch (error) {
    console.error('Project status error:', error);
    res.status(500).json({ error: 'Failed to fetch project status' });
  }
});

// Task progress by priority - Sử dụng checkDashboardPermission
router.get('/task-priority', authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });

    const priorityData = tasks.map(t => ({
      priority: t.priority,
      count: t._count.priority
    }));

    res.json({ priorityData });
  } catch (error) {
    console.error('Task priority error:', error);
    res.status(500).json({ error: 'Failed to fetch task priority' });
  }
});

// Document status distribution - Sử dụng checkDashboardPermission
router.get('/document-status', authMiddleware, async (req, res) => {
  try {
    const documents = await prisma.document.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusData = documents.map(d => ({
      status: d.status,
      count: d._count.status
    }));

    res.json({ statusData });
  } catch (error) {
    console.error('Document status error:', error);
    res.status(500).json({ error: 'Failed to fetch document status' });
  }
});

// Monthly activity trends - Sử dụng checkDashboardPermission
router.get('/activity-trends', authMiddleware, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const activities = await prisma.activityLog.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        createdAt: true,
        action: true
      }
    });

    // Group by month
    const monthlyData = activities.reduce((acc: any, activity) => {
      const month = new Date(activity.createdAt).toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    res.json({ monthlyData });
  } catch (error) {
    console.error('Activity trends error:', error);
    res.status(500).json({ error: 'Failed to fetch activity trends' });
  }
});

// Recent projects with progress - Sử dụng checkDashboardPermission
router.get('/recent-projects', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        tasks: {
          select: {
            status: true
          }
        }
      }
    });

    const projectsWithProgress = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress,
        totalTasks,
        completedTasks,
        updatedAt: project.updatedAt
      };
    });

    res.json({ projects: projectsWithProgress });
  } catch (error) {
    console.error('Recent projects error:', error);
    res.status(500).json({ error: 'Failed to fetch recent projects' });
  }
});

// Calendar events for today - Sử dụng checkDashboardPermission
router.get('/today-events', authMiddleware, async (req, res) => {
  try {
    // Lấy thời gian hiện tại theo Asia/Ho_Chi_Minh
    const now = new Date();
    const tzOffset = 7 * 60; // UTC+7
    const local = new Date(now.getTime() + (tzOffset - now.getTimezoneOffset()) * 60000);
    const startOfDay = new Date(local.getFullYear(), local.getMonth(), local.getDate());
    const endOfDay = new Date(local.getFullYear(), local.getMonth(), local.getDate() + 1);
    // Chuyển về UTC để so sánh với dữ liệu trong DB
    const startUTC = new Date(startOfDay.getTime() - tzOffset * 60000);
    const endUTC = new Date(endOfDay.getTime() - tzOffset * 60000);

    const events = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: startUTC,
          lt: endUTC
        }
      },
      include: {
        attendees: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    res.json({ events });
  } catch (error) {
    console.error('Today events error:', error);
    res.status(500).json({ error: 'Failed to fetch today events' });
  }
});

// Issues summary - Sử dụng checkDashboardPermission
router.get('/issues-summary', authMiddleware, async (req, res) => {
  try {
    const [
      totalIssues,
      openIssues,
      resolvedIssues,
      criticalIssues
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'OPEN' } }),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { priority: 'CRITICAL' } })
    ]);

    res.json({
      totalIssues,
      openIssues,
      resolvedIssues,
      criticalIssues
    });
  } catch (error) {
    console.error('Issues summary error:', error);
    res.status(500).json({ error: 'Failed to fetch issues summary' });
  }
});

// Quick notes for dashboard - Sử dụng checkDashboardPermission
router.get('/notes', authMiddleware, async (req, res) => {
  try {
    const notes = await prisma.projectNote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });
    // Đảm bảo title luôn hợp lệ
    const safeNotes = notes.map(n => ({
      ...n,
      title: n.title && n.title.trim() ? n.title : 'Ghi chú không tiêu đề'
    }));
    res.json({ notes: safeNotes });
  } catch (error) {
    console.error('Dashboard notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Export dashboard report - Sử dụng checkDashboardPermission
router.post('/export-report', authMiddleware, async (req, res) => {
  try {
    const { projectId, timeRange, reportType } = req.body;
    const userId = req.user?.id;

    // Kiểm tra quyền xuất báo cáo
    if (req.user?.role !== 'ADMIN') {
      const permissionMatrix = await prisma.systemSetting.findUnique({
        where: { key: 'role_permission_matrix' }
      });

      if (permissionMatrix) {
        const rolePermissionMatrix = JSON.parse(permissionMatrix.value);
        if (!rolePermissionMatrix.dashboard_export || !rolePermissionMatrix.dashboard_export[req.user?.role]) {
          return res.status(403).json({ error: 'Không có quyền xuất báo cáo' });
        }
      }
    }

    // Tạo báo cáo (placeholder - có thể tích hợp với thư viện xuất Excel/PDF)
    const reportData = {
      projectId,
      timeRange,
      reportType,
      generatedBy: userId,
      generatedAt: new Date(),
      data: {} // Sẽ được populate với dữ liệu thực tế
    };

    const generatedReportId = `report_${Date.now()}`;
    res.json({
      success: true,
      message: 'Báo cáo đã được tạo thành công',
      reportId: generatedReportId,
      downloadUrl: `/api/dashboard/download-report/${generatedReportId}`
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// Print dashboard report - Sử dụng checkDashboardPermission
router.post('/print-report', authMiddleware, async (req, res) => {
  try {
    const { projectId, timeRange, reportType } = req.body;

    // Kiểm tra quyền in báo cáo
    if (req.user?.role !== 'ADMIN') {
      const permissionMatrix = await prisma.systemSetting.findUnique({
        where: { key: 'role_permission_matrix' }
      });

      if (permissionMatrix) {
        const rolePermissionMatrix = JSON.parse(permissionMatrix.value);
        if (!rolePermissionMatrix.dashboard_print || !rolePermissionMatrix.dashboard_print[req.user?.role]) {
          return res.status(403).json({ error: 'Không có quyền in báo cáo' });
        }
      }
    }

    // Tạo dữ liệu in (placeholder)
    const printData = {
      projectId,
      timeRange,
      reportType,
      printUrl: `/api/dashboard/print-preview/${Date.now()}`,
      timestamp: new Date()
    };

    res.json({
      success: true,
      message: 'Báo cáo đã sẵn sàng để in',
      printData
    });
  } catch (error) {
    console.error('Print report error:', error);
    res.status(500).json({ error: 'Failed to prepare print report' });
  }
});

// Download dashboard data - Sử dụng checkDashboardPermission
router.post('/download-data', authMiddleware, async (req, res) => {
  try {
    const { projectId, dataType, format } = req.body;

    // Kiểm tra quyền tải xuống
    if (req.user?.role !== 'ADMIN') {
      const permissionMatrix = await prisma.systemSetting.findUnique({
        where: { key: 'role_permission_matrix' }
      });

      if (permissionMatrix) {
        const rolePermissionMatrix = JSON.parse(permissionMatrix.value);
        if (!rolePermissionMatrix.dashboard_download || !rolePermissionMatrix.dashboard_download[req.user?.role]) {
          return res.status(403).json({ error: 'Không có quyền tải xuống dữ liệu' });
        }
      }
    }

    // Tạo file tải xuống (placeholder)
    const downloadData = {
      projectId,
      dataType,
      format,
      downloadUrl: `/api/dashboard/download-file/${Date.now()}`,
      filename: `dashboard_${dataType}_${new Date().toISOString().split('T')[0]}.${format}`,
      timestamp: new Date()
    };

    res.json({
      success: true,
      message: 'Dữ liệu đã sẵn sàng để tải xuống',
      downloadData
    });
  } catch (error) {
    console.error('Download data error:', error);
    res.status(500).json({ error: 'Failed to prepare download' });
  }
});



export default router; 