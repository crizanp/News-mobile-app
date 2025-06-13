import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
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
    index?: number; // Add index prop as fallback
}

const MarketNewsItem = React.memo<MarketNewsItemProps>(({ 
    item, 
    isHorizontal = false, 
    index = 0 
}) => {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    // Update current time every minute for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handlePress = useCallback(() => {
        // Use item.id if available, otherwise use index or generate from URL
        const newsId = item.id || 
                      btoa(item.url || `${item.title}-${index}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        
        router.push(`/news/${newsId}` as any);
    }, [item.id, item.url, item.title, index, router]);

    // Your existing getTimeAgo function and other code...
    const getTimeAgo = useCallback((publishedAt: string, now: number): string => {
        try {
            const publishedDate = new Date(publishedAt);
            
            if (isNaN(publishedDate.getTime())) {
                console.warn('Invalid publishedAt date:', publishedAt);
                return 'Recently';
            }

            const diffInMilliseconds = now - publishedDate.getTime();
            
            if (diffInMilliseconds < 0) {
                return 'Just now';
            }

            const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);
            const diffInWeeks = Math.floor(diffInDays / 7);
            const diffInMonths = Math.floor(diffInDays / 30);
            const diffInYears = Math.floor(diffInDays / 365);

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

    const timeAgo = getTimeAgo(item.publishedAt, currentTime);

    // Rest of your component JSX remains the same...
    if (isHorizontal) {
        return (
            <TouchableOpacity 
                style={styles.horizontalNewsItem} 
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <ImageBackground
                    source={{ uri: item.urlToImage }}
                    style={styles.horizontalNewsBackground}
                    imageStyle={styles.horizontalNewsImageStyle}
                    resizeMode="cover"
                >
                    <View style={styles.horizontalOverlay} />
                    
                    <View style={styles.horizontalNewsContent}>
                        <Text style={styles.horizontalNewsSource}>{item.source.name}</Text>
                        <Text style={styles.horizontalNewsTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <Text style={styles.horizontalNewsTime}>
                            {timeAgo}
                        </Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={styles.compactNewsItem} 
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.urlToImage }}
                style={styles.compactNewsImage}
                resizeMode="cover"
                fadeDuration={0}
                progressiveRenderingEnabled={true}
            />
            <View style={styles.compactNewsContent}>
                <Text style={styles.compactNewsTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={styles.compactNewsFooter}>
                    <Text style={styles.compactNewsSource}>{item.source.name}</Text>
                    <Text style={styles.compactNewsTime}>{timeAgo}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// Styles remain the same...
const styles = StyleSheet.create({
    horizontalNewsItem: {
        width: width * 0.75,
        height: 160,
        borderRadius: 12,
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    horizontalNewsBackground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    horizontalNewsImageStyle: {
        borderRadius: 12,
    },
    horizontalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        borderRadius: 12,
    },
    horizontalNewsContent: {
        padding: 15,
        zIndex: 1,
    },
    horizontalNewsSource: {
        fontSize: 12,
        color: '#E3F2FD',
        fontWeight: '600',
        marginBottom: 5,
    },
    horizontalNewsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 20,
        marginBottom: 8,
    },
    horizontalNewsTime: {
        fontSize: 12,
        color: '#E0E0E0',
    },
    compactNewsItem: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    compactNewsImage: {
        width: 120,
        height: 80,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    compactNewsContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    compactNewsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 18,
        marginBottom: 8,
    },
    compactNewsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    compactNewsSource: {
        fontSize: 11,
        color: '#007AFF',
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    compactNewsTime: {
        fontSize: 11,
        color: '#999',
        fontWeight: '400',
    },
});

export default MarketNewsItem;