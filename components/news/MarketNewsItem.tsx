// components/MarketNewsItem.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { NewsItem } from '../../types';

const { width } = Dimensions.get('window');

interface MarketNewsItemProps {
    item: NewsItem;
    isHorizontal?: boolean;
}

const MarketNewsItem = React.memo<MarketNewsItemProps>(({ item, isHorizontal = false }) => {
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    // Update current time every minute for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const handlePress = useCallback(() => {
        if (item.url) {
            Linking.openURL(item.url).catch(err => 
                console.error('Failed to open URL:', err)
            );
        }
    }, [item.url]);

    // Calculate time ago with current time state for real-time updates
    const getTimeAgo = useCallback((publishedAt: string, now: number): string => {
        try {
            const publishedDate = new Date(publishedAt);
            
            // Validate the published date
            if (isNaN(publishedDate.getTime())) {
                console.warn('Invalid publishedAt date:', publishedAt);
                return 'Recently';
            }

            const diffInMilliseconds = now - publishedDate.getTime();
            
            // Handle future dates (shouldn't happen but just in case)
            if (diffInMilliseconds < 0) {
                return 'Just now';
            }

            const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);
            const diffInWeeks = Math.floor(diffInDays / 7);
            const diffInMonths = Math.floor(diffInDays / 30);
            const diffInYears = Math.floor(diffInDays / 365);

            // Return appropriate time string based on difference
            if (diffInMinutes < 1) {
                return 'Just now';
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes}m ago`;
            } else if (diffInHours < 24) {
                return `${diffInHours}h ago`;
            } else if (diffInDays < 7) {
                return `${diffInDays}d ago`;
            } else if (diffInWeeks < 4) {
                return `${diffInWeeks}w ago`;
            } else if (diffInMonths < 12) {
                return `${diffInMonths}mo ago`;
            } else {
                return `${diffInYears}y ago`;
            }
        } catch (error) {
            console.error('Error calculating time ago:', error);
            return 'Recently';
        }
    }, []);

    // Get the current time ago string
    const timeAgo = getTimeAgo(item.publishedAt, currentTime);

    if (isHorizontal) {
        return (
            <TouchableOpacity 
                style={styles.horizontalNewsItem} 
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.urlToImage }}
                    style={styles.horizontalNewsImage}
                    resizeMode="cover"
                    fadeDuration={0}
                    progressiveRenderingEnabled={true}
                />
                <View style={styles.horizontalNewsContent}>
                    <Text style={styles.horizontalNewsSource}>{item.source.name}</Text>
                    <Text style={styles.horizontalNewsTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.horizontalNewsTime}>
                        {timeAgo}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={styles.newsItem} 
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.urlToImage }}
                style={styles.newsImage}
                resizeMode="cover"
                fadeDuration={0}
                progressiveRenderingEnabled={true}
            />
            <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                    <Text style={styles.newsSource}>{item.source.name}</Text>
                    <Text style={styles.newsTime}>{timeAgo}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                {/* <Text style={styles.newsDescription} numberOfLines={3}>
                    {item.description}
                </Text> */}
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    horizontalNewsItem: {
        width: width * 0.75,
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    horizontalNewsImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    horizontalNewsContent: {
        padding: 15,
    },
    horizontalNewsSource: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 5,
    },
    horizontalNewsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 20,
        marginBottom: 8,
    },
    horizontalNewsTime: {
        fontSize: 12,
        color: '#999',
    },
    newsItem: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newsImage: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    newsContent: {
        padding: 15,
    },
    newsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    newsSource: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
    },
    newsTime: {
        fontSize: 12,
        color: '#999',
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 22,
        marginBottom: 8,
    },
    newsDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default MarketNewsItem;