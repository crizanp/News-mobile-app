// app/webview/[url].tsx - WebView Screen for In-App Article Reading
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WebViewScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webViewRef, setWebViewRef] = useState<WebView | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Decode the URL parameter
  const decodedUrl = Array.isArray(url) ? decodeURIComponent(url[0]) : decodeURIComponent(url || '');
  const articleTitle = Array.isArray(title) ? title[0] : title || '';

  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({
        message: `${articleTitle}\n\n${decodedUrl}`,
        title: articleTitle,
        url: decodedUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavoriteToggle = (): void => {
    setIsFavorited(!isFavorited);
    // Here you can implement your favorite storage logic
    // For example: save to AsyncStorage, Redux, or your preferred state management
    if (!isFavorited) {
      Alert.alert('Added to Favorites', 'Article has been saved to your favorites.');
    } else {
      Alert.alert('Removed from Favorites', 'Article has been removed from your favorites.');
    }
  };

  const handleBackPress = (): void => {
    if (canGoBack && webViewRef) {
      webViewRef.goBack();
    } else {
      router.back();
    }
  };

  const handleWebViewNavigationStateChange = (navState: any): void => {
    setCanGoBack(navState.canGoBack);
  };

  const handleWebViewError = (): void => {
    setLoading(false);
    Alert.alert(
      'Error',
      'Failed to load the article. Please check your internet connection.',
      [
        { text: 'Retry', onPress: () => webViewRef?.reload() },
        { text: 'Go Back', onPress: () => router.back() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavoriteToggle}>
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#FF3B30" : "#333"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Spinner */}
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Loading article..." />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={(ref) => setWebViewRef(ref)}
        source={{ uri: decodedUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleWebViewError}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
      />
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
    zIndex: 1000,
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999,
  },
  webview: {
    flex: 1,
  },
});