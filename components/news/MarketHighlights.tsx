// components/MarketHighlights.tsx - Theme-aware version
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { NewsItem } from '../../types';
import MarketNewsItem from './MarketNewsItem';

interface MarketHighlightsProps {
    news: NewsItem[];
}

const MarketHighlights: React.FC<MarketHighlightsProps> = ({ news }) => {
    const { theme } = useTheme();
    
    const sortedNews = useMemo(() => {
        if (news.length === 0) return [];
       
        const isCryptews = (item: NewsItem): boolean => {
            const sourceName = item.source.name.toLowerCase().trim();
            return sourceName === 'cryptews' || sourceName.includes('cryptews');
        };

        const getPublishTime = (item: NewsItem): number => {
            try {
                return new Date(item.publishedAt).getTime();
            } catch {
                return 0; // Fallback for invalid dates
            }
        };
       
        const cryptewsNews = news.filter(isCryptews);
        const otherNews = news.filter(item => !isCryptews(item));
       
        // Sort each group by publication time (newest first)
        const sortedCryptewsNews = cryptewsNews.sort((a, b) => 
            getPublishTime(b) - getPublishTime(a)
        );
        
        const sortedOtherNews = otherNews.sort((a, b) => 
            getPublishTime(b) - getPublishTime(a)
        );
       
        const result = [...sortedCryptewsNews, ...sortedOtherNews];
        
        if (__DEV__) {
            console.log('🎯 MarketHighlights sorting:');
            console.log(`Total items: ${news.length}`);
            console.log(`Cryptews items: ${cryptewsNews.length}`);
            console.log(`Other items: ${otherNews.length}`);
            console.log('First 3 items after sorting:', result.slice(0, 3).map(item => ({
                title: item.title.substring(0, 50) + '...',
                source: item.source.name,
                publishedAt: item.publishedAt,
                isCryptews: isCryptews(item)
            })));
        }
        
        return result;
    }, [news]);

    const renderHorizontalNewsItem = useCallback(({ item, index }: { item: NewsItem; index: number }) => {
        return <MarketNewsItem item={item} isHorizontal={true} index={index} />;
    }, []);

    const keyExtractor = useCallback((item: NewsItem, index: number) => {
        // More robust key generation
        return item.id ? item.id.toString() : `${item.url || item.title}-${index}`;
    }, []);

    if (sortedNews.length === 0) {
        return null;
    }

    const styles = createStyles(theme);

    return (
        <View style={styles.highlightsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured</Text>
            </View>
            <FlatList
                data={sortedNews}
                renderItem={renderHorizontalNewsItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.highlightsList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
            />
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    highlightsSection: {
        marginBottom: 25,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.text,
    },
    debugText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    highlightsList: {
        paddingLeft: 20,
        paddingBottom: 10,
    },
});

export default MarketHighlights;