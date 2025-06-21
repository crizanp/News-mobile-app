// FavoritesScreen.tsx - Dedicated Favorites/Watchlist Screen
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import React, { useCallback, useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchHeader from '../components/SearchHeader';
import SkeletonLoader from '../components/SkeletonLoader';
import SortOptions from '../components/SortOptions';
import { cryptoApi } from '../services/cryptoApi';

const sortOptions = [
  { id: 'market_cap', name: 'Market Cap', icon: 'stats-chart' },
  { id: 'price', name: 'Price', icon: 'pricetag' },
  { id: 'change_24h', name: '24h Change', icon: 'trending-up' },
  { id: 'name', name: 'Name', icon: 'text' },
  { id: 'date_added', name: 'Date Added', icon: 'time' },
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
  total_volume: number;
  dateAdded?: number;
}

export default function FavoritesScreen() {
  const [favoriteCoins, setFavoriteCoins] = useState<FavoriteCoin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('market_cap');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const FAVORITES_KEY = 'crypto_favorites';
  const FAVORITES_METADATA_KEY = 'crypto_favorites_metadata';

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Get favorite coin IDs and metadata from AsyncStorage
      const [favoritesString, metadataString] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(FAVORITES_METADATA_KEY)
      ]);
      
      const favoriteIds = favoritesString ? JSON.parse(favoritesString) : [];
      const metadata = metadataString ? JSON.parse(metadataString) : {};
      
      if (favoriteIds.length === 0) {
        setFavoriteCoins([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch all coins to find the favorites
      const allCoins = await cryptoApi.getTopCoins(250, 0);
      
      // Filter coins that are in favorites
      const favorites = allCoins.filter(coin => favoriteIds.includes(coin.id));
      
      // Transform to FavoriteCoin format with metadata
      const favoriteCoinData: FavoriteCoin[] = favorites.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        dateAdded: metadata[coin.id]?.dateAdded || Date.now(),
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
        'Failed to load favorites. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFavorite = async (coinId: string) => {
    try {
      const [favoritesString, metadataString] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(FAVORITES_METADATA_KEY)
      ]);
      
      let favorites = favoritesString ? JSON.parse(favoritesString) : [];
      let metadata = metadataString ? JSON.parse(metadataString) : {};
      
      // Remove the coin from favorites and metadata
      favorites = favorites.filter((id: string) => id !== coinId);
      delete metadata[coinId];
      
      await Promise.all([
        AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)),
        AsyncStorage.setItem(FAVORITES_METADATA_KEY, JSON.stringify(metadata))
      ]);
      
      // Update local state with animation
      const updatedCoins = favoriteCoins.filter(coin => coin.id !== coinId);
      setFavoriteCoins(updatedCoins);
      
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const handleRemoveFavorite = (coin: FavoriteCoin) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove ${coin.name} from your favorites?`,
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

  const clearAllFavorites = async () => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all coins from your favorites? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all([
                AsyncStorage.removeItem(FAVORITES_KEY),
                AsyncStorage.removeItem(FAVORITES_METADATA_KEY)
              ]);
              setFavoriteCoins([]);
            } catch (error) {
              console.error('Error clearing favorites:', error);
              Alert.alert('Error', 'Failed to clear favorites');
            }
          }
        }
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, []);

  const handleCoinPress = (coin: FavoriteCoin) => {
    router.push({
      pathname: '/coin-detail',
      params: { coinId: coin.id, symbol: coin.symbol }
    });
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
    }
  };

  // Filter and sort coins based on search query and selected sort
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = [...favoriteCoins];

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
    const sorted = filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'market_cap':
          return b.market_cap - a.market_cap;
        case 'price':
          return b.current_price - a.current_price;
        case 'change_24h':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date_added':
          return (b.dateAdded || 0) - (a.dateAdded || 0);
        default:
          return b.market_cap - a.market_cap;
      }
    });

    return sorted;
  }, [favoriteCoins, searchQuery, selectedSort]);

  // Load favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatDateAdded = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderFavoriteItem = ({ item, index }: { item: FavoriteCoin; index: number }) => {
    const priceChange = formatPercentage(item.price_change_percentage_24h);

    return (
      <Animated.View
        style={[
          styles.coinItem,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.coinContent}
          onPress={() => handleCoinPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.coinLeft}>
            <View style={styles.rankContainer}>
              <Text style={styles.rank}>#{item.market_cap_rank}</Text>
            </View>
            
            <Image
              source={{ uri: item.image }}
              style={styles.coinIcon}
            />
            
            <View style={styles.coinInfo}>
              <Text style={styles.coinName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.coinSubInfo}>
                <Text style={styles.coinSymbol}>
                  {item.symbol.toUpperCase()}
                </Text>
                {item.dateAdded && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.dateAdded}>
                      {formatDateAdded(item.dateAdded)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.coinRight}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatPrice(item.current_price)}
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
              <Text style={styles.marketCap}>
                {formatMarketCap(item.market_cap)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={20} color="#FF4444" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerStats}>
      <View style={styles.statItem}>
        <Ionicons name="heart" size={20} color="#FF4444" />
        <Text style={styles.statValue}>{favoriteCoins.length}</Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </View>
      
      <View style={styles.statItem}>
        <Ionicons name="trending-up" size={20} color="#00C851" />
        <Text style={styles.statValue}>
          {favoriteCoins.filter(coin => coin.price_change_percentage_24h > 0).length}
        </Text>
        <Text style={styles.statLabel}>Gaining</Text>
      </View>
      
      <View style={styles.statItem}>
        <Ionicons name="trending-down" size={20} color="#FF4444" />
        <Text style={styles.statValue}>
          {favoriteCoins.filter(coin => coin.price_change_percentage_24h < 0).length}
        </Text>
        <Text style={styles.statLabel}>Losing</Text>
      </View>
    </View>
  );

  // Show skeleton loader during initial load
  if (loading && !refreshing) {
    return <SkeletonLoader type="market" count={8} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <SearchHeader
        title="My Favorites"
        subtitle={`${filteredAndSortedCoins.length} coins in your watchlist`}
        onSearchPress={toggleSearch}
        isSearchVisible={isSearchVisible}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <SortOptions
        options={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      <FlatList
        data={filteredAndSortedCoins}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderFavoriteItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={favoriteCoins.length > 0 ? renderHeader : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              Start building your watchlist by adding coins to your favorites
            </Text>
            <Text style={styles.emptySubText}>
              Tap the heart icon on any coin detail page to add it here
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton} 
              onPress={() => router.push('/market')}
            >
              <Ionicons name="trending-up" size={16} color="#FFF" />
              <Text style={styles.exploreButtonText}>Explore Market</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          favoriteCoins.length > 2 ? (
            <View style={styles.footerContainer}>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={clearAllFavorites}
              >
                <Ionicons name="trash-outline" size={16} color="#FF4444" />
                <Text style={styles.clearAllButtonText}>Clear All Favorites</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  coinItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  coinContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    color: '#666',
    fontWeight: '500',
  },
  coinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  coinSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  dateAdded: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  coinRight: {
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  change: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 2,
  },
  marketCap: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  clearAllButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});