import { prisma } from '../db';
import { sendMail } from './email';
import { createNotification } from '../services/notificationService';
import { NotificationType, NotificationPriority } from '@prisma/client';

/**
 * Send overdue task notifications
 */
export const sendOverdueTaskNotifications = async () => {
  try {
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: new Date()
        },
        status: {
          not: 'COMPLETED'
        }
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
            name: true
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
              <h2 style="color: #f5222d;">🚨 Nhiệm vụ quá hạn</h2>
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
                Vui lòng hoàn thành nhiệm vụ này càng sớm càng tốt.
              </p>
            </div>
          `
        });

        // Create in-app notification
        await createNotification({
          type: NotificationType.TASK_OVERDUE,
          title: 'Nhiệm vụ quá hạn',
          message: `Nhiệm vụ "${task.title}" đã quá hạn`,
          priority: NotificationPriority.CRITICAL,
          userId: task.assignee.id,
          relatedId: task.id,
          relatedType: 'task',
          data: {
            taskId: task.id,
            taskTitle: task.title,
            taskCode: task.code,
            projectName: task.project.name,
            dueDate: task.dueDate,
            daysOverdue: Math.ceil((new Date().getTime() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24))
          },
          sendEmail: false // Already sent above
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
        status: {
          not: 'COMPLETED'
        }
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
            name: true
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

        // Create in-app notification
        await createNotification({
          type: NotificationType.TASK_UPCOMING,
          title: 'Nhiệm vụ sắp đến hạn',
          message: `Nhiệm vụ "${task.title}" sắp đến hạn (còn ${hoursUntilDue} giờ)`,
          priority: hoursUntilDue <= 6 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
          userId: task.assignee.id,
          relatedId: task.id,
          relatedType: 'task',
          data: {
            taskId: task.id,
            taskTitle: task.title,
            taskCode: task.code,
            projectName: task.project.name,
            dueDate: task.dueDate,
            hoursUntilDue
          },
          sendEmail: false // Already sent above
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
            name: true
          }
        }
      }
    });

    if (task && task.assignee?.email) {
      await sendMail({
        to: task.assignee.email,
        subject: `📋 Nhiệm vụ mới được gán: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1890ff;">📋 Nhiệm vụ mới</h2>
            <div style="background-color: #f0f9ff; border: 1px solid #91d5ff; padding: 15px; border-radius: 5px;">
              <h3>${task.title}</h3>
              <p><strong>Dự án:</strong> ${task.project.name}</p>
              <p><strong>Mã nhiệm vụ:</strong> ${task.code}</p>
              <p><strong>Hạn hoàn thành:</strong> ${task.dueDate?.toLocaleDateString('vi-VN') || 'Chưa có'}</p>
              <p><strong>Độ ưu tiên:</strong> ${task.priority}</p>
              <p><strong>Trạng thái:</strong> ${task.status}</p>
              ${task.description ? `<p><strong>Mô tả:</strong> ${task.description}</p>` : ''}
            </div>
            <p style="margin-top: 20px;">
              Vui lòng kiểm tra và bắt đầu thực hiện nhiệm vụ này.
            </p>
          </div>
        `
      });

      // Create in-app notification
      await createNotification({
        type: NotificationType.TASK_ASSIGNED,
        title: 'Nhiệm vụ mới được gán',
        message: `Bạn được gán nhiệm vụ mới: "${task.title}"`,
        priority: NotificationPriority.MEDIUM,
        userId: task.assignee.id,
        relatedId: task.id,
        relatedType: 'task',
        data: {
          taskId: task.id,
          taskTitle: task.title,
          taskCode: task.code,
          projectName: task.project.name,
          dueDate: task.dueDate,
          priority: task.priority
        },
        sendEmail: false // Already sent above
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
            members: {
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
            }
          }
        }
      }
    });

    if (task) {
      const managers = task.project.members
        .filter(m => ['ADMIN', 'PROJECT_MANAGER'].includes(m.user.role))
        .map(m => m.user);
      
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

          // Create in-app notification
          await createNotification({
            type: NotificationType.TASK_COMPLETED,
            title: 'Nhiệm vụ hoàn thành',
            message: `Nhiệm vụ "${task.title}" đã được hoàn thành bởi ${task.assignee?.name}`,
            priority: NotificationPriority.LOW,
            userId: manager.id,
            relatedId: task.id,
            relatedType: 'task',
            data: {
              taskId: task.id,
              taskTitle: task.title,
              taskCode: task.code,
              projectName: task.project.name,
              assigneeName: task.assignee?.name,
              completedAt: new Date()
            },
            sendEmail: false // Already sent above
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
        status: {
          not: 'COMPLETED'
        }
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
            name: true
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

        // Create in-app notification
        await createNotification({
          type: NotificationType.TASK_UPCOMING,
          title: 'Cảnh báo: Nhiệm vụ sắp đến hạn',
          message: `Nhiệm vụ "${task.title}" sắp đến hạn (còn ${daysUntilDue} ngày)`,
          priority: NotificationPriority.HIGH,
          userId: task.assignee.id,
          relatedId: task.id,
          relatedType: 'task',
          data: {
            taskId: task.id,
            taskTitle: task.title,
            taskCode: task.code,
            projectName: task.project.name,
            dueDate: task.dueDate,
            daysUntilDue
          },
          sendEmail: false // Already sent above
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
        dueDate: {
          lt: new Date()
        },
        status: {
          not: 'RESOLVED'
        }
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
            name: true
          }
        }
      }
    });

    for (const issue of overdueIssues) {
      if (issue.assignee?.email) {
        await sendMail({
          to: issue.assignee.email,
          subject: `🚨 Vấn đề quá hạn: ${issue.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f5222d;">🚨 Vấn đề quá hạn</h2>
              <div style="background-color: #fff2f0; border: 1px solid #ffccc7; padding: 15px; border-radius: 5px;">
                <h3>${issue.title}</h3>
                <p><strong>Dự án:</strong> ${issue.project?.name || 'Không xác định'}</p>
                <p><strong>Mã vấn đề:</strong> ${issue.code}</p>
                <p><strong>Hạn giải quyết:</strong> ${issue.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Độ ưu tiên:</strong> ${issue.priority}</p>
                <p><strong>Trạng thái:</strong> ${issue.status}</p>
                ${issue.description ? `<p><strong>Mô tả:</strong> ${issue.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng giải quyết vấn đề này càng sớm càng tốt.
              </p>
            </div>
          `
        });

        // Create in-app notification
        await createNotification({
          type: NotificationType.ISSUE_OVERDUE,
          title: 'Vấn đề quá hạn',
          message: `Vấn đề "${issue.title}" đã quá hạn`,
          priority: NotificationPriority.CRITICAL,
          userId: issue.assignee.id,
          relatedId: issue.id,
          relatedType: 'issue',
          data: {
            issueId: issue.id,
            issueTitle: issue.title,
            issueCode: issue.code,
            projectName: issue.project?.name,
            dueDate: issue.dueDate,
            daysOverdue: Math.ceil((new Date().getTime() - issue.dueDate!.getTime()) / (1000 * 60 * 60 * 24))
          },
          sendEmail: false // Already sent above
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
        status: {
          not: 'RESOLVED'
        }
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
            name: true
          }
        }
      }
    });

    for (const issue of warningIssues) {
      if (issue.assignee?.email) {
        const daysUntilDue = Math.ceil((issue.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        await sendMail({
          to: issue.assignee.email,
          subject: `⚠️ Cảnh báo: Vấn đề sắp đến hạn - ${issue.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #fa8c16;">⚠️ Cảnh báo: Vấn đề sắp đến hạn</h2>
              <div style="background-color: #fff7e6; border: 1px solid #ffd591; padding: 15px; border-radius: 5px;">
                <h3>${issue.title}</h3>
                <p><strong>Dự án:</strong> ${issue.project?.name || 'Không xác định'}</p>
                <p><strong>Mã vấn đề:</strong> ${issue.code}</p>
                <p><strong>Hạn giải quyết:</strong> ${issue.dueDate?.toLocaleDateString('vi-VN')}</p>
                <p><strong>Còn lại:</strong> ${daysUntilDue} ngày</p>
                <p><strong>Độ ưu tiên:</strong> ${issue.priority}</p>
                <p><strong>Trạng thái:</strong> ${issue.status}</p>
                ${issue.description ? `<p><strong>Mô tả:</strong> ${issue.description}</p>` : ''}
              </div>
              <p style="margin-top: 20px;">
                Vui lòng giải quyết vấn đề này trước khi hết hạn để tránh bị quá hạn.
              </p>
            </div>
          `
        });

        // Create in-app notification
        await createNotification({
          type: NotificationType.ISSUE_OVERDUE,
          title: 'Cảnh báo: Vấn đề sắp đến hạn',
          message: `Vấn đề "${issue.title}" sắp đến hạn (còn ${daysUntilDue} ngày)`,
          priority: NotificationPriority.HIGH,
          userId: issue.assignee.id,
          relatedId: issue.id,
          relatedType: 'issue',
          data: {
            issueId: issue.id,
            issueTitle: issue.title,
            issueCode: issue.code,
            projectName: issue.project?.name,
            dueDate: issue.dueDate,
            daysUntilDue
          },
          sendEmail: false // Already sent above
        });
      }
    }

    console.log(`Sent warning notifications for ${warningIssues.length} issues`);
  } catch (error) {
    console.error('Error sending warning issue notifications:', error);
  }
}; 