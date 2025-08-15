import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middlewares/errorHandler';
import { prisma } from '../db';

/**
 * Get all users (with filtering and pagination)
 * @route GET /api/users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Only admins can see all users
    if (req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can access user list');
    }
    
    const { 
      search, 
      role, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter conditions
    const where: any = {};
    
    // Filter by role
    if (role) {
      where.role = role;
    }
    
    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // Get users with pagination and session info
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organization: true,
          createdAt: true,
          updatedAt: true,
          twoFactorSecret: true,
          lastLogin: true,
          department: true,
          phone: true,
          status: true,
          projects: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          sessions: {
            where: {
              isActive: true,
              expiresAt: {
                gt: new Date()
              }
            },
            select: {
              id: true,
              ipAddress: true,
              deviceInfo: true,
              lastActivity: true,
              createdAt: true
            },
            orderBy: {
              lastActivity: 'desc'
            },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);
    
    // Transform users to include session and activity info
    const transformedUsers = users.map(user => {
      const activeSession = user.sessions[0];
      const isOnline = activeSession && 
        activeSession.lastActivity && 
        (new Date().getTime() - new Date(activeSession.lastActivity).getTime()) < 5 * 60 * 1000; // 5 minutes
      
      return {
        ...user,
        twoFactorEnabled: !!user.twoFactorSecret,
        twoFactorSecret: undefined,
        projects: user.projects.map((pm: any) => pm.project.name),
        // Session and activity info
        isOnline,
        currentIp: activeSession?.ipAddress || null,
        deviceInfo: activeSession?.deviceInfo || null,
        lastActivity: activeSession?.lastActivity || null,
        sessions: undefined // Remove sessions array from response
      };
    });
    
    res.status(200).json({
      users: transformedUsers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
};

/**
 * Get users for task assignment (project members can see users in their projects)
 * @route GET /api/users/assignable
 */
export const getAssignableUsers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      throw new ApiError(400, 'Project ID is required');
    }
    
    // Check if user has access to this project
    if (req.user?.role !== 'ADMIN') {
      const projectMembership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user?.id as string,
            projectId: projectId as string
          }
        }
      });
      
      if (!projectMembership) {
        throw new ApiError(403, 'You do not have access to this project');
      }
    }
    
    // Get all users who are members of this project
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: projectId as string
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    const users = projectMembers.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
      projectRole: member.role
    }));
    
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get assignable users error:', error);
      res.status(500).json({ error: 'Failed to fetch assignable users' });
    }
  }
};

/**
 * Test endpoint - no authentication required
 * @route GET /api/users/test
 */
export const testUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 5
    });
    
    res.status(200).json({
      message: 'Test endpoint working',
      users: users
    });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({ error: 'Failed to fetch test users' });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Users can only see their own profile unless they're admins
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      throw new ApiError(403, 'Forbidden: You can only view your own profile');
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
        twoFactorSecret: true,
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            documents: true,
            tasks: true
          }
        }
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Transform user to hide sensitive info
    const transformedUser = {
      ...user,
      twoFactorEnabled: !!user.twoFactorSecret,
      twoFactorSecret: undefined
    };
    
    res.status(200).json(transformedUser);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};

