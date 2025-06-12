// components/MarketHighlights.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NewsItem } from '../../types';
import MarketNewsItem from './MarketNewsItem';

interface MarketHighlightsProps {
    news: NewsItem[];
}

const MarketHighlights: React.FC<MarketHighlightsProps> = ({ news }) => {
    const renderHorizontalNewsItem = useCallback(({ item }: { item: NewsItem }) => (
        <MarketNewsItem item={item} isHorizontal={true} />
    ), []);

    const keyExtractor = useCallback((item: NewsItem) => item.id.toString(), []);

    if (news.length === 0) {
        return null;
    }

    return (
        <View style={styles.highlightsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Market Highlights</Text>
                <Ionicons name="trending-up" size={20} color="#007AFF" />
            </View>
            <FlatList
                data={news}
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
    },
});

export default MarketHighlights;