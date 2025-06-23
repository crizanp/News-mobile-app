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
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../contexts/ThemeContext';
import { useSaveArticle } from '../../hooks/useSaveArticle';
import { rssNewsService } from '../../services/rssNewsService';
import { savedArticlesService } from '../../services/savedArticlesService';
import { NewsItem as NewsItemType } from '../../types';

const { width } = Dimensions.get('window');

export default function NewsDetailScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const [news, setNews] = useState<NewsItemType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedNews, setRelatedNews] = useState<NewsItemType[]>([]);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [webViewLoading, setWebViewLoading] = useState<boolean>(false);
  const [isFromSavedArticles, setIsFromSavedArticles] = useState<boolean>(false);

  // FIXED: Enhanced HTML cleaning and formatting function
  const cleanHTML = (html: string) => {
    if (!html) return '';

    let cleanedHtml = html;

    // First, decode HTML entities
    cleanedHtml = cleanedHtml
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&hellip;/g, '...')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')

    // Remove or replace problematic elements
    cleanedHtml = cleanedHtml
      .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
      .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '') // Remove iframes
      .replace(/<embed[^>]*\/?>/gis, '') // Remove embed tags
      .replace(/<object[^>]*>.*?<\/object>/gis, '') // Remove object tags
      .replace(/<form[^>]*>.*?<\/form>/gis, '') // Remove forms
      .replace(/<input[^>]*\/?>/gis, '') // Remove input tags
      .replace(/<button[^>]*>.*?<\/button>/gis, '') // Remove buttons
      .replace(/<select[^>]*>.*?<\/select>/gis, '') // Remove select tags
      .replace(/<textarea[^>]*>.*?<\/textarea>/gis, '') // Remove textareas
      .replace(/onclick\s*=\s*"[^"]*"/gis, '') // Remove onclick attributes
      .replace(/javascript:[^"']*/gis, '') // Remove javascript: links
      .replace(/on\w+\s*=\s*"[^"]*"/gis, ''); // Remove other event handlers

    // Clean up multiple spaces and newlines
    cleanedHtml = cleanedHtml
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim();

    // If the content doesn't have proper HTML structure, wrap it in paragraphs
    if (!cleanedHtml.includes('<p>') && !cleanedHtml.includes('<div>') && !cleanedHtml.includes('<h')) {
      // Split by double line breaks and wrap each part in <p> tags
      const paragraphs = cleanedHtml.split(/\n\s*\n/).filter(p => p.trim());
      if (paragraphs.length > 1) {
        cleanedHtml = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
      } else {
        cleanedHtml = `<p>${cleanedHtml}</p>`;
      }
    }

    return cleanedHtml;
  };

  // FIXED: Enhanced content extraction for different content types
  const getFormattedContent = (newsItem: NewsItemType) => {
    // Priority order for content:
    // 1. content (if available and contains HTML)
    // 2. description (with HTML formatting)
    // 3. fallback to plain description

    let htmlContent = '';

    // Check if newsItem has a 'content' field (from your paste.txt example)
    if (newsItem.content && typeof newsItem.content === 'string') {
      htmlContent = newsItem.content;
    }
    // If no content field, use description
    else if (newsItem.description) {
      htmlContent = newsItem.description;
    }
    // Fallback to title if no other content
    else {
      htmlContent = `<p>${newsItem.title}</p>`;
    }

    return cleanHTML(htmlContent);
  };

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

      // First, try to get from current RSS feed
      const allNews = await rssNewsService.getCryptoNews(0); // 0 = no limit
      console.log('Total news items fetched:', allNews.length);

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

      // Method 4 - Check saved articles if not found in current feed
      if (!newsItem && id) {
        console.log('Not found in current feed, checking saved articles...');
        try {
          const savedArticles = await savedArticlesService.getSavedArticles();
          console.log('Total saved articles:', savedArticles.length);

          const idString = id.toString();

          // Try to find in saved articles using the same matching logic
          newsItem = savedArticles.find(item => {
            // Direct ID match
            if (item.id?.toString() === idString) return true;

            // URL-based match
            if (item.url && item.url.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) === idString) return true;

            // Title-based match
            const baseString = `${item.title}-${item.publishedAt}`;
            const generatedId = baseString.replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
            return generatedId === idString;
          });

          if (newsItem) {
            console.log('Found in saved articles:', newsItem.title);
            setIsFromSavedArticles(true);
          }
        } catch (error) {
          console.error('Error checking saved articles:', error);
        }
      }

      if (newsItem) {
        console.log('Found news item:', newsItem.title);
        setNews(newsItem);

        // Get related news - only from current feed (not from saved articles for related news)
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
      } else {
        // If still no news item found, show error
        console.warn('Could not find news item with ID:', id);
        setNews(null);
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

  // Enhanced injected JavaScript for better dark mode support
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
        
        // Clean up styles for better reading with theme support
        const isDarkMode = ${isDark};
        const style = document.createElement('style');
        style.textContent = \`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            line-height: 1.6 !important;
            color: \${isDarkMode ? '#FFFFFF' : '#333'} !important;
            background: \${isDarkMode ? '#000000' : '#ffffff'} !important;
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
            color: \${isDarkMode ? '#FFFFFF' : '#333'} !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: \${isDarkMode ? '#FFFFFF' : '#1a1a1a'} !important;
            margin: 24px 0 16px 0 !important;
          }
          a {
            color: \${isDarkMode ? '#0A84FF' : '#007AFF'} !important;
            text-decoration: none !important;
            pointer-events: none !important;
          }
          video, iframe, embed, object {
            display: none !important;
          }
          blockquote {
            border-left: 4px solid \${isDarkMode ? '#0A84FF' : '#007AFF'} !important;
            padding-left: 16px !important;
            margin: 16px 0 !important;
            background: \${isDarkMode ? '#1C1C1E' : '#F9F9F9'} !important;
            color: \${isDarkMode ? '#FFFFFF' : '#333'} !important;
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
    webViewHeader: {
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
    webViewTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    savedBadge: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    actionButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      marginLeft: 12,
    },
    actionButtonDisabled: {
      opacity: 0.6,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    webViewLoadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      zIndex: 1,
    },
    articleContent: {
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    savedArticleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : '#F0F8FF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    savedArticleText: {
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
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
      borderBottomColor: theme.colors.border,
    },
    source: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timeAgo: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    description: {
      fontSize: 16,
      lineHeight: 26,
      color: theme.colors.text,
      marginBottom: 24,
    },
    readMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : '#F0F8FF',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      marginBottom: 32,
    },
    readMoreText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    relatedSection: {
      marginTop: 20,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    relatedTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    relatedItem: {
      flexDirection: 'row',
      marginBottom: 16,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    relatedContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    relatedItemTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 20,
    },
    relatedDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      textAlign: 'center',
    },
    errorSubText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
    errorButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
    },
    errorButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (!news) {
    return (
      <View style={dynamicStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={dynamicStyles.errorText}>Article not found</Text>
        <Text style={dynamicStyles.errorSubText}>
          This article may have been removed or is no longer available.
        </Text>
        <TouchableOpacity
          style={dynamicStyles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={dynamicStyles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // WebView Screen with Content-Only Display
  if (showWebView) {
    return (
      <View style={dynamicStyles.container}>
        {/* WebView Header */}
        <View style={dynamicStyles.webViewHeader}>
          <TouchableOpacity style={dynamicStyles.backButton} onPress={handleBackFromWebView}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={dynamicStyles.webViewTitle} numberOfLines={1}>
            {news.source?.name || 'Article'}
            {isFromSavedArticles && (
              <Text style={dynamicStyles.savedBadge}> • Saved</Text>
            )}
          </Text>

          <TouchableOpacity
            style={[dynamicStyles.actionButton, isSaving && dynamicStyles.actionButtonDisabled]}
            onPress={toggleSaveArticle}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons
                name={isArticleSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isArticleSaved ? theme.colors.primary : theme.colors.text}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Indicator for WebView */}
        {webViewLoading && (
          <View style={dynamicStyles.webViewLoadingContainer}>
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

  // FIXED: Get properly formatted HTML content
  const formattedContent = getFormattedContent(news);

  // Main Article Screen
  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[dynamicStyles.actionButton, isSaving && dynamicStyles.actionButtonDisabled]}
            onPress={toggleSaveArticle}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons
                name={isArticleSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isArticleSaved ? theme.colors.primary : theme.colors.text}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
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
        <View style={dynamicStyles.articleContent}>

          {/* Show saved article badge */}
          {isFromSavedArticles && (
            <View style={dynamicStyles.savedArticleBadge}>
              <Ionicons name="bookmark" size={16} color={theme.colors.primary} />
              <Text style={dynamicStyles.savedArticleText}>Saved Article</Text>
            </View>
          )}

          {/* Title */}
          <Text style={dynamicStyles.title}>{news.title}</Text>

          {/* Author & Date */}
          <View style={dynamicStyles.authorInfo}>
            <Text style={dynamicStyles.source}>{news.source?.name || 'Unknown Source'}</Text>
            <Text style={dynamicStyles.timeAgo}>{getTimeAgo(news.publishedAt)}</Text>
          </View>


          {/* Main Content - Properly rendered HTML */}
          {formattedContent && (
            <RenderHTML
              contentWidth={width - 40}
              source={{ html: formattedContent }}
              baseStyle={{
                fontSize: 16,
                lineHeight: 26,
                color: theme.colors.text,
              }}
              systemFonts={['SF Pro Display', 'SF Pro Text', 'Helvetica Neue']}
              tagsStyles={{
                body: {
                  color: theme.colors.text,
                  fontSize: 16,
                  lineHeight: 26,
                },
                p: {
                  marginBottom: 16,
                  color: theme.colors.text,
                },
                a: {
                  color: theme.colors.primary,
                  textDecorationLine: 'none',
                },
                strong: {
                  fontWeight: 'bold',
                  color: theme.colors.text,
                },
                b: {
                  fontWeight: 'bold',
                  color: theme.colors.text,
                },
                em: {
                  fontStyle: 'italic',
                  color: theme.colors.text,
                },
                i: {
                  fontStyle: 'italic',
                  color: theme.colors.text,
                },
                h1: { color: theme.colors.text, fontSize: 24, marginBottom: 16, fontWeight: 'bold' },
                h2: { color: theme.colors.text, fontSize: 22, marginBottom: 14, fontWeight: 'bold' },
                h3: { color: theme.colors.text, fontSize: 20, marginBottom: 12, fontWeight: 'bold' },
                h4: { color: theme.colors.text, fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
                h5: { color: theme.colors.text, fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
                h6: { color: theme.colors.text, fontSize: 14, marginBottom: 6, fontWeight: 'bold' },
                ul: { marginBottom: 16 },
                ol: { marginBottom: 16 },
                li: { marginBottom: 8, color: theme.colors.text },
                blockquote: {
                  backgroundColor: theme.colors.surface,
                  borderLeftColor: theme.colors.primary,
                  borderLeftWidth: 4,
                  paddingLeft: 16,
                  paddingVertical: 12,
                  marginVertical: 16,
                  fontStyle: 'italic',
                },
                code: {
                  backgroundColor: theme.colors.surface,
                  padding: 4,
                  borderRadius: 4,
                  fontFamily: 'Courier New',
                },
                pre: {
                  backgroundColor: theme.colors.surface,
                  padding: 16,
                  borderRadius: 8,
                  marginVertical: 16,
                },
                figure: {
                  marginVertical: 16,
                },
                figcaption: {
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 8,
                  fontStyle: 'italic',
                },
                img: {
                  marginVertical: 16,
                },
                span: {
                  color: theme.colors.text,
                },
              }}
              ignoredDomTags={['script', 'iframe', 'embed', 'object', 'video']}
              enableExperimentalMarginCollapsing={true}
              renderersProps={{
                a: {
                  onPress: () => { }, // Disable link clicks for security
                },
                img: {
                  enableExperimentalPercentWidth: true,
                },
              }}
            />
          )}
          {/* Read Full Article Button */}
          {news.url && (
            <TouchableOpacity style={dynamicStyles.readMoreButton} onPress={handleReadFullArticle}>
              <Text style={dynamicStyles.readMoreText}>Read Full Article</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} style={styles.readMoreIcon} />
            </TouchableOpacity>
          )}

          {/* Related News - Only show if not from saved articles or if there are related articles */}
          {relatedNews.length > 0 && (
            <View style={dynamicStyles.relatedSection}>
              <Text style={dynamicStyles.relatedTitle}>Related News</Text>
              {relatedNews.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  style={dynamicStyles.relatedItem}
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
                  <View style={dynamicStyles.relatedContent}>
                    <Text style={dynamicStyles.relatedItemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={dynamicStyles.relatedDate}>{getTimeAgo(item.publishedAt)}</Text>
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

// Static styles that don't change with theme
const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
  },
  webView: {
    flex: 1,
  },
  articleImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  readMoreIcon: {
    marginLeft: 8,
  },
  relatedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
});