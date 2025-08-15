import { prisma } from '../db';
import { sendMail } from './email';
import { Server } from 'socket.io';

declare const io: Server;

export interface TaskNotification {
  id: string;
  type: 'overdue' | 'upcoming' | 'assigned' | 'completed';
  taskId: string;
  userId: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  read: boolean;
}

/**
 * Send overdue task notifications
 */
export const sendOverdueTaskNotifications = async () => {
  try {
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['COMPLETED'] }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    for (const task of overdueTasks) {
      if (task.assignee?.email) {
        // Send email notification
        await sendMail({
          to: task.assignee.email,
          subject: `🚨 Nhiệm vụ quá hạn: ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff4d4f;">🚨 Nhiệm vụ quá hạn</h2>
              <div style="background-color: #fff2f0; border: 1px solid #ffccc7; padding: 15px; border-radius: 5px;">
                <h3>${task.title}</h3>
                <p><strong>Dự án:</strong> ${task.project.name}</p>
                <p><strong>Mã nhiệm vụ:</strong> ${task.code}</p>
                <p><strong>Hạn hoàn thành:</strong> ${task.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Độ ưu tiên:</strong> ${task.priority}</p>
                <p><strong>Trạng thái:</strong> ${task.status}</p>
                ${task.description ? `<p><strong>Mô tả:</strong> ${task.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng truy cập hệ thống để cập nhật trạng thái nhiệm vụ này.
              </p>
            </div>
          `
        });

        // Send real-time notification via Socket.IO
        io.to(`user_${task.assignee.id}`).emit('taskNotification', {
          type: 'overdue',
          taskId: task.id,
          message: `Nhiệm vụ "${task.title}" đã quá hạn`,
          priority: 'critical',
          task: {
            id: task.id,
            title: task.title,
            code: task.code,
            project: task.project.name,
            dueDate: task.dueDate
          }
        });
      }
    }

    console.log(`Sent overdue notifications for ${overdueTasks.length} tasks`);
  } catch (error) {
    console.error('Error sending overdue task notifications:', error);
  }
};

/**
 * Send upcoming task notifications (due within 24 hours)
 */
export const sendUpcomingTaskNotifications = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: tomorrow
        },
        status: { notIn: ['COMPLETED'] }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    for (const task of upcomingTasks) {
      if (task.assignee?.email) {
        const hoursUntilDue = Math.ceil((task.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        
        await sendMail({
          to: task.assignee.email,
          subject: `⏰ Nhắc nhở: Nhiệm vụ sắp đến hạn - ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #faad14;">⏰ Nhiệm vụ sắp đến hạn</h2>
              <div style="background-color: #fffbe6; border: 1px solid #ffe58f; padding: 15px; border-radius: 5px;">
                <h3>${task.title}</h3>
                <p><strong>Dự án:</strong> ${task.project.name}</p>
                <p><strong>Mã nhiệm vụ:</strong> ${task.code}</p>
                <p><strong>Hạn hoàn thành:</strong> ${task.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Còn lại:</strong> ${hoursUntilDue} giờ</p>
                <p><strong>Độ ưu tiên:</strong> ${task.priority}</p>
                <p><strong>Trạng thái:</strong> ${task.status}</p>
                ${task.description ? `<p><strong>Mô tả:</strong> ${task.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng hoàn thành nhiệm vụ này trước khi hết hạn.
              </p>
            </div>
          `
        });

        // Send real-time notification
        io.to(`user_${task.assignee.id}`).emit('taskNotification', {
          type: 'upcoming',
          taskId: task.id,
          message: `Nhiệm vụ "${task.title}" sắp đến hạn (còn ${hoursUntilDue} giờ)`,
          priority: hoursUntilDue <= 6 ? 'high' : 'medium',
          task: {
            id: task.id,
            title: task.title,
            code: task.code,
            project: task.project.name,
            dueDate: task.dueDate
          }
        });
      }
    }

    console.log(`Sent upcoming notifications for ${upcomingTasks.length} tasks`);
  } catch (error) {
    console.error('Error sending upcoming task notifications:', error);
  }
};

/**
 * Send task assignment notification
 */
export const sendTaskAssignmentNotification = async (taskId: string, assigneeId: string) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (task?.assignee?.email) {
      await sendMail({
        to: task.assignee.email,
        subject: `📋 Nhiệm vụ mới được gán: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1890ff;">📋 Nhiệm vụ mới được gán</h2>
            <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; padding: 15px; border-radius: 5px;">
              <h3>${task.title}</h3>
              <p><strong>Dự án:</strong> ${task.project.name}</p>
              <p><strong>Mã nhiệm vụ:</strong> ${task.code}</p>
              <p><strong>Hạn hoàn thành:</strong> ${task.dueDate?.toLocaleDateString('vi-VN') || 'Chưa có'}</p>
              <p><strong>Độ ưu tiên:</strong> ${task.priority}</p>
              <p><strong>Trạng thái:</strong> ${task.status}</p>
              ${task.description ? `<p><strong>Mô tả:</strong> ${task.description}</p>` : ''}
            </div>
            <p style="margin-top: 20px;">
              Vui lòng truy cập hệ thống để xem chi tiết và bắt đầu thực hiện nhiệm vụ.
            </p>
          </div>
        `
      });

      // Send real-time notification
      io.to(`user_${task.assignee.id}`).emit('taskNotification', {
        type: 'assigned',
        taskId: task.id,
        message: `Bạn được gán nhiệm vụ mới: "${task.title}"`,
        priority: 'medium',
        task: {
          id: task.id,
          title: task.title,
          code: task.code,
          project: task.project.name,
          dueDate: task.dueDate
        }
      });
    }
  } catch (error) {
    console.error('Error sending task assignment notification:', error);
  }
};

