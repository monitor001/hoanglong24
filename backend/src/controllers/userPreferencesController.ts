import { Request, Response } from 'express';
import { prisma } from '../db';

// Get user preferences
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const preferences = await prisma.userPreference.findMany({
      where: { 
        userId,
        isActive: true 
      },
      orderBy: { category: 'asc' }
    });

    // Convert to key-value object
    const preferencesObj = preferences.reduce((acc, pref) => {
      acc[pref.key] = {
        value: pref.value,
        category: pref.category,
        updatedAt: pref.updatedAt
      };
      return acc;
    }, {} as Record<string, any>);

    res.json(preferencesObj);
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
};

// Update user preference
export const updateUserPreference = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { key, value, category = 'ui' } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    // Convert value to string if it's not already
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const preference = await prisma.userPreference.upsert({
      where: {
        userId_key: {
          userId,
          key
        }
      },
      update: {
        value: stringValue,
        category,
        updatedAt: new Date()
      },
      create: {
        userId,
        key,
        value: stringValue,
        category
      }
    });

    res.json({
      message: 'User preference updated successfully',
      preference: {
        key: preference.key,
        value: preference.value,
        category: preference.category,
        updatedAt: preference.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user preference:', error);
    res.status(500).json({ error: 'Failed to update user preference' });
  }
};

// Update multiple user preferences
export const updateMultipleUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences must be an array' });
    }

    const results = [];

    for (const pref of preferences) {
      const { key, value, category = 'ui' } = pref;
      
      if (!key || value === undefined) {
        continue;
      }

      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      const preference = await prisma.userPreference.upsert({
        where: {
          userId_key: {
            userId,
            key
          }
        },
        update: {
          value: stringValue,
          category,
          updatedAt: new Date()
        },
        create: {
          userId,
          key,
          value: stringValue,
          category
        }
      });

      results.push({
        key: preference.key,
        value: preference.value,
        category: preference.category,
        updatedAt: preference.updatedAt
      });
    }

    res.json({
      message: 'User preferences updated successfully',
      preferences: results
    });
  } catch (error) {
    console.error('Error updating multiple user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
};

// Delete user preference
export const deleteUserPreference = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ error: 'Preference key is required' });
    }

    await prisma.userPreference.deleteMany({
      where: {
        userId,
        key
      }
    });

    res.json({ message: 'User preference deleted successfully' });
  } catch (error) {
    console.error('Error deleting user preference:', error);
    res.status(500).json({ error: 'Failed to delete user preference' });
  }
};

// Sync preferences from localStorage
export const syncPreferencesFromLocalStorage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { localStorageData } = req.body;

    if (!localStorageData || typeof localStorageData !== 'object') {
      return res.status(400).json({ error: 'localStorageData must be an object' });
    }

    const results = [];

    for (const [key, value] of Object.entries(localStorageData)) {
      if (value !== null && value !== undefined) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        const preference = await prisma.userPreference.upsert({
          where: {
            userId_key: {
              userId,
              key
            }
          },
          update: {
            value: stringValue,
            updatedAt: new Date()
          },
          create: {
            userId,
            key,
            value: stringValue,
            category: 'ui'
          }
        });

        results.push({
          key: preference.key,
          value: preference.value,
          category: preference.category,
          updatedAt: preference.updatedAt
        });
      }
    }

    res.json({
      message: 'Preferences synced successfully',
      syncedPreferences: results
    });
  } catch (error) {
    console.error('Error syncing preferences:', error);
    res.status(500).json({ error: 'Failed to sync preferences' });
  }
};

// Get default preferences (for new users)
export const getDefaultPreferences = async (req: Request, res: Response) => {
  try {
    const defaultPreferences = {
      theme: 'system',
      language: 'en',
      sidebarCollapsed: false,
      isDarkMode: false,
      dashboardLayout: 'default',
      projectView: 'card',
      taskView: 'list',
      documentView: 'grid'
    };

    res.json(defaultPreferences);
  } catch (error) {
    console.error('Error getting default preferences:', error);
    res.status(500).json({ error: 'Failed to get default preferences' });
  }
};
