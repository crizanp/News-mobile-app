// hooks/useSaveArticle.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SavedArticle, savedArticlesService } from '../services/savedArticlesService';
import { NewsItem } from '../types';

export interface UseSaveArticleReturn {
  isArticleSaved: boolean;
  isSaving: boolean;
  savedArticlesCount: number;
  toggleSaveArticle: () => Promise<void>;
  refreshSavedStatus: () => Promise<void>;
}

export const useSaveArticle = (article: NewsItem | null): UseSaveArticleReturn => {
  const [isArticleSaved, setIsArticleSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedArticlesCount, setSavedArticlesCount] = useState<number>(0);

  // Check if article is saved and get saved count
  const refreshSavedStatus = useCallback(async () => {
    if (!article) {
      setIsArticleSaved(false);
      return;
    }

    try {
      const [isSaved, count] = await Promise.all([
        savedArticlesService.isArticleSaved(article),
        savedArticlesService.getSavedArticlesCount()
      ]);
      
      setIsArticleSaved(isSaved);
      setSavedArticlesCount(count);
    } catch (error) {
      console.error('Error refreshing saved status:', error);
    }
  }, [article]);

  // Toggle save/unsave article
  const toggleSaveArticle = useCallback(async () => {
    if (!article || isSaving) return;

    setIsSaving(true);
    
    try {
      let success = false;
      
      if (isArticleSaved) {
        // Unsave article
        success = await savedArticlesService.unsaveArticle(article);
        if (success) {
          setIsArticleSaved(false);
          setSavedArticlesCount(prev => Math.max(0, prev - 1));
          Alert.alert(
            'Removed', 
            'Article removed from saved items',
            [{ text: 'OK' }],
            { cancelable: true }
          );
        }
      } else {
        // Save article
        success = await savedArticlesService.saveArticle(article);
        if (success) {
          setIsArticleSaved(true);
          setSavedArticlesCount(prev => prev + 1);
          Alert.alert(
            'Saved', 
            'Article saved successfully',
            [{ text: 'OK' }],
            { cancelable: true }
          );
        } else {
          Alert.alert(
            'Already Saved', 
            'This article is already in your saved items',
            [{ text: 'OK' }],
            { cancelable: true }
          );
        }
      }

      if (!success && isArticleSaved) {
        Alert.alert(
          'Error', 
          'Failed to remove article. Please try again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else if (!success && !isArticleSaved) {
        Alert.alert(
          'Error', 
          'Failed to save article. Please try again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error toggling save article:', error);
      Alert.alert(
        'Error', 
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } finally {
      setIsSaving(false);
    }
  }, [article, isArticleSaved, isSaving]);

  // Check saved status when article changes
  useEffect(() => {
    refreshSavedStatus();
  }, [refreshSavedStatus]);

  return {
    isArticleSaved,
    isSaving,
    savedArticlesCount,
    toggleSaveArticle,
    refreshSavedStatus,
  };
};

// Hook for managing all saved articles (for SavedArticlesScreen)
export interface UseSavedArticlesReturn {
  savedArticles: SavedArticle[];
  isLoading: boolean;
  refreshSavedArticles: () => Promise<void>;
  removeSavedArticle: (article: NewsItem) => Promise<void>;
  clearAllSavedArticles: () => Promise<void>;
  exportSavedArticles: () => Promise<string>;
}

export const useSavedArticles = (): UseSavedArticlesReturn => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSavedArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const articles = await savedArticlesService.getSavedArticles();
      setSavedArticles(articles);
    } catch (error) {
      console.error('Error refreshing saved articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeSavedArticle = useCallback(async (article: NewsItem) => {
    try {
      const success = await savedArticlesService.unsaveArticle(article);
      if (success) {
        setSavedArticles(prev => prev.filter(saved => 
          (saved.id || saved.url) !== (article.id || article.url)
        ));
        Alert.alert(
          'Removed', 
          'Article removed from saved items',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error removing saved article:', error);
      Alert.alert(
        'Error', 
        'Failed to remove article. Please try again.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  }, []);

  const clearAllSavedArticles = useCallback(async () => {
    Alert.alert(
      'Clear All Saved Articles',
      'Are you sure you want to remove all saved articles? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await savedArticlesService.clearAllSavedArticles();
              if (success) {
                setSavedArticles([]);
                Alert.alert(
                  'Cleared', 
                  'All saved articles have been removed',
                  [{ text: 'OK' }],
                  { cancelable: true }
                );
              }
            } catch (error) {
              console.error('Error clearing saved articles:', error);
              Alert.alert(
                'Error', 
                'Failed to clear saved articles. Please try again.',
                [{ text: 'OK' }],
                { cancelable: true }
              );
            }
          }
        }
      ]
    );
  }, []);

  const exportSavedArticles = useCallback(async (): Promise<string> => {
    try {
      return await savedArticlesService.exportSavedArticles();
    } catch (error) {
      console.error('Error exporting saved articles:', error);
      return '[]';
    }
  }, []);

  useEffect(() => {
    refreshSavedArticles();
  }, [refreshSavedArticles]);

  return {
    savedArticles,
    isLoading,
    refreshSavedArticles,
    removeSavedArticle,
    clearAllSavedArticles,
    exportSavedArticles,
  };
};