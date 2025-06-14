// MarketScreen.tsx - Fixed excessive re-renders and timer type issue
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
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

// Constants for reload cooldown
const RELOAD_COOLDOWN_KEY = 'market_screen_reload_cooldown';
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function MarketScreen() {
    const [allNews, setAllNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
    const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
    
    // Reload cooldown states
    const [isReloadDisabled, setIsReloadDisabled] = useState<boolean>(false);
    const [cooldownEndTime, setCooldownEndTime] = useState<number>(0);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    
    const hasInitialData = useRef<boolean>(false);
    const flatListRef = useRef<FlatList>(null);
    const backToTopOpacity = useRef(new Animated.Value(0)).current;
    const cooldownInterval = useRef<number | null>(null);
    const lastRenderLog = useRef<number>(0);

    // Check cooldown status on component mount
    useEffect(() => {
        checkCooldownStatus();
        return () => {
            if (cooldownInterval.current) {
                clearInterval(cooldownInterval.current);
            }
        };
    }, []);

    // Check if reload is still in cooldown
    const checkCooldownStatus = async () => {
        try {
            const storedEndTime = await AsyncStorage.getItem(RELOAD_COOLDOWN_KEY);
            if (storedEndTime) {
                const endTime = parseInt(storedEndTime, 10);
                const now = Date.now();
                
                if (now < endTime) {
                    // Still in cooldown
                    setIsReloadDisabled(true);
                    setCooldownEndTime(endTime);
                    startCooldownTimer(endTime);
                } else {
                    // Cooldown expired, clear storage
                    await AsyncStorage.removeItem(RELOAD_COOLDOWN_KEY);
                    setIsReloadDisabled(false);
                    setCooldownEndTime(0);
                    setRemainingTime(0);
                }
            }
        } catch (error) {
            console.error('Error checking cooldown status:', error);
        }
    };

    // Start cooldown timer
    const startCooldownTimer = (endTime: number) => {
        if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current);
        }

        cooldownInterval.current = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            
            setRemainingTime(remaining);
            
            if (remaining <= 0) {
                // Cooldown finished
                setIsReloadDisabled(false);
                setCooldownEndTime(0);
                setRemainingTime(0);
                AsyncStorage.removeItem(RELOAD_COOLDOWN_KEY);
                
                if (cooldownInterval.current) {
                    clearInterval(cooldownInterval.current);
                    cooldownInterval.current = null;
                }
            }
        }, 1000);
    };

    // Start reload cooldown
    const startReloadCooldown = async () => {
        const endTime = Date.now() + COOLDOWN_DURATION;
        
        try {
            await AsyncStorage.setItem(RELOAD_COOLDOWN_KEY, endTime.toString());
            setIsReloadDisabled(true);
            setCooldownEndTime(endTime);
            startCooldownTimer(endTime);
        } catch (error) {
            console.error('Error setting cooldown:', error);
        }
    };

    // Format remaining time for display
    const formatRemainingTime = (timeMs: number): string => {
        const minutes = Math.floor(timeMs / (60 * 1000));
        const seconds = Math.floor((timeMs % (60 * 1000)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

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
                    { text: 'Force Refresh', onPress: () => handleForceRefresh() },
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

    const handleForceRefresh = useCallback((): void => {
        if (isReloadDisabled) {
            Alert.alert(
                'Reload Cooldown',
                `Please wait ${formatRemainingTime(remainingTime)} before reloading again.`,
                [{ text: 'OK', style: 'default' }]
            );
            return;
        }

        console.log('🔄 Force refresh triggered with cooldown');
        setRefreshing(true);
        startReloadCooldown(); // Start the 5-minute cooldown
        fetchMarketNews(true); // Force refresh
    }, [isReloadDisabled, remainingTime]);

    const onForceRefresh = useCallback((): void => {
        handleForceRefresh();
    }, [handleForceRefresh]);

    const handleCategorySelect = useCallback((categoryId: string) => {
        console.log('🏷️ Category selected:', categoryId);
        setSelectedCategory(categoryId);
        // Reset scroll position when category changes
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    }, []);

    // Handle scroll events for back to top button
    const handleScroll = useCallback((event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        const shouldShow = scrollY > 300; // Show after scrolling 300px

        if (shouldShow !== showBackToTop) {
            setShowBackToTop(shouldShow);
            Animated.timing(backToTopOpacity, {
                toValue: shouldShow ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [showBackToTop, backToTopOpacity]);

    // Scroll to top function
    const scrollToTop = useCallback(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
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

    // Optimized filter function with stable reference
    const filterNewsByCategory = useCallback((newsItems: NewsItem[], category: string): NewsItem[] => {
        if (category === 'all') return newsItems;

        // Only log when category or items count changes significantly
        const shouldLog = __DEV__ && (newsItems.length % 50 === 0 || newsItems.length < 10);
        if (shouldLog) {
            console.log(`🔍 Filtering ${newsItems.length} items by category: ${category}`);
        }

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

        if (shouldLog) {
            console.log(`🔍 Filtered to ${filtered.length} items`);
        }
        return filtered;
    }, []); // Empty dependency array for stable reference

    // Memoized filtered data
    const filteredNews = useMemo(() => {
        const result = filterNewsByCategory(allNews, selectedCategory);
        if (__DEV__ && result.length > 0 && result.length % 50 === 0) {
            console.log(`📊 Filtered news: ${result.length} items`);
        }
        return result;
    }, [allNews, selectedCategory, filterNewsByCategory]);

    // Optimized split filtered news with Cryptews prioritization
    const { featuredNews, regularNews } = useMemo(() => {
        if (filteredNews.length === 0) {
            return { featuredNews: [], regularNews: [] };
        }

        // Helper function to check if item is from Cryptews (case-insensitive)
        const isCryptews = (item: NewsItem): boolean => {
            const sourceName = item.source.name.toLowerCase().trim();
            return sourceName === 'cryptews' || sourceName.includes('cryptews');
        };

        // Helper function to get publication timestamp
        const getPublishTime = (item: NewsItem): number => {
            try {
                return new Date(item.publishedAt).getTime();
            } catch {
                return 0;
            }
        };

        // Separate Cryptews and other news
        const cryptewsNews = filteredNews.filter(isCryptews);
        const otherNews = filteredNews.filter(item => !isCryptews(item));

        // Sort each group by publication time (newest first)
        const sortedCryptewsNews = cryptewsNews.sort((a, b) => 
            getPublishTime(b) - getPublishTime(a)
        );
        const sortedOtherNews = otherNews.sort((a, b) => 
            getPublishTime(b) - getPublishTime(a)
        );

        // Build featured news: 1 latest Cryptews + 5 from other sources (total 6)
        const maxFeatured = 6;
        let featured: NewsItem[] = [];
        
        // First, add only the latest 1 Cryptews article if available
        if (sortedCryptewsNews.length > 0) {
            featured = [sortedCryptewsNews[0]]; // Only take the first (latest) one
        }
        
        // Then fill remaining slots with other sources (up to 5 more)
        const remainingSlots = maxFeatured - featured.length;
        if (remainingSlots > 0) {
            featured = [...featured, ...sortedOtherNews.slice(0, remainingSlots)];
        }

        // Regular news: everything not in featured (including other Cryptews articles)
        const featuredIds = new Set(featured.map(item => item.id || item.url));
        const regular = filteredNews.filter(item => 
            !featuredIds.has(item.id || item.url)
        ).sort((a, b) => getPublishTime(b) - getPublishTime(a));

        return { featuredNews: featured, regularNews: regular };
    }, [filteredNews]);

    // Debug logging effect (separated from render cycle)
    useEffect(() => {
        if (__DEV__ && featuredNews.length > 0) {
            const isCryptews = (item: NewsItem): boolean => {
                const sourceName = item.source.name.toLowerCase().trim();
                return sourceName === 'cryptews' || sourceName.includes('cryptews');
            };

            console.log(`⭐ Featured: ${featuredNews.length} (${featuredNews.filter(isCryptews).length} Cryptews + ${featuredNews.length - featuredNews.filter(isCryptews).length} others), Regular: ${regularNews.length}`);
            
            console.log('🎯 Featured news (1 Cryptews + 5 others = 6 total):');
            featuredNews.forEach((item, index) => {
                console.log(`  ${index + 1}. ${isCryptews(item) ? '[CRYPTEWS]' : '[OTHER]'} ${item.source.name}: ${item.title.substring(0, 50)}...`);
            });
        }
    }, [featuredNews, regularNews]);

    // Memoized FlatList data to prevent recreation
    const flatListData = useMemo(() => [{ type: 'content' }], []);

    // Throttled render logging
    const logRender = () => {
        const now = Date.now();
        if (now - lastRenderLog.current > 2000) { // Only log once per 2 seconds
            console.log('🏠 Rendering main screen with data');
            lastRenderLog.current = now;
        }
    };

    // Loading state
    if (loading && !refreshing && !hasInitialData.current) {
        console.log('🔄 Showing loading state');
        return (
            <View style={styles.container}>
                <LoadingState />
            </View>
        );
    }

    // Empty state
    if (!hasInitialData.current && !loading) {
        console.log('📭 Showing empty state');
        return (
            <View style={styles.container}>
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

    // Main render with throttled logging
    logRender();
    
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Market News</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[
                            styles.refreshButton, 
                            isReloadDisabled ? styles.disabledRefreshButton : styles.enabledRefreshButton
                        ]}
                        onPress={onForceRefresh}
                        disabled={refreshing || isReloadDisabled}
                        activeOpacity={isReloadDisabled ? 1 : 0.7}
                    >
                        <Ionicons 
                            name="refresh-circle-outline" 
                            size={28} 
                            color={isReloadDisabled ? '#CCCCCC' : '#00C851'} 
                        />
                        {isReloadDisabled && remainingTime > 0 && (
                            <Text style={styles.cooldownText}>
                                {formatRemainingTime(remainingTime)}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
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
                onScroll={handleScroll}
                scrollEventThrottle={16}
                data={flatListData}
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

            {/* Back to Top Button */}
            <Animated.View
                style={[
                    styles.backToTopButton,
                    {
                        opacity: backToTopOpacity,
                        transform: [
                            {
                                scale: backToTopOpacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    },
                ]}
                pointerEvents={showBackToTop ? 'auto' : 'none'}
            >
                <TouchableOpacity
                    style={styles.backToTopTouchable}
                    onPress={scrollToTop}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-up" size={24} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>
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
        padding: 4,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minWidth: 40,
        justifyContent: 'center',
    },
    enabledRefreshButton: {
        backgroundColor: 'rgba(0, 200, 81, 0.1)', // Light green background when enabled
    },
    disabledRefreshButton: {
        backgroundColor: 'rgba(204, 204, 204, 0.1)', // Light gray background when disabled
    },
    cooldownText: {
        fontSize: 12,
        color: '#CCCCCC',
        fontWeight: '600',
        marginLeft: 4,
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
    backToTopButton: {
        position: 'absolute',
        bottom: 30,
        right: 15,
        
        elevation: 8,

    },
    backToTopTouchable: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.59)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});