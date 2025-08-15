import { Request, Response } from 'express';
import { prisma } from '../db';

// Share a note with users
export const shareNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id: noteId } = req.params;
    const { sharedWith, message, permissions } = req.body;

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Create share records for each user
    const sharePromises = sharedWith.map((userId: string) =>
      prisma.noteShare.create({
        data: {
          noteId,
          sharedById: userId,
          sharedWithId: userId,
          permissions: permissions || 'read',
          message,
          status: 'PENDING'
        },
        include: {
          sharedWith: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    );

    const shares = await Promise.all(sharePromises);

    res.status(201).json({
      message: 'Note shared successfully',
      shares
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ error: 'Failed to share note' });
  }
};

// Get all shares for a note
export const getNoteShares = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id: noteId } = req.params;

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const shares = await prisma.noteShare.findMany({
      where: {
        noteId
      },
      include: {
        sharedWith: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sharedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(shares);
  } catch (error) {
    console.error('Error fetching note shares:', error);
    res.status(500).json({ error: 'Failed to fetch note shares' });
  }
};

// Revoke a note share
export const revokeNoteShare = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id: noteId, shareId } = req.params;

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if share exists
    const share = await prisma.noteShare.findFirst({
      where: {
        id: shareId,
        noteId
      }
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    await prisma.noteShare.delete({
      where: {
        id: shareId
      }
    });

    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    console.error('Error revoking note share:', error);
    res.status(500).json({ error: 'Failed to revoke share' });
  }
};

// Get shared notes for current user
export const getSharedNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const sharedNotes = await prisma.noteShare.findMany({
      where: {
        sharedWithId: userId,
        status: 'ACCEPTED'
      },
      include: {
        note: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            folder: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        sharedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(sharedNotes);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Failed to fetch shared notes' });
  }
};

// Accept or decline a note share
export const respondToShare = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { shareId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const share = await prisma.noteShare.findFirst({
      where: {
        id: shareId,
        sharedWithId: userId
      }
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    const status = action === 'accept' ? 'ACCEPTED' : 'DECLINED';

    await prisma.noteShare.update({
      where: {
        id: shareId
      },
      data: {
        status
      }
    });

    res.json({ 
      message: `Share ${action === 'accept' ? 'accepted' : 'declined'} successfully` 
    });
  } catch (error) {
    console.error('Error responding to share:', error);
    res.status(500).json({ error: 'Failed to respond to share' });
  }
}; 