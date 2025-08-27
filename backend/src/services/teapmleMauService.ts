import fs from 'fs';
import path from 'path';

interface TeapmleMauItem {
  id: string;
  category: string;
  content: string;
  order: number;
  isChecked?: boolean;
  notes?: string;
}

interface TeapmleMauData {
  checklist: {
    id: string;
    name: string;
    projectId: string;
    description: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    project: {
      id: string;
      name: string;
      code: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    items: TeapmleMauItem[];
    _count: {
      items: number;
    };
  };
  currentTab: string;
  items: TeapmleMauItem[];
}

interface CategoryContent {
  category: string;
  items: TeapmleMauItem[];
}

class TeapmleMauService {
  private teapmleMauPath: string;
  private cachedData: Map<string, CategoryContent> | null = null;

  constructor() {
    this.teapmleMauPath = path.join(__dirname, '../../TeapmleMau');
  }

  /**
   * Read and parse all TeapmleMau JSON files
   */
  private async readTeapmleMauFiles(): Promise<CategoryContent[]> {
    try {
      const files = [
        'TempleGiaoThong.json',
        'TempleKeHo.json', 
        'TempleSanNen.json',
        'TempleTuongChan.json',
        'TempleXuLyNen.json'
      ];

      const categoryContents: CategoryContent[] = [];

      for (const file of files) {
        const filePath = path.join(this.teapmleMauPath, file);
        
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const data: TeapmleMauData = JSON.parse(fileContent);
          
          // Extract category from currentTab or first item's category
          const category = data.currentTab || (data.items[0]?.category || 'Unknown');
          
          // Filter items for this category and clean them up
          const items = data.items
            .filter(item => item.category === category)
            .map((item, index) => ({
              id: `${category}-${Date.now()}-${Math.random()}-${index}`,
              category: category,
              content: item.content,
              order: index + 1,
              isChecked: false,
              notes: ''
            }));

          if (items.length > 0) {
            categoryContents.push({
              category,
              items
            });
          }
        }
      }

      return categoryContents;
    } catch (error) {
      console.error('Error reading TeapmleMau files:', error);
      return [];
    }
  }

  /**
   * Get all default categories with their content from TeapmleMau files
   */
  async getDefaultCategoriesWithContent(): Promise<CategoryContent[]> {
    // Use cached data if available
    if (this.cachedData) {
      return Array.from(this.cachedData.values());
    }

    const categoryContents = await this.readTeapmleMauFiles();
    
    // Cache the data
    this.cachedData = new Map();
    categoryContents.forEach(content => {
      this.cachedData!.set(content.category, content);
    });

    return categoryContents;
  }

  /**
   * Get content for a specific category
   */
  async getCategoryContent(categoryName: string): Promise<TeapmleMauItem[]> {
    const allCategories = await this.getDefaultCategoriesWithContent();
    const category = allCategories.find(cat => cat.category === categoryName);
    return category?.items || [];
  }

  /**
   * Get all available category names
   */
  async getAvailableCategories(): Promise<string[]> {
    const allCategories = await this.getDefaultCategoriesWithContent();
    return allCategories.map(cat => cat.category);
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache(): void {
    this.cachedData = null;
  }

  /**
   * Check if TeapmleMau files exist
   */
  async checkTeapmleMauFiles(): Promise<boolean> {
    try {
      const files = [
        'TempleGiaoThong.json',
        'TempleKeHo.json', 
        'TempleSanNen.json',
        'TempleTuongChan.json',
        'TempleXuLyNen.json'
      ];

      for (const file of files) {
        const filePath = path.join(this.teapmleMauPath, file);
        if (!fs.existsSync(filePath)) {
          console.warn(`TeapmleMau file not found: ${file}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking TeapmleMau files:', error);
      return false;
    }
  }
}

export const teapmleMauService = new TeapmleMauService();
export default teapmleMauService;
