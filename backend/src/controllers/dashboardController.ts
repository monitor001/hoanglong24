import { Request, Response } from 'express';
import { prisma } from '../db';
import { ApiError } from '../middlewares/errorHandler';

/**
 * Get comprehensive dashboard data
 * @route GET /api/dashboard/comprehensive
 */
export const getComprehensiveDashboard = async (req: Request, res: Response) => {
  try {
    const { projectId, timeRange = 'month' } = req.query;
    const userId = req.user?.id || null;
    const userRole = req.user?.role || 'GUEST'; // Default role if no user

    console.log('Dashboard request:', { projectId, timeRange, userId, userRole });

    // Tạm thời bypass permission check để test
    /*
    // Kiểm tra quyền xem dashboard từ database
    if (userRole !== 'ADMIN') {
      // Get permission matrix from database
      const permissionMatrix = await prisma.systemSetting.findUnique({
        where: { key: 'role_permission_matrix' }
      });

      if (permissionMatrix) {
        const rolePermissionMatrix = JSON.parse(permissionMatrix.value);
        
        // Check if user's role has dashboard_view permission
        if (rolePermissionMatrix.dashboard_view) {
          const dashboardRoles = rolePermissionMatrix.dashboard_view;
          
          // Kiểm tra role hiện tại (uppercase)
          if (dashboardRoles[userRole] === true) {
            // Có quyền, tiếp tục
          } else {
            // Kiểm tra role lowercase nếu role hiện tại là uppercase
            const lowercaseRole = userRole.toLowerCase();
            if (dashboardRoles[lowercaseRole] === true) {
              // Có quyền, tiếp tục
            } else {
              // Kiểm tra role uppercase nếu role hiện tại là lowercase
              const uppercaseRole = userRole.toUpperCase();
              if (dashboardRoles[uppercaseRole] !== true) {
                throw new ApiError(403, 'Bạn cần được cấp quyền để thực hiện hành động này');
              }
            }
          }
        } else {
          throw new ApiError(403, 'Bạn cần được cấp quyền để thực hiện hành động này');
        }
      } else {
        // If no permission matrix found, deny access
        throw new ApiError(403, 'Bạn cần được cấp quyền để thực hiện hành động này');
      }
    }
    */

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Build project filter based on user role
    let projectFilter = {};
    if (projectId && projectId !== 'all') {
      // Specific project selected
      projectFilter = { id: projectId as string };
    } else {
      // No specific project - show all projects for now
      projectFilter = {};
    }

    console.log('Project filter:', projectFilter);

    // Get total projects count first
    const totalProjects = await prisma.project.count({ where: projectFilter });
    console.log('Total projects found:', totalProjects);

    // Always continue with dashboard data, even if no projects found
    console.log('Proceeding with dashboard data collection');

    // Build filters for other entities
    let taskFilter = {};
    let issueFilter = {};
    let documentFilter = {};
    let eventFilter = {};

    if (projectId && projectId !== 'all') {
      // Specific project
      taskFilter = { projectId: projectId as string };
      issueFilter = { projectId: projectId as string };
      documentFilter = { projectId: projectId as string };
      eventFilter = { projectId: projectId as string };
    }
    // For all users, show all data (empty filter)

    // Debug queries to check data
    const debugProjects = await prisma.project.findMany({
      take: 5,
      include: {
        members: true,
        _count: {
          select: { tasks: true, issues: true, documents: true }
        }
      }
    });
    console.log('Debug - Sample projects:', debugProjects);

    // Check if user is member of any project
    if (userId) {
      const userMemberships = await prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            select: { id: true, name: true, status: true }
          }
        }
      });
      console.log('User memberships:', userMemberships);
    }

    // Execute queries sequentially to avoid connection pool exhaustion
    const totalTasks = await prisma.task.count({ where: taskFilter });
    const completedTasks = await prisma.task.count({ 
      where: { ...taskFilter, status: 'COMPLETED' }
    });
    const totalIssues = await prisma.issue.count({ where: issueFilter });
    const resolvedIssues = await prisma.issue.count({ 
      where: { ...issueFilter, status: { in: ['RESOLVED', 'CLOSED'] } }
    });
    const totalDocuments = await prisma.document.count({ where: documentFilter });
    const approvedDocuments = await prisma.document.count({ 
      where: { ...documentFilter, status: 'PUBLISHED' }
    });
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ 
      where: { lastLogin: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    });
    const upcomingEvents = await prisma.calendarEvent.count({
      where: { ...eventFilter, startDate: { gte: new Date() } }
    });

    // Get tasks by status
    const tasksByStatusData = await prisma.task.groupBy({
      by: ['status'],
      where: taskFilter,
      _count: true
    });
    const tasksByStatus = tasksByStatusData.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate overdue items - tasks that are past due date but not completed
    const overdueItems = await prisma.task.count({
      where: {
        ...taskFilter,
        dueDate: { lt: new Date() },
        status: { notIn: ['COMPLETED'] }
      }
    });

    // Calculate overdue tasks by status for better breakdown
    const overdueTasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: {
        ...taskFilter,
        dueDate: { lt: new Date() },
        status: { notIn: ['COMPLETED'] }
      },
      _count: true
    });

    // Add overdue information to tasksByStatus
    const tasksByStatusWithOverdue = { ...tasksByStatus };
    overdueTasksByStatus.forEach(item => {
      if (tasksByStatusWithOverdue[item.status]) {
        // Add overdue count as a separate property
        tasksByStatusWithOverdue[`${item.status}_OVERDUE`] = item._count;
      }
    });

    // Calculate completion rate considering overdue tasks
    const totalActiveTasks = totalTasks;
    const effectiveCompletedTasks = completedTasks;
    const completionRate = totalActiveTasks > 0 ? Math.round((effectiveCompletedTasks / totalActiveTasks) * 100) : 0;

    // Get tasks by priority
    const tasksByPriorityData = await prisma.task.groupBy({
      by: ['priority'],
      where: taskFilter,
      _count: true
    });
    const tasksByPriority = tasksByPriorityData.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get tasks by user
    const tasksByUserData = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: { ...taskFilter, assigneeId: { not: null } },
      _count: true,
      orderBy: { _count: { assigneeId: 'desc' } },
      take: 10
    });
    
    const userIds = tasksByUserData.map(item => item.assigneeId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, name: true }
    });
    
    const tasksByUser = tasksByUserData.map(item => ({
      userId: item.assigneeId!,
      userName: users.find(u => u.id === item.assigneeId)?.name || 'Unknown',
      count: item._count
    }));

    // Get issues by priority (instead of severity)
    const issuesByPriorityData = await prisma.issue.groupBy({
      by: ['priority'],
      where: issueFilter,
      _count: true
    });
    const issuesBySeverity = issuesByPriorityData.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get issues by status
    const issuesByStatusData = await prisma.issue.groupBy({
      by: ['status'],
      where: issueFilter,
      _count: true
    });
    const issuesByStatus = issuesByStatusData.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get issues by assignee (user)
    const issuesByUserData = await prisma.issue.groupBy({
      by: ['assigneeId'],
      where: issueFilter,
      _count: true
    });
    
    const issueUserIds = issuesByUserData.map(item => item.assigneeId).filter(Boolean);
    const issueUsers = await prisma.user.findMany({
      where: { id: { in: issueUserIds as string[] } },
      select: { id: true, name: true }
    });
    
    const issuesByUser = issuesByUserData.map(item => ({
      userId: item.assigneeId!,
      userName: issueUsers.find(u => u.id === item.assigneeId)?.name || 'Unknown',
      count: item._count
    }));

    // Calculate average issue resolution time by priority
    let issueResolutionTime = [];
    if (projectId && projectId !== 'all') {
      const resolvedIssues = await prisma.issue.findMany({
        where: {
          projectId: projectId as string,
          status: { in: ['RESOLVED', 'CLOSED'] }
        },
        select: {
          priority: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      const priorityGroups = resolvedIssues.reduce((acc, issue) => {
        const priority = issue.priority;
        if (!acc[priority]) acc[priority] = [];
        acc[priority].push(issue);
        return acc;
      }, {} as Record<string, typeof resolvedIssues>);
      
      issueResolutionTime = Object.entries(priorityGroups).map(([priority, issues]) => {
        const avgDays = issues.reduce((sum, issue) => {
          const days = (issue.updatedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / issues.length;
        
        return {
          severity: priority,
          avgDays: Math.round(avgDays || 0)
        };
      });
    } else {
      const resolvedIssues = await prisma.issue.findMany({
        where: {
          status: { in: ['RESOLVED', 'CLOSED'] }
        },
        select: {
          priority: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      const priorityGroups = resolvedIssues.reduce((acc, issue) => {
        const priority = issue.priority;
        if (!acc[priority]) acc[priority] = [];
        acc[priority].push(issue);
        return acc;
      }, {} as Record<string, typeof resolvedIssues>);
      
      issueResolutionTime = Object.entries(priorityGroups).map(([priority, issues]) => {
        const avgDays = issues.reduce((sum, issue) => {
          const days = (issue.updatedAt.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / issues.length;
        
        return {
          severity: priority,
          avgDays: Math.round(avgDays || 0)
        };
      });
    }

    // Get documents by type
    const documentsByTypeData = await prisma.document.groupBy({
      by: ['fileType'],
      where: documentFilter,
      _count: true
    });
    const documentsByType = documentsByTypeData.reduce((acc, item) => {
      const type = item.fileType?.toUpperCase() || 'OTHER';
      acc[type] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get documents by status
    const documentsByStatusData = await prisma.document.groupBy({
      by: ['status'],
      where: documentFilter,
      _count: true
    });
    const documentsByStatus = documentsByStatusData.reduce((acc, item) => {
      acc[item.status || 'DRAFT'] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get documents timeline (last 6 months)
    const documentsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const count = await prisma.document.count({
        where: {
          ...documentFilter,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });
      
      documentsByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // Get events by type
    const eventsByTypeData = await prisma.calendarEvent.groupBy({
      by: ['type'],
      where: {
        ...eventFilter,
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });
    const eventsByType = eventsByTypeData.reduce((acc, item) => {
      acc[item.type || 'OTHER'] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get events timeline
    const eventsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const count = await prisma.calendarEvent.count({
        where: {
          ...eventFilter,
          startDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });
      
      eventsByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // Get project progress
    let projectProgress = [];
    if (projectId && projectId !== 'all') {
      const project = await prisma.project.findUnique({
        where: { id: projectId as string },
        include: {
          tasks: true
        }
      });
      
      if (project) {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        projectProgress.push({
          projectId: project.id,
          projectName: project.name,
          progress
        });
      }
    } else {
      const projects = await prisma.project.findMany({
        where: projectFilter,
        include: {
          tasks: true
        },
        take: 10
      });
      
      projectProgress = projects.map(project => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          projectId: project.id,
          projectName: project.name,
          progress
        };
      });
    }

    // Get recent activity timeline
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        ...(projectId && projectId !== 'all' ? { objectId: projectId as string } : {}),
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    const activityTimeline = recentActivities.map(activity => ({
      date: activity.createdAt.toISOString(),
      type: activity.objectType.toLowerCase(),
      description: `${activity.user.name} ${activity.action} ${activity.objectType} ${activity.description || ''}`
    }));

    res.json({
      stats: {
        totalProjects,
        activeProjects: totalProjects, // Can be refined based on project status
        totalTasks,
        completedTasks,
        totalActiveTasks,
        completionRate,
        totalIssues,
        resolvedIssues,
        totalDocuments,
        approvedDocuments,
        totalUsers,
        activeUsers,
        upcomingEvents,
        overdueItems
      },
      tasksByStatus: tasksByStatusWithOverdue,
      tasksByPriority,
      tasksByUser,
      issuesBySeverity,
      issuesByStatus,
      issuesByUser,
      issueResolutionTime,
      documentsByType,
      documentsByStatus,
      documentsByMonth,
      eventsByType,
      eventsByMonth,
      projectProgress,
      activityTimeline,
      // Add detailed task statistics
      taskStatistics: {
        totalTasks,
        completedTasks,
        overdueTasks: overdueItems,
        completionRate,
        overdueBreakdown: overdueTasksByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get project-specific metrics
 * @route GET /api/dashboard/project/:projectId
 */
export const getProjectMetrics = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        issues: true,
        documents: true,
        calendarEvents: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate metrics
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
    const overdueTasks = project.tasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'COMPLETED'
    ).length;

    const totalIssues = project.issues.length;
    const criticalIssues = project.issues.filter(i => i.priority === 'HIGH' && i.status !== 'RESOLVED').length;
    const resolvedIssues = project.issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

    const totalDocuments = project.documents.length;
    const approvedDocuments = project.documents.filter(d => d.status === 'PUBLISHED').length;
    const pendingReview = project.documents.filter(d => d.status === 'WORK_IN_PROGRESS').length;

    const upcomingEvents = project.calendarEvents.filter(e => e.startDate > new Date()).length;
    const teamSize = project.members.length;

    res.json({
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description
      },
      metrics: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          overdue: overdueTasks
        },
        issues: {
          total: totalIssues,
          critical: criticalIssues,
          resolved: resolvedIssues,
          resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0
        },
        documents: {
          total: totalDocuments,
          approved: approvedDocuments,
          pendingReview,
          approvalRate: totalDocuments > 0 ? Math.round((approvedDocuments / totalDocuments) * 100) : 0
        },
        events: {
          upcoming: upcomingEvents
        },
        team: {
          size: teamSize,
          members: project.members.map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role
          }))
        }
      }
    });
  } catch (error) {
    console.error('Project metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch project metrics' });
  }
};