// components/CoinItem.tsx - Compact Enhanced Version
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Coin } from '../types';

interface CoinItemProps {
  item: Coin;
  onPress?: () => void;
}

const CoinItem: React.FC<CoinItemProps> = ({ item, onPress }) => {
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

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toLocaleString()}`;
    }
  };

  const Content = (
    <>
      <View style={styles.leftSection}>
        <View style={styles.rankContainer}>
          <Text style={styles.rank}>{item.market_cap_rank}</Text>
        </View>
        
        <View style={styles.coinImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.coinImage}
            defaultSource={require('../assets/images/favicon.png')}
          />
        </View>
        
        <View style={styles.coinInfo}>
          <Text style={styles.coinName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.coinSymbol}>{item.symbol?.toUpperCase()}</Text>
          <View style={styles.marketCapRow}>
            <Text style={styles.marketCapLabel}>MCap:</Text>
            <Text style={styles.marketCap}>{formatMarketCap(item.market_cap)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.price}>{formatPrice(item.current_price)}</Text>
        
        <View style={[
          styles.percentageContainer,
          { backgroundColor: getPercentageColor(item.price_change_percentage_24h) + '10' }
        ]}>
          <Ionicons
            name={item.price_change_percentage_24h > 0 ? "trending-up" : "trending-down"}
            size={10}
            color={getPercentageColor(item.price_change_percentage_24h)}
            style={styles.trendIcon}
          />
          <Text
            style={[
              styles.percentage,
              { color: getPercentageColor(item.price_change_percentage_24h) },
            ]}
          >
            {formatPercentage(item.price_change_percentage_24h)}
          </Text>
        </View>
        
        <Text style={styles.volume}>Vol: {formatVolume(item.total_volume)}</Text>
      </View>

      {onPress && (
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {Content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{Content}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 3,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  rank: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  coinImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  coinImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  coinSymbol: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  marketCapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketCapLabel: {
    fontSize: 10,
    color: '#999',
    marginRight: 3,
  },
  marketCap: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  trendIcon: {
    marginRight: 2,
  },
  percentage: {
    fontSize: 11,
    fontWeight: '600',
  },
  volume: {
    fontSize: 10,
    color: '#999',
    fontWeight: '400',
  },
  chevronContainer: {
    marginLeft: 8,
    padding: 2,
  },
});

export default CoinItem;