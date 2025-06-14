import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSaveArticle } from '../../hooks/useSaveArticle'; // New import
import { rssNewsService } from '../../services/rssNewsService';
import { NewsItem as NewsItemType } from '../../types';

const { width } = Dimensions.get('window');

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [news, setNews] = useState<NewsItemType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedNews, setRelatedNews] = useState<NewsItemType[]>([]);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [webViewLoading, setWebViewLoading] = useState<boolean>(false);

  // Use the save article hook
  const {
    isArticleSaved,
    isSaving,
    toggleSaveArticle,
    refreshSavedStatus,
  } = useSaveArticle(news);

  useEffect(() => {
    console.log('NewsDetailScreen mounted with ID:', id);
    fetchNewsDetail();
  }, [id]);

  // Refresh saved status when news changes
  useEffect(() => {
    if (news) {
      refreshSavedStatus();
    }
  }, [news, refreshSavedStatus]);

  const fetchNewsDetail = async (): Promise<void> => {
    try {
      console.log('Fetching news detail for ID:', id);

      // Get all news from RSS service (same as MarketScreen)
      const allNews = await rssNewsService.getCryptoNews(0); // 0 = no limit
      console.log('Total news items fetched:', allNews.length);

      // Try different methods to find the news item
      let newsItem: NewsItemType | undefined;

      // Method 1: Direct ID match
      newsItem = allNews.find(item => item.id?.toString() === id?.toString());

      // Method 2: If no direct match, try to find by generated ID pattern
      if (!newsItem && id) {
        const idString = id.toString();
        newsItem = allNews.find((item, index) => {
          // Check if the item matches our ID generation logic
          if (item.id?.toString() === idString) return true;

          // Check generated ID from URL or title
          const baseString = item.url || `${item.title}-${item.publishedAt}-${index}`;
          const generatedId = baseString
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 20);

          return generatedId === idString;
        });
      }

      // Method 3: If still no match, try to find by partial URL or title match
      if (!newsItem && id) {
        const idString = id.toString().toLowerCase();
        newsItem = allNews.find(item =>
          item.url?.toLowerCase().includes(idString) ||
          item.title?.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').includes(idString)
        );
      }

      // Method 4: Last resort - take the first item (for testing)
      if (!newsItem && allNews.length > 0) {
        console.warn('Could not find specific news item, using first available');
        newsItem = allNews[0];
      }

      if (newsItem) {
        console.log('Found news item:', newsItem.title);
        setNews(newsItem);

        // Get related news - prioritize same source, then latest news
        const sameSourceNews = allNews.filter(item =>
          item.id !== newsItem!.id &&
          item.url !== newsItem!.url &&
          item.source?.name === newsItem!.source?.name
        );

        const otherNews = allNews.filter(item =>
          item.id !== newsItem!.id &&
          item.url !== newsItem!.url &&
          item.source?.name !== newsItem!.source?.name
        );

        // Combine same source news first, then other news, limit to 3
        const related = [...sameSourceNews, ...otherNews].slice(0, 3);
        setRelatedNews(related);
      }
    } catch (error) {
      console.error('Error fetching news detail:', error);
      Alert.alert(
        'Error',
        'Failed to load news article. Please try again.',
        [
          { text: 'Retry', onPress: fetchNewsDetail },
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!news) return;

    try {
      await Share.share({
        message: `${news.title}\n\n${news.description || ''}\n\nRead more: ${news.url}`,
        title: news.title,
        url: news.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReadFullArticle = (): void => {
    if (!news?.url) {
      Alert.alert('Error', 'Article URL not available');
      return;
    }
    console.log('Opening WebView for:', news.url);
    setShowWebView(true);
  };

  const handleBackFromWebView = (): void => {
    setShowWebView(false);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const getTimeAgo = (dateString: string): string => {
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
  };

  // Custom JavaScript to disable interactive elements and show only content
  const injectedJavaScript = `
    (function() {
      try {
        // Remove all script tags
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove interactive elements
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, form, a[href*="javascript"], [onclick], [onload], [onerror]');
        interactiveElements.forEach(element => {
          element.style.pointerEvents = 'none';
          element.onclick = null;
          element.onload = null;
          element.onerror = null;
          if (element.tagName === 'A') {
            element.removeAttribute('href');
          }
        });
        
        // Remove navigation, ads, and unnecessary elements
        const elementsToHide = [
          'nav', 'header', 'footer', '.nav', '.navigation', '.header', '.footer',
          '.sidebar', '.ads', '.advertisement', '.social-share', '.comments',
          '.related-posts', '.newsletter', '.popup', '.modal', '.overlay',
          '[class*="nav"]', '[class*="menu"]', '[class*="ads"]', '[class*="social"]'
        ];
        
        elementsToHide.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            element.style.display = 'none';
          });
        });
        
        // Focus on main content
        const mainContent = document.querySelector('main, article, .main-content, .article-content, .post-content, .content');
        if (mainContent) {
          document.body.innerHTML = '';
          document.body.appendChild(mainContent);
        }
        
        // Clean up styles for better reading
        const style = document.createElement('style');
        style.textContent = \`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            line-height: 1.6 !important;
            color: #333 !important;
            background: #fff !important;
            padding: 16px !important;
            margin: 0 !important;
          }
          * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          img {
            height: auto !important;
            display: block !important;
            margin: 16px auto !important;
          }
          p, div, span {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #1a1a1a !important;
            margin: 24px 0 16px 0 !important;
          }
          a {
            color: #007AFF !important;
            text-decoration: none !important;
            pointer-events: none !important;
          }
          video, iframe, embed, object {
            display: none !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Disable all event listeners
        window.addEventListener = function() {};
        document.addEventListener = function() {};
        
        return true;
      } catch (error) {
        console.error('Injected JavaScript error:', error);
        return false;
      }
    })();
  `;

  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (!news) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // WebView Screen with Content-Only Display
  if (showWebView) {
    return (
      <View style={styles.container}>
        {/* WebView Header */}
        <View style={styles.webViewHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackFromWebView}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.webViewTitle} numberOfLines={1}>
            {news.source?.name || 'Article'}
          </Text>

          <TouchableOpacity 
            style={[styles.actionButton, isSaving && styles.actionButtonDisabled]} 
            onPress={toggleSaveArticle}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons
                name={isArticleSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isArticleSaved ? "#007AFF" : "#333"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Indicator for WebView */}
        {webViewLoading && (
          <View style={styles.webViewLoadingContainer}>
            <LoadingSpinner message="Loading content..." />
          </View>
        )}

        {/* Content-Only WebView */}
        <WebView
          source={{ uri: news.url }}
          style={styles.webView}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert(
              'Error',
              'Failed to load article content. Please try again.',
              [
                { text: 'Retry', onPress: () => setShowWebView(false) },
                { text: 'Go Back', onPress: handleBackFromWebView }
              ]
            );
            setWebViewLoading(false);
          }}
          injectedJavaScript={injectedJavaScript}
          onMessage={() => { }}
          domStorageEnabled={false}
          thirdPartyCookiesEnabled={false}
          sharedCookiesEnabled={false}
          allowsInlineMediaPlayback={false}
          mediaPlaybackRequiresUserAction={true}
          allowsBackForwardNavigationGestures={false}
          allowsLinkPreview={false}
          allowsFullscreenVideo={false}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={true}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }

  // Main Article Screen
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, isSaving && styles.actionButtonDisabled]} 
            onPress={toggleSaveArticle}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons
                name={isArticleSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isArticleSaved ? "#007AFF" : "#333"}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        {news.urlToImage && (
          <Image
            source={{ uri: news.urlToImage }}
            style={styles.articleImage}
            defaultSource={{ uri: 'https://via.placeholder.com/400x250?text=Loading' }}
            onError={() => console.log('Image failed to load:', news.urlToImage)}
          />
        )}

        {/* Article Content */}
        <View style={styles.articleContent}>
          
          {/* Title */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Author & Date */}
          <View style={styles.authorInfo}>
            <Text style={styles.source}>{news.source?.name || 'Unknown Source'}</Text>
            <Text style={styles.timeAgo}>{getTimeAgo(news.publishedAt)}</Text>
          </View>

          {/* Description */}
          {news.description && (
            <Text style={styles.description}>{news.description}</Text>
          )}

          {/* Read Full Article Button */}
          {news.url && (
            <TouchableOpacity style={styles.readMoreButton} onPress={handleReadFullArticle}>
              <Text style={styles.readMoreText}>Read Full Article</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" style={styles.readMoreIcon} />
            </TouchableOpacity>
          )}

          {/* Related News */}
          {relatedNews.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related News</Text>
              {relatedNews.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  style={styles.relatedItem}
                  onPress={() => {
                    const relatedId = item.id?.toString() ||
                      `related_${index}_${Date.now()}`;
                    router.push(`/news/${relatedId}` as any);
                  }}
                >
                  {item.urlToImage && (
                    <Image
                      source={{ uri: item.urlToImage }}
                      style={styles.relatedImage}
                      defaultSource={{ uri: 'https://via.placeholder.com/80x80?text=No+Image' }}
                    />
                  )}
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedItemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.relatedDate}>{getTimeAgo(item.publishedAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  webViewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginLeft: 12,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  articleImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    lineHeight: 32,
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  source: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeAgo: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    marginBottom: 24,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 32,
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  readMoreIcon: {
    marginLeft: 8,
  },
  relatedSection: {
    marginTop: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  relatedItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  relatedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  relatedContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  relatedItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  relatedDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});