// components/NewsList.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NewsItem } from '../../types';
import MarketNewsItem from './MarketNewsItem';

interface NewsListProps {
    news: NewsItem[];
    title?: string;
}

const NewsList: React.FC<NewsListProps> = ({ news, title = 'Latest Updates' }) => {
    const renderVerticalNewsItem = useCallback(({ item }: { item: NewsItem }) => (
        <MarketNewsItem item={item} isHorizontal={false} />
    ), []);

    const keyExtractor = useCallback((item: NewsItem) => item.id.toString(), []);

    return (
        <View style={styles.newsSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.newsCount}>
                    {news.length} articles
                </Text>
            </View>
            {news.length > 0 ? (
                <FlatList
                    data={news}
                    renderItem={renderVerticalNewsItem}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />
            ) : (
                <View style={styles.emptyResultsContainer}>
                    <Ionicons name="newspaper-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyResultsText}>
                        No market news available for this category
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
        color: '#1A1A1A',
    },
    newsCount: {
        fontSize: 14,
        color: '#666',
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
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
});

export default NewsList;