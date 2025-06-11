import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NewsItem as NewsItemType } from '../types';

interface NewsItemProps {
  item: NewsItemType;
}

const NewsItem: React.FC<NewsItemProps> = ({ item }) => {
  const router = useRouter();

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
   
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handlePress = () => {
    // Use template literal with proper typing
    router.push(`/news/${item.id}` as any);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.source}>{item.source.name}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{getTimeAgo(item.publishedAt)}</Text>
          </View>
        </View>
        {item.urlToImage && (
          <Image source={{ uri: item.urlToImage }} style={styles.image} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
  },
  textContent: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 6,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

export default NewsItem;