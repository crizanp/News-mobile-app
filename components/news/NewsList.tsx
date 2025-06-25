// components/NewsList.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { NewsItem } from '../../types';
import ArticleAdComponent from '../ads/ArticleAdComponent';
import MarketNewsItem from './MarketNewsItem';

interface NewsListProps {
    news: NewsItem[];
    title?: string;
}

interface ListItem {
    type: 'news' | 'ad';
    data?: NewsItem;
    index?: number;
    id: string;
}

const NewsList: React.FC<NewsListProps> = ({ news, title = 'Latest Updates' }) => {
    const { theme } = useTheme();
    
    // Create a combined list of news items and ads
    const listData = useMemo(() => {
        const combinedList: ListItem[] = [];
        
        news.forEach((newsItem, index) => {
            // Add news item
            combinedList.push({
                type: 'news',
                data: newsItem,
                index,
                id: newsItem.id ? newsItem.id.toString() : `news-${index}`
            });
            
            // Add ad after every 3 news items for better user experience
            if ((index + 1) % 3 === 0 && index < news.length - 1) {
                combinedList.push({
                    type: 'ad',
                    id: `ad-${Math.floor(index / 3)}`
                });
            }
        });
        
        return combinedList;
    }, [news]);
    
    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (item.type === 'ad') {
            return (
                <ArticleAdComponent 
                    placement="related"
                    style={styles.adWrapper}
                />
            );
        }
        
        return (
            <MarketNewsItem 
                item={item.data!} 
                isHorizontal={false} 
                index={item.index!} 
            />
        );
    }, []);
    
    const keyExtractor = useCallback((item: ListItem) => item.id, []);
    
    // Dynamic styles based on theme
    const containerStyle = [
        styles.newsSection,
        { backgroundColor: theme.colors.background }
    ];
    
    const sectionTitleStyle = [
        styles.sectionTitle,
        { color: theme.colors.text }
    ];
    
    const newsCountStyle = [
        styles.newsCount,
        { color: theme.colors.textSecondary }
    ];
    
    const emptyTextStyle = [
        styles.emptyResultsText,
        { color: theme.colors.textSecondary }
    ];
    
    const emptyIconColor = theme.isDark ? '#555' : '#ccc';
    
    return (
        <View style={containerStyle}>
            <View style={styles.sectionHeader}>
                <Text style={sectionTitleStyle}>{title}</Text>
                <Text style={newsCountStyle}>
                    {news.length} article{news.length !== 1 ? 's' : ''}
                </Text>
            </View>
            
            {news.length > 0 ? (
                <FlatList
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={8}
                />
            ) : (
                <View style={styles.emptyResultsContainer}>
                    <Ionicons 
                        name="newspaper-outline" 
                        size={48} 
                        color={emptyIconColor} 
                    />
                    <Text style={emptyTextStyle}>
                        No market news available for this category
                    </Text>
                    <Text style={[emptyTextStyle, styles.emptySubtext]}>
                        Try selecting a different category or check back later
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    newsSection: {
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    newsCount: {
        fontSize: 14,
        fontWeight: '500',
    },
    adWrapper: {
        marginVertical: 10,
    },
    emptyResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyResultsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        opacity: 0.8,
        fontWeight: '400',
    },
});

export default NewsList;