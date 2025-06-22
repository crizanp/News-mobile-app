// components/NewsList.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { NewsItem } from '../../types';
import MarketNewsItem from './MarketNewsItem';

interface NewsListProps {
    news: NewsItem[];
    title?: string;
}

const NewsList: React.FC<NewsListProps> = ({ news, title = 'Latest Updates' }) => {
    const { theme } = useTheme();
    
    const renderVerticalNewsItem = useCallback(({ item, index }: { item: NewsItem; index: number }) => (
        <MarketNewsItem item={item} isHorizontal={false} index={index} />
    ), []);
    
    const keyExtractor = useCallback((item: NewsItem, index: number) => {
        return item.id ? item.id.toString() : `${item.url || item.title}-${index}`;
    }, []);
    
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
        <View >
            <View style={styles.sectionHeader}>
                <Text style={sectionTitleStyle}>{title}</Text>
                <Text style={newsCountStyle}>
                    {news.length} article{news.length !== 1 ? 's' : ''}
                </Text>
            </View>
            {news.length > 0 ? (
                <FlatList
                    data={news}
                    renderItem={renderVerticalNewsItem}
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