// components/LoadingState.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingStateProps {
    message?: string;
    icon?: string;
}

const SkeletonItem: React.FC<{ style?: any }> = ({ style }) => {
    const { theme, isDark } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = () => {
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start(() => shimmer());
        };
        shimmer();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: isDark ? '#2A2A2A' : '#E1E9EE',
                    opacity,
                },
                style,
            ]}
        />
    );
};

const CategorySkeleton: React.FC = () => {
    const { theme } = useTheme();
    
    return (
        <View style={[styles.categoryContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.categoryScroll}>
                {[...Array(6)].map((_, index) => (
                    <SkeletonItem
                        key={index}
                        style={[
                            styles.categoryItem,
                            index === 0 && styles.firstCategoryItem
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const MarketHighlightsSkeleton: React.FC = () => {
    const { theme, isDark } = useTheme();
    
    return (
        <View style={[styles.highlightsContainer, { backgroundColor: theme.colors.surface }]}>
            <SkeletonItem style={styles.sectionTitle} />
            <View style={styles.highlightsGrid}>
                {[...Array(2)].map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.highlightCard, 
                            { backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA' }
                        ]}
                    >
                        <SkeletonItem style={styles.highlightImage} />
                        <View style={styles.highlightContent}>
                            <SkeletonItem style={styles.highlightTitle} />
                            <SkeletonItem style={styles.highlightSubtitle} />
                            <View style={styles.highlightMeta}>
                                <SkeletonItem style={styles.highlightSource} />
                                <SkeletonItem style={styles.highlightTime} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const NewsListSkeleton: React.FC = () => {
    const { theme, isDark } = useTheme();
    
    return (
        <View style={[styles.newsContainer, { backgroundColor: theme.colors.surface }]}>
            <SkeletonItem style={styles.sectionTitle} />
            {[...Array(8)].map((_, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.newsItem,
                        { 
                            borderBottomColor: isDark ? '#2A2A2A' : '#F0F0F0',
                        }
                    ]}
                >
                    <SkeletonItem style={styles.newsImage} />
                    <View style={styles.newsContent}>
                        <SkeletonItem style={styles.newsTitle} />
                        <SkeletonItem style={styles.newsSubtitle} />
                        <View style={styles.newsMeta}>
                            <SkeletonItem style={styles.newsSource} />
                            <SkeletonItem style={styles.newsTime} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

const LoadingState: React.FC<LoadingStateProps> = () => {
    const { theme } = useTheme();
    
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Skeleton */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <SkeletonItem style={styles.headerTitle} />
                <SkeletonItem style={styles.headerButton} />
            </View>

            {/* Content Skeleton */}
            <View style={styles.content}>
                {/* Category Filter Skeleton */}
                <CategorySkeleton />

                {/* Market Highlights Skeleton */}
                <MarketHighlightsSkeleton />

                {/* News List Skeleton */}
                <NewsListSkeleton />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    headerTitle: {
        width: 140,
        height: 24,
        borderRadius: 4,
    },
    headerButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    content: {
        flex: 1,
    },
    
    // Category Filter Skeleton
    categoryContainer: {
        paddingVertical: 15,
        marginBottom: 10,
    },
    categoryScroll: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    categoryItem: {
        width: 80,
        height: 32,
        borderRadius: 16,
    },
    firstCategoryItem: {
        width: 100, // "All Markets" is wider
    },

    // Market Highlights Skeleton
    highlightsContainer: {
        marginBottom: 10,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        width: 120,
        height: 20,
        borderRadius: 4,
        marginBottom: 15,
    },
    highlightsGrid: {
        gap: 15,
    },
    highlightCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    highlightImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    highlightContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    highlightTitle: {
        width: '90%',
        height: 16,
        borderRadius: 4,
        marginBottom: 8,
    },
    highlightSubtitle: {
        width: '70%',
        height: 14,
        borderRadius: 4,
        marginBottom: 8,
    },
    highlightMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    highlightSource: {
        width: 60,
        height: 12,
        borderRadius: 4,
    },
    highlightTime: {
        width: 40,
        height: 12,
        borderRadius: 4,
    },

    // News List Skeleton
    newsContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    newsItem: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    newsImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    newsContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    newsTitle: {
        width: '95%',
        height: 16,
        borderRadius: 4,
        marginBottom: 6,
    },
    newsSubtitle: {
        width: '80%',
        height: 14,
        borderRadius: 4,
        marginBottom: 8,
    },
    newsMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    newsSource: {
        width: 70,
        height: 12,
        borderRadius: 4,
    },
    newsTime: {
        width: 50,
        height: 12,
        borderRadius: 4,
    },
});

export default LoadingState;