/**
 * Create user (admin only)
 * @route POST /api/users
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    // Only admins can create users
    if (req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can create users');
    }
    
    const { email, password, name, role, organization, phone, department, status } = req.body;
    
    // Validate input
    if (!email || !password || !name || !role) {
      throw new ApiError(400, 'Email, password, name, and role are required');
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Prepare user data
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role,
      organization
    };
    
    // Add optional fields if provided
    if (phone) userData.phone = phone;
    if (department) userData.department = department;
    if (status) userData.status = status;
    
    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        phone: true,
        department: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, organization, password, phone, department, status, projects } = req.body;
    
    // Users can only update their own profile unless they're admins
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      throw new ApiError(403, 'Forbidden: You can only update your own profile');
    }
    
    // Only admins can update roles
    if (role && req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can update roles');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (organization) updateData.organization = organization;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (status) updateData.status = status;
    if (role && req.user?.role === 'ADMIN') updateData.role = role;
    
    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        phone: true,
        department: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Handle project memberships if provided
    if (projects && Array.isArray(projects)) {
      // First, remove all existing project memberships
      await prisma.projectMember.deleteMany({
        where: { userId: id }
      });
      
      // Then add new project memberships
      for (const projectId of projects) {
        await prisma.projectMember.create({
          data: {
            userId: id,
            projectId: projectId,
            role: 'USER' // Default role for project membership
          }
        });
      }
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    
    // Only admins can delete users
    if (req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can delete users');
    }
    
    // Prevent deleting yourself
    if (req.user?.id === id) {
      throw new ApiError(400, 'You cannot delete your own account');
    }
    
    // Find user with all relationship counts
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            documents: true,
            tasks: true,
            comments: true,
            projectNotes: true,
            activityLogs: true,
            issuesCreated: true,
            issuesAssigned: true,
            calendarEvents: true,
            reports: true,
            calendarEventAttendees: true,
            isoConfigs: true,
            systemSettings: true,
            isoConfigsUpdated: true,
            systemSettingsUpdated: true,
            projectShares: true,
            noteShares: true,
            sharedNotes: true,
            notes: true,
            folders: true,
            designChecklists: true,
            designChecklistTemplates: true,
            designChecklistCategories: true,
            approvalDocuments: true,
            approvalHistory: true,
            approvalComments: true,
            todos: true,
            sessions: true,
            preferences: true
          }
        }
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check if user has associated data and provide detailed information
    const associatedData = [];
    if (user._count.projects > 0) associatedData.push(`${user._count.projects} project(s)`);
    if (user._count.documents > 0) associatedData.push(`${user._count.documents} document(s)`);
    if (user._count.tasks > 0) associatedData.push(`${user._count.tasks} task(s)`);
    if (user._count.comments > 0) associatedData.push(`${user._count.comments} comment(s)`);
    if (user._count.projectNotes > 0) associatedData.push(`${user._count.projectNotes} project note(s)`);
    if (user._count.activityLogs > 0) associatedData.push(`${user._count.activityLogs} activity log(s)`);
    if (user._count.issuesCreated > 0) associatedData.push(`${user._count.issuesCreated} created issue(s)`);
    if (user._count.issuesAssigned > 0) associatedData.push(`${user._count.issuesAssigned} assigned issue(s)`);
    if (user._count.calendarEvents > 0) associatedData.push(`${user._count.calendarEvents} calendar event(s)`);
    if (user._count.reports > 0) associatedData.push(`${user._count.reports} report(s)`);
    if (user._count.todos > 0) associatedData.push(`${user._count.todos} todo(s)`);
    if (user._count.designChecklists > 0) associatedData.push(`${user._count.designChecklists} design checklist(s)`);
    if (user._count.approvalDocuments > 0) associatedData.push(`${user._count.approvalDocuments} approval document(s)`);
    if (user._count.preferences > 0) associatedData.push(`${user._count.preferences} preference(s)`);
    
    if (associatedData.length > 0 && force !== 'true') {
      const dataList = associatedData.join(', ');
      throw new ApiError(400, `Cannot delete user with associated data: ${dataList}. Please reassign or delete this data first.`);
    }
    
        // If force delete is enabled, delete all associated data first
    if (force === 'true' && associatedData.length > 0) {
      console.log(`Force deleting user ${id} with associated data:`, associatedData);
      
            // Delete associated data in the correct order to avoid foreign key constraints
      await prisma.$transaction(async (tx) => {
        try {
          console.log('Starting transaction for user deletion...');
          
          // Delete sessions first
          console.log('Deleting user sessions...');
          await tx.userSession.deleteMany({ where: { userId: id } });
          
          // Delete user preferences
          console.log('Deleting user preferences...');
          await tx.userPreference.deleteMany({ where: { userId: id } });
          
          // Delete activity logs
          console.log('Deleting activity logs...');
          await tx.activityLog.deleteMany({ where: { userId: id } });
          
          // Delete comments
          console.log('Deleting comments...');
          await tx.comment.deleteMany({ where: { userId: id } });
          
          // Delete project notes
          console.log('Deleting project notes...');
          await tx.projectNote.deleteMany({ where: { userId: id } });
          
          // Delete approval comments
          console.log('Deleting approval comments...');
          await tx.approvalComment.deleteMany({ where: { userId: id } });
          
          // Delete approval history
          console.log('Deleting approval history...');
          await tx.approvalHistory.deleteMany({ where: { userId: id } });
          
          // Delete calendar event attendees
          console.log('Deleting calendar event attendees...');
          await tx.calendarEventAttendee.deleteMany({ where: { userId: id } });
          
          // Delete calendar events (created by user)
          console.log('Deleting calendar events...');
          await tx.calendarEvent.deleteMany({ where: { createdById: id } });
          
          // Delete reports (created by user)
          console.log('Deleting reports...');
          await tx.report.deleteMany({ where: { createdById: id } });
          
          // Delete todos
          console.log('Deleting todos...');
          await tx.todo.deleteMany({ where: { userId: id } });
          
          // Delete design checklists (created by user)
          console.log('Deleting design checklists...');
          await tx.designChecklist.deleteMany({ where: { createdById: id } });
          
          // Delete design checklist templates (created by user)
          console.log('Deleting design checklist templates...');
          await tx.designChecklistTemplate.deleteMany({ where: { createdById: id } });
          
          // Delete design checklist categories (created by user)
          console.log('Deleting design checklist categories...');
          try {
            const deletedCategories = await tx.designChecklistCategory.deleteMany({ where: { createdById: id } });
            console.log(`Deleted ${deletedCategories.count} design checklist categories`);
          } catch (categoryError) {
            console.error('Error deleting design checklist categories:', categoryError);
            // If categories can't be deleted, try to update them to have a different creator
            console.log('Attempting to reassign design checklist categories...');
            try {
              await tx.designChecklistCategory.updateMany({
                where: { createdById: id },
                data: { 
                  createdById: req.user?.id || '00000000-0000-0000-0000-000000000000',
                  updatedAt: new Date()
                }
              });
              console.log('Successfully reassigned design checklist categories');
            } catch (reassignError) {
              console.error('Error reassigning design checklist categories:', reassignError);
              // If reassignment also fails, we need to handle this differently
              throw new Error(`Cannot delete user because they have created design checklist categories that cannot be reassigned: ${reassignError.message}`);
            }
          }
          
          // Double-check that all categories have been handled
          const remainingCategories = await tx.designChecklistCategory.findMany({ where: { createdById: id } });
          if (remainingCategories.length > 0) {
            console.log(`Found ${remainingCategories.length} remaining categories, attempting to delete them...`);
            await tx.designChecklistCategory.deleteMany({ where: { createdById: id } });
          }
          
          // Delete ISO configs (created by user)
          console.log('Deleting ISO configs...');
          await tx.iSOConfig.deleteMany({ where: { createdById: id } });
          
          // Delete ISO configs (updated by user)
          console.log('Deleting ISO configs updated by user...');
          await tx.iSOConfig.deleteMany({ where: { updatedById: id } });
          
          // Delete system settings (created by user)
          console.log('Deleting system settings...');
          await tx.systemSetting.deleteMany({ where: { createdById: id } });
          
          // Delete system settings (updated by user)
          console.log('Deleting system settings updated by user...');
          await tx.systemSetting.deleteMany({ where: { updatedById: id } });
          
          // Delete role permissions (granted by user)
          console.log('Deleting role permissions granted by user...');
          await tx.rolePermission.deleteMany({ where: { grantedById: id } });
          
          // Delete role permissions (user's role permissions)
          console.log('Deleting user role permissions...');
          await tx.rolePermission.deleteMany({ where: { userId: id } });
          
          // Delete notes
          console.log('Deleting notes...');
          await tx.note.deleteMany({ where: { userId: id } });
          
          // Delete folders
          console.log('Deleting folders...');
          await tx.folder.deleteMany({ where: { userId: id } });
          
          // Delete note shares (shared by user)
          console.log('Deleting note shares...');
          await tx.noteShare.deleteMany({ where: { sharedById: id } });
          
          // Delete note shares (shared with user)
          console.log('Deleting note shares shared with user...');
          await tx.noteShare.deleteMany({ where: { sharedWithId: id } });
          
          // Delete project shares (shared by user)
          console.log('Deleting project shares...');
          await tx.projectShare.deleteMany({ where: { sharedById: id } });
          
          // Delete issues (both created and assigned)
          console.log('Deleting issues...');
          await tx.issue.deleteMany({ where: { createdById: id } });
          await tx.issue.deleteMany({ where: { assigneeId: id } });
          
          // Delete tasks (assigned to user)
          console.log('Deleting tasks...');
          await tx.task.deleteMany({ where: { assigneeId: id } });
          
          // Delete documents (uploaded by user)
          console.log('Deleting documents...');
          await tx.document.deleteMany({ where: { uploaderId: id } });
          
          // Delete approval documents (assigned to user)
          console.log('Deleting approval documents...');
          await tx.approvalDocument.deleteMany({ where: { assignedToId: id } });
          
          // Delete project members
          console.log('Deleting project members...');
          await tx.projectMember.deleteMany({ where: { userId: id } });
          
          // Finally delete the user
          console.log('Deleting user...');
          await tx.user.delete({ where: { id } });
          
          console.log('User deletion transaction completed successfully');
        } catch (txError) {
          console.error('Transaction error during user deletion:', txError);
          console.error('Error details:', {
            message: txError.message,
            code: txError.code,
            meta: txError.meta,
            stack: txError.stack
          });
          
          // If it's a foreign key constraint error, try a different approach
          if (txError.code === 'P2003') {
            console.log('Foreign key constraint detected, attempting reassignment approach...');
            
            // Try to reassign all records to the current admin user instead of deleting
            const adminId = req.user?.id || '00000000-0000-0000-0000-000000000000';
            
            console.log('Reassigning records to admin user...');
            
            // Reassign design checklist categories
            await tx.designChecklistCategory.updateMany({
              where: { createdById: id },
              data: { createdById: adminId, updatedAt: new Date() }
            });
            
            // Reassign ISO configs
            await tx.iSOConfig.updateMany({
              where: { createdById: id },
              data: { createdById: adminId, updatedAt: new Date() }
            });
            
            await tx.iSOConfig.updateMany({
              where: { updatedById: id },
              data: { updatedById: adminId, updatedAt: new Date() }
            });
            
            // Reassign system settings
            await tx.systemSetting.updateMany({
              where: { createdById: id },
              data: { createdById: adminId, updatedAt: new Date() }
            });
            
            await tx.systemSetting.updateMany({
              where: { updatedById: id },
              data: { updatedById: adminId, updatedAt: new Date() }
            });
            
            // Reassign role permissions
            await tx.rolePermission.updateMany({
              where: { grantedById: id },
              data: { grantedById: adminId }
            });
            
            // Now delete the user
            await tx.user.delete({ where: { id } });
            
            console.log('User deletion completed using reassignment approach');
            return;
          }
          
          throw txError;
        }
      });
      
      res.status(200).json({ 
        message: 'User and all associated data deleted successfully',
        deletedData: associatedData
      });
    } else {
      // Normal delete (no associated data)
      await prisma.user.delete({
        where: { id }
      });
      
      res.status(200).json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete user error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta
      });
      res.status(500).json({ 
        error: 'Failed to delete user',
        details: error.message,
        code: error.code,
        meta: error.meta
      });
    }
  }
};

/**
 * Get user details with associated data counts
 * @route GET /api/users/:id/details
 */
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Only admins can see detailed user information
    if (req.user?.role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden: Only admins can access user details');
    }
    
    // Find user with all relationship counts
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            documents: true,
            tasks: true,
            comments: true,
            projectNotes: true,
            activityLogs: true,
            issuesCreated: true,
            issuesAssigned: true,
            calendarEvents: true,
            reports: true,
            calendarEventAttendees: true,
            isoConfigs: true,
            systemSettings: true,
            isoConfigsUpdated: true,
            systemSettingsUpdated: true,
            projectShares: true,
            noteShares: true,
            sharedNotes: true,
            notes: true,
            folders: true,
            designChecklists: true,
            designChecklistTemplates: true,
            designChecklistCategories: true,
            approvalDocuments: true,
            approvalHistory: true,
            approvalComments: true,
            todos: true,
            sessions: true
          }
        }
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user details error:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  }
};

