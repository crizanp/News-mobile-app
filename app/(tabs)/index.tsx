// screens/MarketScreen.tsx - Updated for unlimited XML RSS feeds
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CategoryFilter, { MarketCategory } from '../../components/news/CategoryFilter';
import EmptyState from '../../components/news/EmptyState';
import LoadingState from '../../components/news/LoadingState';
import MarketHighlights from '../../components/news/MarketHighlights';
import NewsList from '../../components/news/NewsList';
import { rssNewsService } from '../../services/rssNewsService';
import { NewsItem } from '../../types';

// Market categories for filtering news
const marketCategories: MarketCategory[] = [
    { id: 'all', name: 'All Markets', icon: 'trending-up-outline' },
    { id: 'bitcoin', name: 'Bitcoin', icon: 'logo-bitcoin' },
    { id: 'ethereum', name: 'Ethereum', icon: 'diamond-outline' },
    { id: 'altcoins', name: 'Altcoins', icon: 'cellular-outline' },
    { id: 'defi', name: 'DeFi', icon: 'swap-horizontal-outline' },
    { id: 'trading', name: 'Trading', icon: 'bar-chart-outline' },
    { id: 'analysis', name: 'Analysis', icon: 'analytics-outline' },
    { id: 'regulation', name: 'Regulation', icon: 'shield-outline' },
];

