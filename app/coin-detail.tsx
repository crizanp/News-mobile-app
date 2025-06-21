import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader from '../components/SkeletonLoader';
import { cryptoApi } from '../services/cryptoApi';

const { width: screenWidth } = Dimensions.get('window');
// Increased chart width to prevent clipping
const chartWidth = screenWidth - 40; // Increased from 60 to 40
const chartContainerWidth = screenWidth - 40;

// Time range options for the chart
const timeRanges = [
  { id: '1D', label: '1D', days: 1 },
  { id: '7D', label: '7D', days: 7 },
  { id: '30D', label: '30D', days: 30 },
  { id: '90D', label: '90D', days: 90 },
];

// Helper function to get chart configuration based on coin price
const getChartConfig = (coinPrice: number) => {
  // For very small numbers, use scientific notation in chart
  if (coinPrice < 0.000001) {
    return {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#f8f9fa',
      decimalPlaces: 2, // Reduced decimal places since we'll format as scientific
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '2',
        strokeWidth: '1',
        stroke: '#007AFF',
        fill: '#ffffff',
      },
      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: '#e3e3e3',
        strokeWidth: 1,
      },
    };
  }

  // Regular configuration for normal prices
  return {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8f9fa',
    decimalPlaces:
      coinPrice < 0
        ? 6
        : coinPrice > 0 && coinPrice < 1
          ? 6
          : coinPrice >= 10000
            ? 0
            : coinPrice >= 1000
              ? 1
              : coinPrice >= 100
                ? 2
                : coinPrice >= 50
                  ? 3
                  : 4,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '2',
      strokeWidth: '1',
      stroke: '#007AFF',
      fill: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e3e3e3',
      strokeWidth: 1,
    },
  };
};

// Transform chart data to use scientific notation for very small prices
const transformChartDataForSmallPrices = (chartData: any, coinPrice: number) => {
  if (coinPrice >= 0.000001) {
    return chartData; // No transformation needed for regular prices
  }

  // Transform the data points to scientific notation for display
  return {
    ...chartData,
    datasets: chartData.datasets.map((dataset: any) => ({
      ...dataset,
      data: dataset.data.map((value: number) => {
        // Convert to scientific notation factor for chart display
        // This makes the chart more readable for very small numbers
        return value * 1e6; // Multiply by 1 million to make numbers chart-friendly
      }),
    })),
  };
};