/**
 * Send task completion notification to project manager
 */
export const sendTaskCompletionNotification = async (taskId: string) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            members: {
              where: {
                role: { in: ['PROJECT_MANAGER'] }
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (task) {
      const managers = task.project.members.map(m => m.user);
      
      for (const manager of managers) {
        if (manager.email) {
          await sendMail({
            to: manager.email,
            subject: `✅ Nhiệm vụ hoàn thành: ${task.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #52c41a;">✅ Nhiệm vụ hoàn thành</h2>
                <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; padding: 15px; border-radius: 5px;">
                  <h3>${task.title}</h3>
                  <p><strong>Dự án:</strong> ${task.project.name}</p>
                  <p><strong>Mã nhiệm vụ:</strong> ${task.code}</p>
                  <p><strong>Người thực hiện:</strong> ${task.assignee?.name}</p>
                  <p><strong>Ngày hoàn thành:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                  ${task.description ? `<p><strong>Mô tả:</strong> ${task.description}</p>` : ''}
                </div>
                <p style="margin-top: 20px;">
                  Nhiệm vụ đã được hoàn thành. Vui lòng kiểm tra và phê duyệt nếu cần.
                </p>
              </div>
            `
          });

          // Send real-time notification
          io.to(`user_${manager.id}`).emit('taskNotification', {
            type: 'completed',
            taskId: task.id,
            message: `Nhiệm vụ "${task.title}" đã được hoàn thành bởi ${task.assignee?.name}`,
            priority: 'low',
            task: {
              id: task.id,
              title: task.title,
              code: task.code,
              project: task.project.name,
              assignee: task.assignee?.name
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending task completion notification:', error);
  }
};

/**
 * Send warning notifications for tasks due within 3 days
 */
export const sendWarningTaskNotifications = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const warningTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: threeDaysFromNow
        },
        status: { notIn: ['COMPLETED'] }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    for (const task of warningTasks) {
      if (task.assignee?.email) {
        const daysUntilDue = Math.ceil((task.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Send email notification
        await sendMail({
          to: task.assignee.email,
          subject: `⚠️ Cảnh báo: Nhiệm vụ sắp đến hạn - ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #fa8c16;">⚠️ Cảnh báo: Nhiệm vụ sắp đến hạn</h2>
              <div style="background-color: #fff7e6; border: 1px solid #ffd591; padding: 15px; border-radius: 5px;">
                <h3>${task.title}</h3>
                <p><strong>Dự án:</strong> ${task.project.name}</p>
                <p><strong>Mã nhiệm vụ:</strong> ${task.code}</p>
                <p><strong>Hạn hoàn thành:</strong> ${task.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Còn lại:</strong> ${daysUntilDue} ngày</p>
                <p><strong>Độ ưu tiên:</strong> ${task.priority}</p>
                <p><strong>Trạng thái:</strong> ${task.status}</p>
                ${task.description ? `<p><strong>Mô tả:</strong> ${task.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng hoàn thành nhiệm vụ này trước khi hết hạn để tránh bị quá hạn.
              </p>
            </div>
          `
        });

        // Send real-time notification via Socket.IO
        io.to(`user_${task.assignee.id}`).emit('taskNotification', {
          type: 'warning',
          taskId: task.id,
          message: `Nhiệm vụ "${task.title}" sắp đến hạn (còn ${daysUntilDue} ngày)`,
          priority: 'high',
          task: {
            id: task.id,
            title: task.title,
            code: task.code,
            project: task.project.name,
            dueDate: task.dueDate
          }
        });
      }
    }

    console.log(`Sent warning notifications for ${warningTasks.length} tasks`);
  } catch (error) {
    console.error('Error sending warning task notifications:', error);
  }
};

/**
 * Send overdue issue notifications
 */
export const sendOverdueIssueNotifications = async () => {
  try {
    const overdueIssues = await prisma.issue.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['RESOLVED', 'CLOSED'] }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    for (const issue of overdueIssues) {
      if (issue.assignee?.email) {
        // Send email notification
        await sendMail({
          to: issue.assignee.email,
          subject: `🚨 Vấn đề quá hạn: ${issue.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff4d4f;">🚨 Vấn đề quá hạn</h2>
              <div style="background-color: #fff2f0; border: 1px solid #ffccc7; padding: 15px; border-radius: 5px;">
                <h3>${issue.title}</h3>
                <p><strong>Dự án:</strong> ${issue.project?.name || 'N/A'}</p>
                <p><strong>Mã vấn đề:</strong> ${issue.code}</p>
                <p><strong>Loại:</strong> ${issue.type}</p>
                <p><strong>Hạn xử lý:</strong> ${issue.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Độ ưu tiên:</strong> ${issue.priority}</p>
                <p><strong>Trạng thái:</strong> ${issue.status}</p>
                ${issue.description ? `<p><strong>Mô tả:</strong> ${issue.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng truy cập hệ thống để cập nhật trạng thái vấn đề này.
              </p>
            </div>
          `
        });

        // Send real-time notification via Socket.IO
        io.to(`user_${issue.assignee.id}`).emit('issueNotification', {
          type: 'overdue',
          issueId: issue.id,
          message: `Vấn đề "${issue.title}" đã quá hạn`,
          priority: 'critical',
          issue: {
            id: issue.id,
            title: issue.title,
            code: issue.code,
            project: issue.project?.name,
            dueDate: issue.dueDate
          }
        });
      }
    }

    console.log(`Sent overdue notifications for ${overdueIssues.length} issues`);
  } catch (error) {
    console.error('Error sending overdue issue notifications:', error);
  }
};

/**
 * Send warning notifications for issues due within 3 days
 */
export const sendWarningIssueNotifications = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const warningIssues = await prisma.issue.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: threeDaysFromNow
        },
        status: { notIn: ['RESOLVED', 'CLOSED'] }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    for (const issue of warningIssues) {
      if (issue.assignee?.email) {
        const daysUntilDue = Math.ceil((issue.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Send email notification
        await sendMail({
          to: issue.assignee.email,
          subject: `⚠️ Cảnh báo: Vấn đề sắp đến hạn - ${issue.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #fa8c16;">⚠️ Cảnh báo: Vấn đề sắp đến hạn</h2>
              <div style="background-color: #fff7e6; border: 1px solid #ffd591; padding: 15px; border-radius: 5px;">
                <h3>${issue.title}</h3>
                <p><strong>Dự án:</strong> ${issue.project?.name || 'N/A'}</p>
                <p><strong>Mã vấn đề:</strong> ${issue.code}</p>
                <p><strong>Loại:</strong> ${issue.type}</p>
                <p><strong>Hạn xử lý:</strong> ${issue.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Còn lại:</strong> ${daysUntilDue} ngày</p>
                <p><strong>Độ ưu tiên:</strong> ${issue.priority}</p>
                <p><strong>Trạng thái:</strong> ${issue.status}</p>
                ${issue.description ? `<p><strong>Mô tả:</strong> ${issue.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng xử lý vấn đề này trước khi hết hạn để tránh bị quá hạn.
              </p>
            </div>
          `
        });

        // Send real-time notification via Socket.IO
        io.to(`user_${issue.assignee.id}`).emit('issueNotification', {
          type: 'warning',
          issueId: issue.id,
          message: `Vấn đề "${issue.title}" sắp đến hạn (còn ${daysUntilDue} ngày)`,
          priority: 'high',
          issue: {
            id: issue.id,
            title: issue.title,
            code: issue.code,
            project: issue.project?.name,
            dueDate: issue.dueDate
          }
        });
      }
    }

    console.log(`Sent warning notifications for ${warningIssues.length} issues`);
  } catch (error) {
    console.error('Error sending warning issue notifications:', error);
  }
};

/**
 * Get user notifications (placeholder - requires Notification model)
 */
export const getUserNotifications = async (userId: string) => {
  try {
    // TODO: Implement when Notification model is added to schema
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read (placeholder - requires Notification model)
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    // TODO: Implement when Notification model is added to schema
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}; 