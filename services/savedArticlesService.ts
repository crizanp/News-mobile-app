// services/savedArticlesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsItem } from '../types';

const SAVED_ARTICLES_KEY = '@saved_articles';

export interface SavedArticle extends NewsItem {
  savedAt: string; // ISO date string when the article was saved
}

class SavedArticlesService {
  /**
   * Get all saved articles from AsyncStorage
   */
  async getSavedArticles(): Promise<SavedArticle[]> {
    try {
      const savedData = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Sort by savedAt date (most recent first)
        return parsedData.sort((a: SavedArticle, b: SavedArticle) => 
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting saved articles:', error);
      return [];
    }
  }

  /**
   * Save an article
   */
  async saveArticle(article: NewsItem): Promise<boolean> {
    try {
      const savedArticles = await this.getSavedArticles();
      const articleId = this.getArticleId(article);
      
      // Check if article is already saved
      const isAlreadySaved = savedArticles.some(saved => 
        this.getArticleId(saved) === articleId
      );
      
      if (isAlreadySaved) {
        console.log('Article already saved');
        return false;
      }

      // Add saved timestamp
      const savedArticle: SavedArticle = {
        ...article,
        savedAt: new Date().toISOString(),
      };

      // Add to beginning of array (most recent first)
      savedArticles.unshift(savedArticle);

      await AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(savedArticles));
      console.log('Article saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving article:', error);
      return false;
    }
  }

  /**
   * Remove an article from saved articles
   */
  async unsaveArticle(article: NewsItem): Promise<boolean> {
    try {
      const savedArticles = await this.getSavedArticles();
      const articleId = this.getArticleId(article);
      
      const filteredArticles = savedArticles.filter(saved => 
        this.getArticleId(saved) !== articleId
      );

      await AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(filteredArticles));
      console.log('Article unsaved successfully');
      return true;
    } catch (error) {
      console.error('Error unsaving article:', error);
      return false;
    }
  }

  /**
   * Check if an article is saved
   */
  async isArticleSaved(article: NewsItem): Promise<boolean> {
    try {
      const savedArticles = await this.getSavedArticles();
      const articleId = this.getArticleId(article);
      
      return savedArticles.some(saved => 
        this.getArticleId(saved) === articleId
      );
    } catch (error) {
      console.error('Error checking if article is saved:', error);
      return false;
    }
  }

  /**
   * Get saved articles count
   */
  async getSavedArticlesCount(): Promise<number> {
    try {
      const savedArticles = await this.getSavedArticles();
      return savedArticles.length;
    } catch (error) {
      console.error('Error getting saved articles count:', error);
      return 0;
    }
  }

  /**
   * Clear all saved articles
   */
  async clearAllSavedArticles(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(SAVED_ARTICLES_KEY);
      console.log('All saved articles cleared');
      return true;
    } catch (error) {
      console.error('Error clearing saved articles:', error);
      return false;
    }
  }

  /**
   * Get a unique ID for an article
   */
  private getArticleId(article: NewsItem): string {
    // Use multiple fallbacks to ensure we can always generate an ID
    if (article.id) {
      return article.id.toString();
    }
    
    if (article.url) {
      return article.url;
    }
    
    // Generate ID from title and publishedAt as fallback
    const baseString = `${article.title}-${article.publishedAt}`;
    return baseString.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
  }

  /**
   * Export saved articles (for backup/sharing)
   */
  async exportSavedArticles(): Promise<string> {
    try {
      const savedArticles = await this.getSavedArticles();
      return JSON.stringify(savedArticles, null, 2);
    } catch (error) {
      console.error('Error exporting saved articles:', error);
      return '[]';
    }
  }

  /**
   * Import saved articles (for restore)
   */
  async importSavedArticles(jsonData: string): Promise<boolean> {
    try {
      const importedArticles = JSON.parse(jsonData);
      
      if (!Array.isArray(importedArticles)) {
        throw new Error('Invalid data format');
      }

      // Validate each article has required fields
      const validArticles = importedArticles.filter(article => 
        article.title && article.publishedAt
      );

      await AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(validArticles));
      console.log(`Imported ${validArticles.length} articles`);
      return true;
    } catch (error) {
      console.error('Error importing saved articles:', error);
      return false;
    }
  }
}

export const savedArticlesService = new SavedArticlesService();