export default function CoinDetailScreen() {
  const { coinId, symbol } = useLocalSearchParams<{ coinId: string; symbol: string }>();
  const router = useRouter();

 const handleBackPress = () => {
  router.back(); // Use router.back() instead of router.push('/market')
};

  const [coinData, setCoinData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7D');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  const FAVORITES_KEY = 'crypto_favorites';

  const loadFavoriteStatus = async () => {
    try {
      const favoritesString = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites = favoritesString ? JSON.parse(favoritesString) : [];
      setIsFavorite(favorites.includes(coinId));
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favoritesString = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = favoritesString ? JSON.parse(favoritesString) : [];

      if (favorites.includes(coinId)) {
        // Remove from favorites
        favorites = favorites.filter((id: string) => id !== coinId);
        setIsFavorite(false);
      } else {
        // Add to favorites
        favorites.push(coinId);
        setIsFavorite(true);
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

      // Show feedback to user
      Alert.alert(
        'Success',
        isFavorite ? 'Removed from favorites' : 'Added to favorites',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const fetchCoinData = async () => {
    try {
      setLoading(true);

      // Fetch coin details and historical data simultaneously
      const [details, historical] = await Promise.all([
        cryptoApi.getCoinDetails(symbol || ''),
        cryptoApi.getHistoricalData(symbol || '', getSelectedDays()),
      ]);

      setCoinData(details);
      setHistoricalData(historical || []);

      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (error) {
      console.error('Error fetching coin data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch coin data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSelectedDays = () => {
    return timeRanges.find(range => range.id === selectedTimeRange)?.days || 7;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCoinData();
  }, []);

  const onTimeRangeChange = async (rangeId: string) => {
    setSelectedTimeRange(rangeId);
    setChartLoading(true);
    try {
      const days = timeRanges.find(range => range.id === rangeId)?.days || 7;
      const historical = await cryptoApi.getHistoricalData(symbol || '', days);
      setHistoricalData(historical || []);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchCoinData();
      loadFavoriteStatus();
    }
  }, [symbol]);

  // Improved chart data preparation
  const getChartConfiguration = () => {
    const days = getSelectedDays();

    // More data points for better resolution
    let maxPoints, skipPoints;

    switch (days) {
      case 1:
        maxPoints = 24; // Show every hour
        skipPoints = Math.max(1, Math.floor(historicalData.length / 24));
        break;
      case 7:
        maxPoints = 28; // Show every 6 hours
        skipPoints = Math.max(1, Math.floor(historicalData.length / 28));
        break;
      case 30:
        maxPoints = 30; // Show daily
        skipPoints = Math.max(1, Math.floor(historicalData.length / 30));
        break;
      case 90:
        maxPoints = 30; // Show every 3 days
        skipPoints = Math.max(1, Math.floor(historicalData.length / 30));
        break;
      default:
        maxPoints = 20;
        skipPoints = Math.max(1, Math.floor(historicalData.length / 20));
    }

    return { maxPoints, skipPoints };
  };

  const formatChartLabel = (timestamp: number, days: number) => {
    const date = new Date(timestamp * 1000);

    switch (days) {
      case 1:
        // Show hours for 1 day view
        return date.getHours().toString().padStart(2, '0') + ':00';
      case 7:
        // Show day of week for 7 days
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      case 30:
        // Show month/day for 30 days
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case 90:
        // Show abbreviated month/day for 90 days
        return `${date.getMonth() + 1}/${date.getDate()}`;
      default:
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const { maxPoints, skipPoints } = getChartConfiguration();
  const days = getSelectedDays();

  // Filter and format data for better display
  const filteredData = historicalData
    .filter((_, index) => index % skipPoints === 0)
    .slice(-maxPoints);

  const chartData = {
    labels: filteredData.map((item) => formatChartLabel(item.time, days)),
    datasets: [
      {
        data: filteredData.map(item => item.close || 0),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2.5,
      },
    ],
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else if (price >= 0.000001) {
      // Use scientific notation for very small numbers (6 decimal places or more)
      return `$${price.toExponential(2)}`;
    } else if (price > 0) {
      // For extremely small numbers, use scientific notation with more precision
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

  // Show skeleton loader during initial load
  if (loading && !refreshing && !coinData) {
    return <SkeletonLoader type="coinDetail" />;
  }

  if (!coinData && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coin Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Failed to load coin data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCoinData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const priceChange = formatPercentage(coinData?.CHANGEPCT24HOUR || 0);
  const currentPrice = coinData?.PRICE || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{symbol?.toUpperCase()}</Text>
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive
          ]}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF4444" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceHeader}>
              <Text style={styles.coinSymbol}>{symbol?.toUpperCase()}</Text>
              <View style={styles.priceChangeContainer}>
                <Text style={[styles.priceChange, { color: priceChange.color }]}>
                  {priceChange.value}
                </Text>
                <Ionicons
                  name={priceChange.color === '#00C851' ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={priceChange.color}
                />
              </View>
            </View>
            <Text style={styles.currentPrice}>
              {formatPrice(currentPrice)}
            </Text>
            <Text style={styles.priceInBtc}>
              ≈ {(currentPrice / (currentPrice || 1) * 0.000023).toFixed(8)} BTC
            </Text>
          </View>

          {/* Chart Section */}
          <View style={styles.chartSection}>
            <View style={styles.timeRangeContainer}>
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.timeRangeButton,
                    selectedTimeRange === range.id && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => onTimeRangeChange(range.id)}
                  disabled={chartLoading}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      selectedTimeRange === range.id && styles.timeRangeTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Show chart skeleton loader when chart is loading */}
            {chartLoading ? (
              <View style={styles.chartSkeletonContainer}>
                <SkeletonLoader type="chart" />
              </View>
            ) : (
              historicalData.length > 0 && (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={transformChartDataForSmallPrices(chartData, currentPrice)}
                    width={chartWidth}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      ...getChartConfig(currentPrice),
                      formatYLabel: (value) => {
                        // Convert back from transformed value if needed
                        const actualValue = currentPrice < 0.000001 ? parseFloat(value) / 1e6 : parseFloat(value);

                        if (actualValue >= 1000) {
                          return `$${(actualValue / 1000).toFixed(1)}K`;
                        } else if (actualValue >= 1) {
                          return `$${actualValue.toFixed(2)}`;
                        } else if (actualValue >= 0.01) {
                          return `$${actualValue.toFixed(4)}`;
                        } else if (actualValue >= 0.000001) {
                          return `$${actualValue.toExponential(1)}`;
                        } else if (actualValue > 0) {
                          return `$${actualValue.toExponential(1)}`;
                        }
                        return '$0';
                      }
                    }}
                    bezier
                    style={styles.chart}
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    withInnerLines={true}
                    withOuterLines={false}
                    withShadow={false}
                    fromZero={false}
                    yLabelsOffset={10}
                    xLabelsOffset={-5}
                  />
                </View>
              )
            )}
          </View>

          {/* Statistics Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Market Statistics</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Ionicons name="trending-up" size={20} color="#007AFF" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Market Cap</Text>
                    <Text style={styles.statValue}>
                      {formatMarketCap(coinData?.MKTCAP || 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="bar-chart" size={20} color="#28A745" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>24h Volume</Text>
                    <Text style={styles.statValue}>
                      {formatMarketCap(coinData?.TOTALVOLUME24H || 0)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Ionicons name="arrow-up" size={20} color="#00C851" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>24h High</Text>
                    <Text style={styles.statValue}>
                      {formatPrice(coinData?.HIGH24HOUR || 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="arrow-down" size={20} color="#FF4444" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>24h Low</Text>
                    <Text style={styles.statValue}>
                      {formatPrice(coinData?.LOW24HOUR || 0)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Ionicons name="layers" size={20} color="#6F42C1" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Circulating Supply</Text>
                    <Text style={styles.statValue}>
                      {(coinData?.SUPPLY || 0).toLocaleString()} {symbol?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={20} color="#FFC107" />
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>All Time High</Text>
                    <Text style={styles.statValue}>
                      {formatPrice(coinData?.HIGHDAY || 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Additional Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Price Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>24h Change</Text>
                <Text style={[styles.infoValue, { color: priceChange.color }]}>
                  {formatPrice(coinData?.CHANGE24HOUR || 0)} ({priceChange.value})
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Market Cap Change</Text>
                <Text style={[styles.infoValue, { color: priceChange.color }]}>
                  {formatPercentage(coinData?.MKTCAPCHANGEPCT24HOUR || 0).value}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>
                  {new Date((coinData?.LASTUPDATE || 0) * 1000).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFE5E5',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  priceSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
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
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coinSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  priceInBtc: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  chartSkeletonContainer: {
    marginTop: 8,
    height: 220,
  },
  chartWrapper: {
    marginTop: 8,
    alignItems: 'center',
    // Added padding to prevent clipping
    paddingHorizontal: 5,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    // Added margin to prevent edge clipping
    marginHorizontal: -10,
  },
  statsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
 infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});