export default function MarketScreen() {
    const [allNews, setAllNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
    const hasInitialData = useRef<boolean>(false);

    const fetchMarketNews = async (forceRefresh: boolean = false): Promise<void> => {
        try {
            console.log('🚀 Starting fetchMarketNews... Force refresh:', forceRefresh);
            setDebugInfo('Fetching unlimited news from XML feeds...');
            setLoading(!refreshing);

            let rssNews: NewsItem[];

            if (forceRefresh) {
                // Force refresh to get latest data
                rssNews = await rssNewsService.forceRefresh();
                setDebugInfo('Force refreshed - fetching all new data...');
            } else {
                // Get all cached/fresh data (no limit = 0)
                rssNews = await rssNewsService.getCryptoNews(0);
                setDebugInfo('Loading cached data with fresh updates...');
            }

            console.log('📰 Received news items:', rssNews.length);

            if (rssNews.length > 0) {
                setAllNews(rssNews);
                hasInitialData.current = true;
                setDebugInfo(`✅ Loaded ${rssNews.length} news items from XML feeds`);

                // Log feed sources for debugging
                const sources = [...new Set(rssNews.map(item => item.source.name))];
                console.log('📡 News sources:', sources);

            } else {
                console.log('⚠️ No news received');
                setDebugInfo('No news received - using mock data');
            }
        } catch (error) {
            console.error('❌ Error fetching market news:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setDebugInfo(`❌ Error: ${errorMessage}`);

            Alert.alert(
                'Network Error',
                'Failed to fetch market news. Please check your internet connection and try again.',
                [
                    { text: 'Force Refresh', onPress: () => fetchMarketNews(true) },
                    { text: 'Retry', onPress: () => fetchMarketNews(false) },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback((): void => {
        console.log('🔄 Refresh triggered');
        setRefreshing(true);
        fetchMarketNews(false); // Regular refresh
    }, []);

    const onForceRefresh = useCallback((): void => {
        console.log('🔄 Force refresh triggered');
        setRefreshing(true);
        fetchMarketNews(true); // Force refresh
    }, []);

    const handleCategorySelect = useCallback((categoryId: string) => {
        console.log('🏷️ Category selected:', categoryId);
        setSelectedCategory(categoryId);
    }, []);

    // Fetch data on first focus
    useFocusEffect(
        useCallback(() => {
            console.log('👁️ Screen focused, hasInitialData:', hasInitialData.current);
            if (!hasInitialData.current) {
                fetchMarketNews(false);
            }
        }, [])
    );

    // Enhanced filter function with more categories
    const filterNewsByCategory = useCallback((newsItems: NewsItem[], category: string): NewsItem[] => {
        console.log(`🔍 Filtering ${newsItems.length} items by category: ${category}`);

        if (category === 'all') return newsItems;

        const filtered = newsItems.filter(item => {
            const title = item.title.toLowerCase();
            const description = item.description.toLowerCase();
            const source = item.source.name.toLowerCase();
            const feedCategory = (item as any).feedCategory?.toLowerCase() || '';

            switch (category) {
                case 'bitcoin':
                    return title.includes('bitcoin') || title.includes('btc') ||
                        description.includes('bitcoin') || description.includes('btc') ||
                        feedCategory === 'bitcoin';

                case 'ethereum':
                    return title.includes('ethereum') || title.includes('eth') ||
                        description.includes('ethereum') || description.includes('eth') ||
                        title.includes('vitalik');

                case 'altcoins':
                    return title.includes('altcoin') || title.includes('alt') ||
                        title.includes('dogecoin') || title.includes('doge') ||
                        title.includes('cardano') || title.includes('ada') ||
                        title.includes('polygon') || title.includes('matic') ||
                        title.includes('solana') || title.includes('sol') ||
                        title.includes('chainlink') || title.includes('link') ||
                        title.includes('polkadot') || title.includes('dot') ||
                        description.includes('altcoin') || description.includes('alt');

                case 'defi':
                    return title.includes('defi') || title.includes('decentralized finance') ||
                        title.includes('uniswap') || title.includes('compound') ||
                        title.includes('aave') || title.includes('yield') ||
                        title.includes('liquidity') || title.includes('staking') ||
                        description.includes('defi') || feedCategory === 'defi' ||
                        source.includes('defiant');

                case 'trading':
                    return title.includes('trading') || title.includes('trade') ||
                        title.includes('exchange') || title.includes('volume') ||
                        title.includes('price') || title.includes('market') ||
                        title.includes('bullish') || title.includes('bearish') ||
                        description.includes('trading') || description.includes('exchange');

                case 'analysis':
                    return title.includes('analysis') || title.includes('forecast') ||
                        title.includes('prediction') || title.includes('technical') ||
                        title.includes('chart') || title.includes('outlook') ||
                        title.includes('target') || title.includes('support') ||
                        title.includes('resistance') || description.includes('analysis');

                case 'regulation':
                    return title.includes('regulation') || title.includes('regulatory') ||
                        title.includes('sec') || title.includes('government') ||
                        title.includes('legal') || title.includes('compliance') ||
                        title.includes('ban') || title.includes('approve') ||
                        title.includes('law') || description.includes('regulation');

                default:
                    return true;
            }
        });

        console.log(`🔍 Filtered to ${filtered.length} items`);
        return filtered;
    }, []);

    // Memoized filtered data
    const filteredNews = useMemo(() => {
        const result = filterNewsByCategory(allNews, selectedCategory);
        console.log(`📊 Filtered news: ${result.length} items`);
        return result;
    }, [allNews, selectedCategory, filterNewsByCategory]);

    // Split filtered news into featured and regular
    const { featuredNews, regularNews } = useMemo(() => {
        const featured = filteredNews.slice(0, 6); // More featured articles
        const regular = filteredNews.slice(6);

        console.log(`⭐ Featured: ${featured.length}, Regular: ${regular.length}`);
        return { featuredNews: featured, regularNews: regular };
    }, [filteredNews]);

    // Debug info display
    const debugDisplay = __DEV__ ? (
        <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
                Debug: {debugInfo} | Total: {allNews.length} | Filtered: {filteredNews.length} |
                Featured: {featuredNews.length} | Regular: {regularNews.length} |
                Loading: {loading ? 'YES' : 'NO'} | HasData: {hasInitialData.current ? 'YES' : 'NO'}
            </Text>
        </View>
    ) : null;

    // Loading state
    if (loading && !refreshing && !hasInitialData.current) {
        console.log('🔄 Showing loading state');
        return (
            <View style={styles.container}>
                {debugDisplay}
                <LoadingState />
            </View>
        );
    }

    // Empty state
    if (!hasInitialData.current && !loading) {
        console.log('📭 Showing empty state');
        return (
            <View style={styles.container}>
                {debugDisplay}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Market News</Text>
                </View>
                <FlatList
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                    data={[]}
                    renderItem={() => null}
                    ListEmptyComponent={
                        <EmptyState onButtonPress={onRefresh} />
                    }
                />
            </View>
        );
    }

    console.log('🏠 Rendering main screen with data');
    return (
        <View style={styles.container}>
            {/* {debugDisplay} */}

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Market News</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[styles.refreshButton, styles.forceRefreshButton]}
                        onPress={onForceRefresh}
                        disabled={refreshing}
                    >
                        <Ionicons name="refresh-circle-outline" size={20} color="#FF6B35" />
                        <Text style={styles.forceRefreshText}>Force</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={onRefresh}
                        disabled={refreshing}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                    />
                }
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={15}
                windowSize={15}
                initialNumToRender={8}
                updateCellsBatchingPeriod={100}
                data={[{ type: 'content' }]}
                renderItem={() => (
                    <>
                        {/* Categories */}
                        <CategoryFilter
                            categories={marketCategories}
                            selectedCategory={selectedCategory}
                            onCategorySelect={handleCategorySelect}
                        />

                        {/* Market Highlights */}
                        <MarketHighlights news={featuredNews} />

                        {/* All filtered news */}
                        <NewsList news={regularNews} />


                    </>
                )}
                keyExtractor={() => 'content'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#FFF',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    forceRefreshButton: {
        backgroundColor: '#FFF0E6',
    },
    forceRefreshText: {
        fontSize: 10,
        color: '#FF6B35',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    debugContainer: {
        backgroundColor: '#FFE4B5',
        padding: 10,
        margin: 5,
        borderRadius: 5,
    },
    debugSection: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        margin: 20,
        borderRadius: 8,
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    debugText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
});