// app/(tabs)/market.tsx - Enhanced Market Page with Search
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

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
import CoinItem from '../../components/CoinItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchHeader from '../../components/SearchHeader';
import SortOptions from '../../components/SortOptions';
import { cryptoApi } from '../../services/cryptoApi';
import { Coin } from '../../types';

const sortOptions = [
  { id: 'market_cap', name: 'Market Cap', icon: 'stats-chart' },
  { id: 'price', name: 'Price', icon: 'pricetag' },
  { id: 'change_24h', name: '24h Change', icon: 'trending-up' },
  { id: 'volume', name: 'Volume', icon: 'bar-chart' },
];

export default function MarketScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('market_cap');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const hasInitialData = useRef<boolean>(false);
  const router = useRouter();

  const fetchCoins = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await cryptoApi.getTopCoins(100);
      setCoins(data);
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
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchCoins();
  };

  // Filter and sort coins based on search query and selected sort
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = coins;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = coins.filter(
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
          return b.total_volume - a.total_volume;
        default:
          return b.market_cap - a.market_cap;
      }
    });

    return sorted;
  }, [coins, searchQuery, selectedSort]);

  // Only fetch data on first focus
  useFocusEffect(
    useCallback(() => {
      if (!hasInitialData.current) {
        fetchCoins();
      }
    }, [])
  );

  const handleCoinPress = (coin: Coin) => {
    router.push({
      pathname: '/coin-detail',
      params: { coinId: coin.id, symbol: coin.symbol }
    });
  };

  const renderCoinItem = ({ item }: { item: Coin }) => (
    <CoinItem item={item} onPress={() => handleCoinPress(item)} />
  );

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
    }
  };

  // Show loading spinner only during initial load
  if (loading && !refreshing && !hasInitialData.current) {
    return <LoadingSpinner message="Loading market data..." />;
  }

  // Show empty state when no data and not loading
  if (!hasInitialData.current && !loading) {
    return (
      <View style={styles.container}>
        <SearchHeader
          title="Crypto Market"
          subtitle="Pull down to load market data"
          onSearchPress={toggleSearch}
          isSearchVisible={false}
          searchQuery=""
          onSearchChange={() => {}}
        />
        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Pull down to refresh and load market data</Text>
              <TouchableOpacity style={styles.loadButton} onPress={onRefresh}>
                <Text style={styles.loadButtonText}>Load Market Data</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        title="Crypto Market"
        subtitle={`Top ${filteredAndSortedCoins.length} cryptocurrencies`}
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
        keyExtractor={(item) => item.id}
        renderItem={renderCoinItem}
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
        ListEmptyComponent={
          searchQuery.trim() ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                No cryptocurrencies found for "{searchQuery}"
              </Text>
              <TouchableOpacity 
                style={styles.clearButton} 
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
    backgroundColor: '#f8f9fa',
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
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  loadButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});