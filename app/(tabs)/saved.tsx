// screens/SavedArticlesScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext'; // Add theme context
import { useSavedArticles } from '../../hooks/useSaveArticle';
import { SavedArticle } from '../../services/savedArticlesService';

const { width } = Dimensions.get('window');

export default function SavedArticlesScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme(); // Add theme context
  const {
    savedArticles,
    isLoading,
    refreshSavedArticles,
    removeSavedArticle,
    clearAllSavedArticles,
    exportSavedArticles,
  } = useSavedArticles();

  const getTimeAgo = useCallback((dateString: string): string => {
    try {
      const now = new Date();
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Recently';
      }

      const diffTime = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffTime < 0) return 'Recently';
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
      return `${diffMonths} months ago`;
    } catch (error) {
      return 'Recently';
    }
  }, []);

  const getSavedTimeAgo = useCallback((savedAt: string): string => {
    return `Saved ${getTimeAgo(savedAt)}`;
  }, [getTimeAgo]);

  const handleArticlePress = useCallback((article: SavedArticle) => {
    const articleId = article.id?.toString() || 
      article.url?.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) ||
      `saved_${Date.now()}`;
    
    router.push(`/news/${articleId}` as any);
  }, [router]);

  const handleRemoveArticle = useCallback((article: SavedArticle) => {
    Alert.alert(
      'Remove Article',
      'Are you sure you want to remove this article from your saved items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSavedArticle(article)
        }
      ]
    );
  }, [removeSavedArticle]);

  const handleShareArticle = useCallback(async (article: SavedArticle) => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.description || ''}\n\nRead more: ${article.url}`,
        title: article.title,
        url: article.url,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, []);

  const handleExportSavedArticles = useCallback(async () => {
    try {
      const exportData = await exportSavedArticles();
      await Share.share({
        message: exportData,
        title: 'My Saved Articles',
      });
    } catch (error) {
      console.error('Error exporting saved articles:', error);
      Alert.alert('Error', 'Failed to export saved articles. Please try again.');
    }
  }, [exportSavedArticles]);

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: theme.colors.headerBackground,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    savedCount: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : '#F0F8FF',
    },
    clearButton: {
      borderColor: '#FF6B6B',
      backgroundColor: isDark ? 'rgba(255, 107, 107, 0.2)' : '#FFF0F0',
    },
    headerActionText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    clearButtonText: {
      color: '#FF6B6B',
    },
    articleItem: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    articleImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    placeholderImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    articleContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    articleTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: 4,
    },
    articleDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    articleMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    articleSource: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    articleDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    savedTime: {
      fontSize: 11,
      color: theme.colors.primary,
      fontStyle: 'italic',
    },
    articleActions: {
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 20,
    },
    emptyListContainer: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      backgroundColor: theme.colors.background,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 12,
    },
    emptyDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    exploreButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    exploreButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const renderArticleItem = useCallback(({ item, index }: { item: SavedArticle; index: number }) => (
    <TouchableOpacity
      style={dynamicStyles.articleItem}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.7}
    >
      {/* Article Image */}
      {item.urlToImage ? (
        <Image
          source={{ uri: item.urlToImage }}
          style={dynamicStyles.articleImage}
          defaultSource={{ uri: 'https://via.placeholder.com/120x120?text=No+Image' }}
        />
      ) : (
        <View style={dynamicStyles.placeholderImage}>
          <Ionicons name="image-outline" size={24} color={theme.colors.textSecondary} />
        </View>
      )}

      {/* Article Content */}
      <View style={dynamicStyles.articleContent}>
        <Text style={dynamicStyles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* <Text style={dynamicStyles.articleDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text> */}

        <View style={dynamicStyles.articleMeta}>
          <Text style={dynamicStyles.articleSource}>{item.source?.name || 'Unknown Source'}</Text>
          <Text style={dynamicStyles.articleDate}>{getTimeAgo(item.publishedAt)}</Text>
        </View>

        {/* <Text style={dynamicStyles.savedTime}>{getSavedTimeAgo(item.savedAt)}</Text> */}
      </View>

      {/* Article Actions */}
      <View style={dynamicStyles.articleActions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleShareArticle(item)}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => handleRemoveArticle(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleArticlePress, handleShareArticle, handleRemoveArticle, getTimeAgo, getSavedTimeAgo, dynamicStyles, theme]);

  const renderEmptyState = useCallback(() => (
    <View style={dynamicStyles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={dynamicStyles.emptyTitle}>No Saved Articles</Text>
      <Text style={dynamicStyles.emptyDescription}>
        Articles you save will appear here. Start exploring news and save articles you want to read later.
      </Text>
      <TouchableOpacity
        style={dynamicStyles.exploreButton}
        onPress={() => router.back()}
      >
        <Text style={dynamicStyles.exploreButtonText}>Explore News</Text>
      </TouchableOpacity>
    </View>
  ), [router, dynamicStyles, theme]);

  const renderHeader = useCallback(() => (
    <View style={dynamicStyles.headerContent}>
      <Text style={dynamicStyles.savedCount}>
        {savedArticles.length} saved article{savedArticles.length !== 1 ? 's' : ''}
      </Text>
      
      {savedArticles.length > 0 && (
        <View style={dynamicStyles.headerActions}>
          <TouchableOpacity
            style={dynamicStyles.headerActionButton}
            onPress={handleExportSavedArticles}
          >
            <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
            <Text style={dynamicStyles.headerActionText}>Export</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.headerActionButton, dynamicStyles.clearButton]}
            onPress={clearAllSavedArticles}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            <Text style={[dynamicStyles.headerActionText, dynamicStyles.clearButtonText]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [savedArticles.length, handleExportSavedArticles, clearAllSavedArticles, dynamicStyles, theme]);

  const keyExtractor = useCallback((item: SavedArticle, index: number) => 
    item.id?.toString() || item.url || `saved_${index}`, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading saved articles..." />;
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Saved Articles</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Articles List */}
      <FlatList
        data={savedArticles}
        renderItem={renderArticleItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={savedArticles.length === 0 ? dynamicStyles.emptyListContainer : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshSavedArticles}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={dynamicStyles.separator} />}
      />
    </View>
  );
}

// Static styles that don't change with theme
const styles = StyleSheet.create({
  headerSpacer: {
    width: 40, // Same width as back button to center title
  },
});