/**
 * Get user projects
 * @route GET /api/users/:id/projects
 */
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Users can only see their own projects unless they're admins
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      throw new ApiError(403, 'Forbidden: You can only view your own projects');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Get user projects
    const projects = await prisma.projectMember.findMany({
      where: { userId: id },
      include: {
        project: {
          include: {
            _count: {
              select: {
                documents: true,
                tasks: true,
                members: true
              }
            }
          }
        }
      },
      orderBy: { project: { updatedAt: 'desc' } }
    });
    
    res.status(200).json(projects);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user projects error:', error);
      res.status(500).json({ error: 'Failed to fetch user projects' });
    }
  }
};

/**
 * Get user tasks
 * @route GET /api/users/:id/tasks
 */
export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Users can only see their own tasks unless they're admins
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      throw new ApiError(403, 'Forbidden: You can only view your own tasks');
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Build filter conditions
    const where: any = { assigneeId: id };
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    // Get user tasks
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
    
    res.status(200).json(tasks);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch user tasks' });
    }
  }
}; 

/**
 * Get all users for task assignment (no admin required)
 * @route GET /api/users/all
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      role, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter conditions
    const where: any = {};
    
    // Filter by role
    if (role && typeof role === 'string') {
      where.role = role;
    }
    
    // Search by name or email
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Use a single query with cursor-based pagination for better performance
    try {
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organization: true,
          department: true,
          status: true,
          phone: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          projects: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          sessions: {
            where: {
              isActive: true,
              expiresAt: {
                gt: new Date()
              }
            },
            select: {
              id: true,
              ipAddress: true,
              deviceInfo: true,
              lastActivity: true,
              createdAt: true
            },
            orderBy: {
              lastActivity: 'desc'
            },
            take: 1
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: Number(limit)
      });
      
      // Transform users to include session and activity info
      const transformedUsers = users.map(user => {
        const activeSession = user.sessions[0];
        const isOnline = activeSession && 
          activeSession.lastActivity && 
          (new Date().getTime() - new Date(activeSession.lastActivity).getTime()) < 5 * 60 * 1000; // 5 minutes
        
        return {
          ...user,
          projects: user.projects.map((pm: any) => pm.project.name),
          // Session and activity info
          isOnline,
          currentIp: activeSession?.ipAddress || null,
          deviceInfo: activeSession?.deviceInfo || null,
          lastActivity: activeSession?.lastActivity || null,
          sessions: undefined // Remove sessions array from response
        };
      });
      
      // For basic pagination, estimate total based on returned results
      // This reduces database load by avoiding the count query
      const hasMore = users.length === Number(limit);
      const estimatedTotal = hasMore ? skip + users.length + 1 : skip + users.length;
      
      res.status(200).json({
        users: transformedUsers,
        pagination: {
          total: estimatedTotal,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(estimatedTotal / Number(limit)),
          hasMore
        }
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users. Please try again later.' });
  }
}; 