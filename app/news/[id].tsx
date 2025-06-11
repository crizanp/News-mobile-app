// app/news/[id].tsx - News Detail Page with Content-Only WebView
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
import { cryptoApi } from '../../services/cryptoApi';
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
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

  useEffect(() => {
    fetchNewsDetail();
    loadSavedArticles();
  }, [id]);

  const fetchNewsDetail = async (): Promise<void> => {
    try {
      // In a real app, you'd have an API endpoint for individual news items
      // For now, we'll fetch all news and find the specific item
      const allNews = await cryptoApi.getCryptoNews();
      const newsItem = allNews.find(item => item.id.toString() === id);
      
      if (newsItem) {
        setNews(newsItem);
        // Get related news (excluding current item)
        const related = allNews
          .filter(item => item.id.toString() !== id)
          .slice(0, 3);
        setRelatedNews(related);
      } else {
        Alert.alert('Error', 'News article not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching news detail:', error);
      Alert.alert('Error', 'Failed to load news article');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadSavedArticles = (): void => {
    // In a real app, you'd load this from AsyncStorage or a database
    // For now, we'll use in-memory storage
    setSavedArticles([]);
  };

  const handleSaveArticle = (): void => {
    if (!news) return;

    const articleId = news.id.toString();
    const isCurrentlySaved = savedArticles.includes(articleId);

    if (isCurrentlySaved) {
      // Remove from saved
      setSavedArticles(prev => prev.filter(id => id !== articleId));
      Alert.alert('Removed', 'Article removed from saved items');
    } else {
      // Add to saved
      setSavedArticles(prev => [...prev, articleId]);
      Alert.alert('Saved', 'Article saved successfully');
    }
  };

  const isArticleSaved = (): boolean => {
    return news ? savedArticles.includes(news.id.toString()) : false;
  };

  const handleShare = async (): Promise<void> => {
    if (!news) return;
    
    try {
      await Share.share({
        message: `${news.title}\n\n${news.description}\n\nRead more: ${news.url}`,
        title: news.title,
        url: news.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReadFullArticle = (): void => {
    if (!news?.url) return;
    setShowWebView(true);
  };

  const handleBackFromWebView = (): void => {
    setShowWebView(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Custom JavaScript to disable interactive elements and show only content
  const injectedJavaScript = `
    (function() {
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
      
      true; // Return true to indicate successful execution
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
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveArticle}>
            <Ionicons 
              name={isArticleSaved() ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isArticleSaved() ? "#007AFF" : "#333"} 
            />
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
            Alert.alert('Error', 'Failed to load article content. Please try again.');
            setWebViewLoading(false);
          }}
          injectedJavaScript={injectedJavaScript}
          onMessage={() => {}} // Handle messages if needed
          javaScriptEnabled={true} // Needed to run the injected script
          domStorageEnabled={false} // Disable storage
          thirdPartyCookiesEnabled={false} // Disable third-party cookies
          sharedCookiesEnabled={false} // Disable shared cookies
          allowsInlineMediaPlayback={false} // Disable inline media
          mediaPlaybackRequiresUserAction={true} // Require user action for media
          allowsBackForwardNavigationGestures={false} // Disable navigation gestures
          allowsLinkPreview={false} // Disable link preview
          allowsFullscreenVideo={false} // Disable fullscreen video
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

  // Main Article Screen (unchanged)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveArticle}>
            <Ionicons 
              name={isArticleSaved() ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isArticleSaved() ? "#007AFF" : "#333"} 
            />
         </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        {news.urlToImage && (
          <Image source={{ uri: news.urlToImage }} style={styles.articleImage} />
        )}

        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Category & Date */}
          <View style={styles.metaInfo}>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>Crypto News</Text>
            </View>
            <Text style={styles.timeAgo}>{getTimeAgo(news.publishedAt)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Author & Date */}
          <View style={styles.authorInfo}>
            <Text style={styles.source}>{news.source.name}</Text>
            <Text style={styles.date}>{formatDate(news.publishedAt)}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{news.description}</Text>

          {/* Read Full Article Button */}
          <TouchableOpacity style={styles.readMoreButton} onPress={handleReadFullArticle}>
            <Text style={styles.readMoreText}>Read Full Article</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" style={styles.readMoreIcon} />
          </TouchableOpacity>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related News</Text>
              {relatedNews.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedItem}
                  onPress={() => router.push(`/news/${item.id}` as any)}
                >
                  <Image source={{ uri: item.urlToImage }} style={styles.relatedImage} />
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
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 14,
    color: '#666',
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
  date: {
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
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});