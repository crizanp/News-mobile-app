// components/MarketHighlights.tsx
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NewsItem } from '../../types';
import MarketNewsItem from './MarketNewsItem';

interface MarketHighlightsProps {
    news: NewsItem[];
}

const MarketHighlights: React.FC<MarketHighlightsProps> = ({ news }) => {
    // Sort news to prioritize Cryptews articles first
    const sortedNews = useMemo(() => {
        if (news.length === 0) return [];
        
        // Separate Cryptews news from other news
        const cryptewsNews = news.filter(item => 
            item.source.name === 'Cryptews' || 
            item.source.name==='Cryptews'
        );
        
        const otherNews = news.filter(item => 
            item.source.name !== 'Cryptews' && 
            !item.source.name.toLowerCase().includes('Cryptews')
        );
        
        // Return Cryptews news first, then other news
        return [...cryptewsNews, ...otherNews];
    }, [news]);

    const renderHorizontalNewsItem = useCallback(({ item }: { item: NewsItem }) => {
        return <MarketNewsItem item={item} isHorizontal={true} />;
    }, []);

    const keyExtractor = useCallback((item: NewsItem) => item.id.toString(), []);

    if (sortedNews.length === 0) {
        return null;
    }

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
            />
        </View>
    );
};

const styles = StyleSheet.create({
    highlightsSection: {
        marginBottom: 25,
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
        color: '#1A1A1A',
    },
    highlightsList: {
        paddingLeft: 20,
        paddingBottom: 10
    },
});

export default MarketHighlights;