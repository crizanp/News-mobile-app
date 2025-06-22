// app/(tabs)/market.tsx - Enhanced Market Page with Theme Support
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CoinItem from '../../components/CoinItem';
import SearchHeader from '../../components/SearchHeader';
import SkeletonLoader from '../../components/SkeletonLoader';
import SortOptions from '../../components/SortOptions';
import { useTheme } from '../../contexts/ThemeContext';
import { cryptoApi } from '../../services/cryptoApi';
import { Coin } from '../../types';

const sortOptions = [
  { id: 'market_cap', name: 'Market Cap', icon: 'stats-chart' },
  { id: 'price', name: 'Price', icon: 'pricetag' },
  { id: 'change_24h', name: '24h Change', icon: 'trending-up' },
  { id: 'volume', name: 'Volume', icon: 'bar-chart' },
];

interface FavoriteCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
}

export default function MarketScreen() {
  const { theme, isDark } = useTheme();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('market_cap');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'market' | 'watchlist'>('market');
  const [favoriteCoins, setFavoriteCoins] = useState<FavoriteCoin[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState<boolean>(false);
  const hasInitialData = useRef<boolean>(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const COINS_PER_PAGE = 100;
  const FAVORITES_KEY = 'crypto_favorites';

  const fetchCoins = async (page: number = 1, append: boolean = false): Promise<void> => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Calculate offset for pagination
      const offset = (page - 1) * COINS_PER_PAGE;
      const data = await cryptoApi.getTopCoins(COINS_PER_PAGE, offset);

      if (append) {
        // Append new data to existing coins, ensuring no duplicates
        setCoins(prevCoins => {
          const existingIds = new Set(prevCoins.map(coin => coin.id));
          const newCoins = data.filter(coin => !existingIds.has(coin.id));
          return [...prevCoins, ...newCoins];
        });
      } else {
        // Replace existing data
        setCoins(data);
      }

      // Check if we have more data
      setHasMoreData(data.length === COINS_PER_PAGE);
      hasInitialData.current = true;

    } catch (error) {
      console.error('Error fetching coins:', error);
      Alert.alert(
        'Error',
        'Failed to fetch cryptocurrency data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setWatchlistLoading(true);
      
      // Get favorite coin IDs from AsyncStorage
      const favoritesString = await AsyncStorage.getItem(FAVORITES_KEY);
      const favoriteIds = favoritesString ? JSON.parse(favoritesString) : [];
      
      if (favoriteIds.length === 0) {
        setFavoriteCoins([]);
        setWatchlistLoading(false);
        return;
      }

      // Fetch all coins to find the favorites
      const allCoins = await cryptoApi.getTopCoins(100, 0);
      
      // Filter coins that are in favorites
      const favorites = allCoins.filter(coin => favoriteIds.includes(coin.id));
      
      // Transform to FavoriteCoin format
      const favoriteCoinData: FavoriteCoin[] = favorites.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
      }));

      setFavoriteCoins(favoriteCoinData);

      // Animate content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert(
        'Error',
        'Failed to load watchlist. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setWatchlistLoading(false);
    }
  };

  const removeFavorite = async (coinId: string) => {
    try {
      const favoritesString = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = favoritesString ? JSON.parse(favoritesString) : [];
      
      // Remove the coin from favorites
      favorites = favorites.filter((id: string) => id !== coinId);
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      
      // Update local state
      setFavoriteCoins(prev => prev.filter(coin => coin.id !== coinId));
      
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove from watchlist');
    }
  };

  const handleRemoveFavorite = (coin: FavoriteCoin) => {
    Alert.alert(
      'Remove from Watchlist',
      `Remove ${coin.name} from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFavorite(coin.id)
        }
      ]
    );
  };

  const loadMoreCoins = async (): Promise<void> => {
    if (loadingMore || !hasMoreData || activeTab === 'watchlist') return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchCoins(nextPage, true);
  };

  // Update the onRefresh function
  const onRefresh = (): void => {
    setRefreshing(true);
    if (activeTab === 'market') {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchCoins(1, false);
    } else {
      loadFavorites();
    }
  };

  // Add footer component for loading more
  const renderFooter = () => {
    if (activeTab === 'watchlist') return null;
    
    if (!hasMoreData) {
      return (
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            No more cryptocurrencies to load
          </Text>
        </View>
      );
    }
    
    if (loadingMore) {
      return (
        <View style={styles.footerContainer}>
          <SkeletonLoader type="list" count={3} />
        </View>
      );
    }

    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.loadMoreButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadMoreCoins}
        >
          <Text style={styles.loadMoreButtonText}>
            Load More 
          </Text>
          <Ionicons name="chevron-down" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  // Filter and sort coins based on search query and selected sort
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = activeTab === 'market' ? coins : favoriteCoins;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    // Sort coins
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'market_cap':
          return b.market_cap - a.market_cap;
        case 'price':
          return b.current_price - a.current_price;
        case 'change_24h':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case 'volume':
          return activeTab === 'market' ? 
            (b as Coin).total_volume - (a as Coin).total_volume : 
            b.market_cap - a.market_cap;
        default:
          return b.market_cap - a.market_cap;
      }
    });

    return sorted;
  }, [coins, favoriteCoins, searchQuery, selectedSort, activeTab]);

  // Only fetch data on first focus
  useFocusEffect(
    useCallback(() => {
      if (!hasInitialData.current) {
        fetchCoins();
      }
      if (activeTab === 'watchlist') {
        loadFavorites();
      }
    }, [activeTab])
  );

  const handleCoinPress = (coin: Coin | FavoriteCoin) => {
    router.push({
      pathname: '/coin-detail',
      params: { coinId: coin.id, symbol: coin.symbol }
    });
  };

  const renderCoinItem = ({ item }: { item: Coin | FavoriteCoin }) => {
    if (activeTab === 'market') {
      return <CoinItem item={item as Coin} onPress={() => handleCoinPress(item)} />;
    } else {
      return renderWatchlistItem(item as FavoriteCoin);
    }
  };

  const renderWatchlistItem = (coin: FavoriteCoin) => {
    const formatPrice = (price: number) => {
      if (price >= 1000) {
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (price >= 1) {
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
      } else if (price >= 0.01) {
        return `$${price.toFixed(4)}`;
      } else if (price >= 0.000001) {
        return `$${price.toExponential(2)}`;
      } else if (price > 0) {
        return `$${price.toExponential(3)}`;
      }
      return `$0.00`;
    };

    const formatPercentage = (percentage: number) => {
      const isPositive = percentage >= 0;
      return {
        value: `${isPositive ? '+' : ''}${percentage.toFixed(2)}%`,
        color: isPositive ? '#00C851' : '#FF4444',
      };
    };

    const priceChange = formatPercentage(coin.price_change_percentage_24h);

    return (
      <TouchableOpacity
        style={[styles.coinItem, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border 
        }]}
        onPress={() => handleCoinPress(coin)}
        activeOpacity={0.7}
      >
        <View style={styles.coinLeft}>
          <View style={styles.rankContainer}>
            <Text style={[styles.rank, { color: theme.colors.textSecondary }]}>
              #{coin.market_cap_rank}
            </Text>
          </View>
          
          <Image
            source={{ uri: coin.image }}
            style={styles.coinIcon}
          />
          
          <View style={styles.coinInfo}>
            <Text style={[styles.coinName, { color: theme.colors.text }]} numberOfLines={1}>
              {coin.name}
            </Text>
            <Text style={[styles.coinSymbol, { color: theme.colors.textSecondary }]}>
              {coin.symbol.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.coinRight}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.colors.text }]}>
              {formatPrice(coin.current_price)}
            </Text>
            <View style={styles.changeContainer}>
              <Text style={[styles.change, { color: priceChange.color }]}>
                {priceChange.value}
              </Text>
              <Ionicons
                name={priceChange.color === '#00C851' ? 'trending-up' : 'trending-down'}
                size={12}
                color={priceChange.color}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.favoriteButton, { 
              backgroundColor: isDark ? '#4A1F1F' : '#FFE5E5' 
            }]}
            onPress={() => handleRemoveFavorite(coin)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleTabChange = (tab: 'market' | 'watchlist') => {
    setActiveTab(tab);
    setSearchQuery('');
    if (tab === 'watchlist') {
      loadFavorites();
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
    }
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { 
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.border 
    }]}>
      <TouchableOpacity
        style={[
          styles.tab, 
          activeTab === 'market' && { backgroundColor: isDark ? '#1E3A8A' : '#E3F2FD' }
        ]}
        onPress={() => handleTabChange('market')}
      >
        <Ionicons 
          name="trending-up" 
          size={20} 
          color={activeTab === 'market' ? theme.colors.primary : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          { color: activeTab === 'market' ? theme.colors.primary : theme.colors.textSecondary }
        ]}>
          Market
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab, 
          activeTab === 'watchlist' && { backgroundColor: isDark ? '#1E3A8A' : '#E3F2FD' }
        ]}
        onPress={() => handleTabChange('watchlist')}
      >
        <Ionicons 
          name="heart" 
          size={20} 
          color={activeTab === 'watchlist' ? theme.colors.primary : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          { color: activeTab === 'watchlist' ? theme.colors.primary : theme.colors.textSecondary }
        ]}>
          Watchlist
        </Text>
        {favoriteCoins.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favoriteCoins.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // Show skeleton loader only during initial load
  if ((loading && !refreshing && !hasInitialData.current && activeTab === 'market') || 
      (watchlistLoading && activeTab === 'watchlist')) {
    return <SkeletonLoader type="market" count={10} />;
  }

  // Show empty state when no data and not loading
  if (!hasInitialData.current && !loading && activeTab === 'market') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SearchHeader
          title="Crypto Market"
          subtitle="Pull down to load market data"
          onSearchPress={toggleSearch}
          isSearchVisible={false}
          searchQuery=""
          onSearchChange={() => { }}
        />
        {renderTabBar()}
        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Pull down to refresh and load market data
              </Text>
              <TouchableOpacity 
                style={[styles.loadButton, { backgroundColor: theme.colors.primary }]} 
                onPress={onRefresh}
              >
                <Text style={styles.loadButtonText}>Load Market Data</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SearchHeader
        title={activeTab === 'market' ? 'Crypto Market' : 'Watchlist'}
        subtitle={activeTab === 'market' ? 
          `Top ${filteredAndSortedCoins.length} cryptocurrencies` : 
          `${filteredAndSortedCoins.length} coins in watchlist`
        }
        onSearchPress={toggleSearch}
        isSearchVisible={isSearchVisible}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {renderTabBar()}

      <SortOptions
        options={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      <FlatList
        data={filteredAndSortedCoins}
        keyExtractor={(item, index) => `${item.id}-${index}-${activeTab}`}
        renderItem={renderCoinItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMoreCoins}
        onEndReachedThreshold={0.1}
        ListFooterComponent={filteredAndSortedCoins.length > 0 ? renderFooter : null}
        ListEmptyComponent={
          activeTab === 'watchlist' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No coins in your watchlist yet
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                Add coins to your watchlist by tapping the heart icon on any coin detail page
              </Text>
              <TouchableOpacity 
                style={[styles.loadButton, { backgroundColor: theme.colors.primary }]} 
                onPress={() => handleTabChange('market')}
              >
                <Text style={styles.loadButtonText}>Explore Market</Text>
              </TouchableOpacity>
            </View>
          ) : searchQuery.trim() ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No cryptocurrencies found for "{searchQuery}"
              </Text>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: theme.colors.textSecondary }]}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginHorizontal: 4,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  footerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadMoreButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  loadButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Watchlist item styles
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    width: 30,
    marginRight: 8,
  },
  rank: {
    fontSize: 12,
    fontWeight: '500',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  coinSymbol: {
    fontSize: 13,
    fontWeight: '500',
  },
  coinRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 2,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
  },
});