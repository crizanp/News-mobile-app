// app/coin-detail.tsx - Detailed Coin Information Screen
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { cryptoApi } from '../services/cryptoApi';
import { Coin } from '../types';

const screenWidth = Dimensions.get('window').width;

interface CoinDetailData extends Coin {
  description?: string;
  links?: {
    homepage?: string[];
    blockchain_site?: string[];
    twitter_screen_name?: string;
    telegram_channel_identifier?: string;
  };
}

export default function CoinDetailScreen() {
  const { coinId, symbol } = useLocalSearchParams<{ coinId: string; symbol: string }>();
  const router = useRouter();
  const [coinData, setCoinData] = useState<CoinDetailData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  const periods = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
  ];

  const fetchCoinData = async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      const [details, historical] = await Promise.all([
        cryptoApi.getCoinDetails(symbol.toUpperCase()),
        cryptoApi.getHistoricalData(symbol.toUpperCase(), parseInt(selectedPeriod))
      ]);

      // Create a mock detailed coin object (you might want to enhance your API)
      const detailedCoin: CoinDetailData = {
        id: coinId || symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        name: details.FROMSYMBOL || symbol.toUpperCase(),
        image: `https://www.cryptocompare.com/media/37746251/btc.png`, // You'd get this from API
        current_price: details.PRICE || 0,
        market_cap: details.MKTCAP || 0,
        market_cap_rank: 1,
        total_volume: details.TOTALVOLUME24H || 0,
        high_24h: details.HIGH24HOUR || 0,
        low_24h: details.LOW24HOUR || 0,
        price_change_24h: details.CHANGE24HOUR || 0,
        price_change_percentage_24h: details.CHANGEPCT24HOUR || 0,
        market_cap_change_24h: details.MKTCAPCHANGE24HOUR || 0,
        market_cap_change_percentage_24h: details.MKTCAPCHANGEPCT24HOUR || 0,
        circulating_supply: details.SUPPLY || 0,
        total_supply: details.TOTALTOPLYTOSUPPLY || 0,
        ath: details.HIGHDAY || 0,
        ath_change_percentage: 0,
        ath_date: new Date().toISOString(),
        atl: details.LOWDAY || 0,
        atl_change_percentage: 0,
        atl_date: new Date().toISOString(),
        roi: null,
        last_updated: new Date().toISOString(),
        fully_diluted_valuation: details.MKTCAP || 0,
      };

      setCoinData(detailedCoin);
      setHistoricalData(historical);
    } catch (error) {
      console.error('Error fetching coin data:', error);
      Alert.alert('Error', 'Failed to fetch coin details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoinData();
  };

  useEffect(() => {
    fetchCoinData();
  }, [selectedPeriod]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number | null): string => {
    if (percentage === null || percentage === undefined) return 'N/A';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getPercentageColor = (percentage: number | null): string => {
    if (percentage === null || percentage === undefined) return '#666';
    return percentage > 0 ? '#10B981' : '#EF4444';
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num.toLocaleString()}`;
  };

  const formatSupply = (supply: number): string => {
    if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`;
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toLocaleString();
  };

  const getChartData = () => {
    if (!historicalData || historicalData.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }]
      };
    }

    const labels = historicalData.slice(-7).map((_, index) => {
      if (selectedPeriod === '1') return `${index * 4}h`;
      if (selectedPeriod === '7') return `${index + 1}d`;
      if (selectedPeriod === '30') return `${Math.floor(index * 4.3)}d`;
      return `${Math.floor(index * 13)}d`;
    });

    const data = historicalData.slice(-7).map(item => item.close || item.high || 0);

    return {
      labels,
      datasets: [{
        data,
        strokeWidth: 3,
        color: (opacity = 1) => coinData && coinData.price_change_percentage_24h > 0 
          ? `rgba(16, 185, 129, ${opacity})` 
          : `rgba(239, 68, 68, ${opacity})`
      }]
    };
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading coin details...</Text>
      </View>
    );
  }

  if (!coinData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Failed to load coin details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCoinData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.coinHeader}>
          <Image source={{ uri: coinData.image }} style={styles.coinImage} />
          <View style={styles.coinTitleContainer}>
            <Text style={styles.coinName}>{coinData.name}</Text>
            <Text style={styles.coinSymbol}>{coinData.symbol}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.currentPrice}>{formatPrice(coinData.current_price)}</Text>
        <View style={[
          styles.priceChangeContainer,
          { backgroundColor: getPercentageColor(coinData.price_change_percentage_24h) + '15' }
        ]}>
          <Ionicons
            name={coinData.price_change_percentage_24h > 0 ? "trending-up" : "trending-down"}
            size={18}
            color={getPercentageColor(coinData.price_change_percentage_24h)}
          />
          <Text style={[
            styles.priceChange,
            { color: getPercentageColor(coinData.price_change_percentage_24h) }
          ]}>
            {formatPercentage(coinData.price_change_percentage_24h)}
          </Text>
          <Text style={[
            styles.priceChangeAmount,
            { color: getPercentageColor(coinData.price_change_percentage_24h) }
          ]}>
            ({formatPrice(coinData.price_change_24h)})
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.value && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => coinData.price_change_percentage_24h > 0 
                ? `rgba(16, 185, 129, ${opacity})` 
                : `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Market Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>{formatLargeNumber(coinData.market_cap)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>24h Volume</Text>
          <Text style={styles.statValue}>{formatLargeNumber(coinData.total_volume)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>24h High</Text>
          <Text style={styles.statValue}>{formatPrice(coinData.high_24h)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>24h Low</Text>
          <Text style={styles.statValue}>{formatPrice(coinData.low_24h)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Circulating Supply</Text>
          <Text style={styles.statValue}>{formatSupply(coinData.circulating_supply)} {coinData.symbol}</Text>
        </View>
        
        {coinData.total_supply && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Supply</Text>
            <Text style={styles.statValue}>{formatSupply(coinData.total_supply)} {coinData.symbol}</Text>
          </View>
        )}
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>All-Time High</Text>
          <Text style={styles.statValue}>{formatPrice(coinData.ath)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>All-Time Low</Text>
          <Text style={styles.statValue}>{formatPrice(coinData.atl)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={[styles.actionButton, styles.buyButton]}>
          <Ionicons name="trending-up" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Buy {coinData.symbol}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.sellButton]}>
          <Ionicons name="trending-down" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Sell {coinData.symbol}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  coinImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coinTitleContainer: {
    alignItems: 'center',
  },
  coinName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  coinSymbol: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
    marginRight: 8,
  },
  priceChangeAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingVertical: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  sellButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});