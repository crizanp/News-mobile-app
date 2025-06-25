// MarketScreen.tsx - Updated with Interstitial Ads for Force Reload
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import CategoryFilter, { MarketCategory } from '../../components/news/CategoryFilter';
import EmptyState from '../../components/news/EmptyState';
import LoadingState from '../../components/news/LoadingState';
import MarketHighlights from '../../components/news/MarketHighlights';
import NewsList from '../../components/news/NewsList';
import { useTheme } from '../../contexts/ThemeContext';
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

// Interstitial Ad Configuration
const getInterstitialAdUnitId = () => {
    const isDev = __DEV__ || Constants.expoConfig?.extra?.environment === 'development';
    
    if (isDev) {
        return TestIds.INTERSTITIAL;
    }
    
    // Production ad unit IDs for interstitial ads
    return Platform.OS === 'android' 
        ? 'ca-app-pub-5565400586025993/1234567890' // Replace with your Android interstitial ad unit ID
        : 'ca-app-pub-5565400586025993/0987654321'; // Replace with your iOS interstitial ad unit ID
};

export default function MarketScreen() {
    const { theme, isDark } = useTheme();
    
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
    
    // Ad states
    const [interstitialLoaded, setInterstitialLoaded] = useState<boolean>(false);
    const [isLoadingAd, setIsLoadingAd] = useState<boolean>(false);
    
    const hasInitialData = useRef<boolean>(false);
    const flatListRef = useRef<FlatList>(null);
    const backToTopOpacity = useRef(new Animated.Value(0)).current;
    const cooldownInterval = useRef<number | null>(null);
    const lastRenderLog = useRef<number>(0);
    const interstitialRef = useRef<InterstitialAd | null>(null);

    // Initialize Interstitial Ad
    useEffect(() => {
        const adUnitId = getInterstitialAdUnitId();
        const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: false,
            keywords: [
                'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 
                'news', 'market', 'finance', 'investing', 'blockchain',
                'trading', 'altcoin', 'defi', 'nft'
            ],
        });

        interstitialRef.current = interstitial;

        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            console.log('🎬 Interstitial ad loaded');
            setInterstitialLoaded(true);
            setIsLoadingAd(false);
        });

        const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.warn('🎬 Interstitial ad failed to load:', error);
            setInterstitialLoaded(false);
            setIsLoadingAd(false);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            console.log('🎬 Interstitial ad closed');
            // Reload a new ad for next time
            loadInterstitialAd();
        });

        // Load the first ad
        loadInterstitialAd();

        return () => {
            unsubscribeLoaded();
            unsubscribeError();
            unsubscribeClosed();
        };
    }, []);

    // Function to load interstitial ad
    const loadInterstitialAd = useCallback(() => {
        if (interstitialRef.current && !isLoadingAd) {
            console.log('🎬 Loading interstitial ad...');
            setIsLoadingAd(true);
            setInterstitialLoaded(false);
            interstitialRef.current.load();
        }
    }, [isLoadingAd]);

    // Function to show interstitial ad
    const showInterstitialAd = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            if (interstitialRef.current && interstitialLoaded) {
                console.log('🎬 Showing interstitial ad');
                
                const unsubscribeClosed = interstitialRef.current.addAdEventListener(
                    AdEventType.CLOSED, 
                    () => {
                        console.log('🎬 Interstitial ad closed by user');
                        unsubscribeClosed();
                        resolve(true);
                    }
                );

                const unsubscribeError = interstitialRef.current.addAdEventListener(
                    AdEventType.ERROR, 
                    (error) => {
                        console.warn('🎬 Interstitial ad show error:', error);
                        unsubscribeError();
                        resolve(false);
                    }
                );

                interstitialRef.current.show();
            } else {
                console.log('🎬 Interstitial ad not ready, proceeding without ad');
                resolve(false);
            }
        });
    }, [interstitialLoaded]);

    // Create dynamic styles based on current theme
    const dynamicStyles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            backgroundColor: theme.colors.headerBackground,
            paddingTop: 40,
            paddingBottom: 15,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 5,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        content: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        },
        enabledRefreshButton: {
            backgroundColor: isDark ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 200, 81, 0.1)',
        },
        disabledRefreshButton: {
            backgroundColor: isDark ? 'rgba(142, 142, 147, 0.2)' : 'rgba(204, 204, 204, 0.1)',
        },
        loadingAdRefreshButton: {
            backgroundColor: isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
        },
        cooldownText: {
            fontSize: 12,
            color: isDark ? '#8E8E93' : '#CCCCCC',
            fontWeight: '600',
            marginLeft: 4,
        },
        backToTopTouchable: {
            width: 45,
            height: 45,
            borderRadius: 25,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.59)',
            justifyContent: 'center',
            alignItems: 'center',
        },
    }), [theme, isDark]);

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

    const handleForceRefresh = useCallback(async (): Promise<void> => {
        if (isReloadDisabled) {
            Alert.alert(
                'Reload Cooldown',
                `Please wait ${formatRemainingTime(remainingTime)} before reloading again.`,
                [{ text: 'OK', style: 'default' }]
            );
            return;
        }

        console.log('🔄 Force refresh triggered with ad and cooldown');
        
        // Show interstitial ad first
        const adShown = await showInterstitialAd();
        
        if (adShown) {
            console.log('🎬 Ad shown successfully, proceeding with force refresh');
        } else {
            console.log('🎬 Ad not shown, proceeding with force refresh anyway');
        }
        
        // Proceed with force refresh regardless of ad status
        setRefreshing(true);
        startReloadCooldown(); // Start the 5-minute cooldown
        fetchMarketNews(true); // Force refresh
        
        // Load next ad for future use
        if (!isLoadingAd) {
            setTimeout(() => {
                loadInterstitialAd();
            }, 2000); // Wait 2 seconds before loading next ad
        }
    }, [isReloadDisabled, remainingTime, showInterstitialAd, isLoadingAd, loadInterstitialAd]);

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

    // Get refresh button style based on state
    const getRefreshButtonStyle = () => {
        if (isReloadDisabled) {
            return dynamicStyles.disabledRefreshButton;
        } else if (isLoadingAd) {
            return dynamicStyles.loadingAdRefreshButton;
        } else {
            return dynamicStyles.enabledRefreshButton;
        }
    };

    // Get refresh button icon color
    const getRefreshButtonColor = () => {
        if (isReloadDisabled) {
            return isDark ? '#8E8E93' : '#CCCCCC';
        } else if (isLoadingAd) {
            return isDark ? '#FFC107' : '#FF8F00';
        } else {
            return isDark ? '#0A84FF' : '#00C851';
        }
    };

    // Loading state
    if (loading && !refreshing && !hasInitialData.current) {
        console.log('🔄 Showing loading state');
        return (
            <View style={dynamicStyles.container}>
                <LoadingState />
            </View>
        );
    }

    // Empty state
    if (!hasInitialData.current && !loading) {
        console.log('📭 Showing empty state');
        return (
            <View style={dynamicStyles.container}>
                <View style={dynamicStyles.header}>
                    <Text style={dynamicStyles.headerTitle}>Market News</Text>
                </View>
                <FlatList
                    style={dynamicStyles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
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
        <View style={dynamicStyles.container}>
            {/* Header */}
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>Market News</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[
                            styles.refreshButton, 
                            getRefreshButtonStyle()
                        ]}
                        onPress={onForceRefresh}
                        disabled={refreshing || isReloadDisabled}
                        activeOpacity={isReloadDisabled ? 1 : 0.7}
                    >
                        <Ionicons 
                            name={isLoadingAd ? "play-circle-outline" : "refresh-circle-outline"}
                            size={28} 
                            color={getRefreshButtonColor()}
                        />
                        {/* {isReloadDisabled && remainingTime > 0 && (
                            <Text style={dynamicStyles.cooldownText}>
                                {formatRemainingTime(remainingTime)}
                            </Text>
                        )}
                        {isLoadingAd && (
                            <Text style={[dynamicStyles.cooldownText, { color: getRefreshButtonColor() }]}>
                                Ad
                            </Text>
                        )} */}
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                style={dynamicStyles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
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
                    style={dynamicStyles.backToTopTouchable}
                    onPress={scrollToTop}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-up" size={24} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

// Static styles that don't change with theme
const styles = StyleSheet.create({
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
    backToTopButton: {
        position: 'absolute',
        bottom: 30,
        right: 15,
        elevation: 8,
    },
});