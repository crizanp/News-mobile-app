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
    index?: number;
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
        try {
            // Create a more reliable ID generation
            let newsId: string;
            
            if (item.id) {
                // Use existing ID if available
                newsId = item.id.toString();
            } else {
                // Generate ID from URL or title + index
                const baseString = item.url || `${item.title}-${item.publishedAt}-${index}`;
                // Create a simple hash-like ID
                newsId = baseString
                    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
                    .substring(0, 20) || // Take first 20 characters
                    `news_${Date.now()}_${index}`; // Fallback ID
            }
            
            console.log('Navigating to news detail with ID:', newsId);
            console.log('Item data:', { title: item.title, url: item.url });
            
            // Navigate to news detail page
            router.push(`/news/${newsId}`);
            
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }, [item, index, router]);

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

    // Check if this is a Cryptews source
    const isCryptews = useCallback((): boolean => {
        const sourceName = item.source?.name?.toLowerCase().trim() || '';
        return sourceName === 'cryptews' || sourceName.includes('cryptews');
    }, [item.source]);

    const timeAgo = getTimeAgo(item.publishedAt, currentTime);

    // Ensure we have a valid image URL
    const imageSource = item.urlToImage ? 
        { uri: item.urlToImage } : 
        { uri: 'https://via.placeholder.com/300x200?text=No+Image' };

    if (isHorizontal) {
        return (
            <TouchableOpacity 
                style={styles.horizontalNewsItem} 
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <ImageBackground
                    source={imageSource}
                    style={styles.horizontalNewsBackground}
                    imageStyle={styles.horizontalNewsImageStyle}
                    resizeMode="cover"
                    defaultSource={{ uri: 'https://via.placeholder.com/300x200?text=Loading' }}
                >
                    <View style={styles.horizontalOverlay} />
                    
                    {/* Sponsored tag for Cryptews */}
                    {isCryptews() && (
                        <View style={styles.sponsoredTag}>
                            <Text style={styles.sponsoredText}>Sponsored</Text>
                        </View>
                    )}
                    
                    <View style={styles.horizontalNewsContent}>
                        <Text style={styles.horizontalNewsSource}>
                            {item.source?.name || 'Unknown Source'}
                        </Text>
                        <Text style={styles.horizontalNewsTitle} numberOfLines={2}>
                            {item.title || 'No Title Available'}
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
                source={imageSource}
                style={styles.compactNewsImage}
                resizeMode="cover"
                fadeDuration={0}
                progressiveRenderingEnabled={true}
                defaultSource={{ uri: 'https://via.placeholder.com/120x80?text=Loading' }}
            />
            <View style={styles.compactNewsContent}>
                <Text style={styles.compactNewsTitle} numberOfLines={2}>
                    {item.title || 'No Title Available'}
                </Text>
                <View style={styles.compactNewsFooter}>
                    <Text style={styles.compactNewsSource}>
                        {item.source?.name || 'Unknown Source'}
                    </Text>
                    <Text style={styles.compactNewsTime}>{timeAgo}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

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
    sponsoredTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FFD700', // Yellow background
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 2,
    },
    sponsoredText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#000000', // Black text for good contrast on yellow
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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