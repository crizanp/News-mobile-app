// app/(tabs)/portfolio.tsx - Portfolio Page
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const portfolioData = {
  totalValue: 25420.5,
  change24h: 1250.3,
  changePercent: 5.17,
  holdings: [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, value: 21500, change: 3.2 },
    { symbol: 'ETH', name: 'Ethereum', amount: 8.2, value: 3200, change: -1.5 },
    { symbol: 'ADA', name: 'Cardano', amount: 1500, value: 720, change: 8.3 },
  ],
};

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20000, 22000, 19000, 23000, 24000, 25420],
      strokeWidth: 3,
    },
  ],
};

export default function PortfolioScreen() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.totalValueLabel}>Total Portfolio Value</Text>
        <Text style={styles.totalValue}>{formatCurrency(portfolioData.totalValue)}</Text>
        <View style={styles.changeContainer}>
          <Ionicons
            name={portfolioData.change24h > 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={portfolioData.change24h > 0 ? '#4CAF50' : '#F44336'}
          />
          <Text
            style={[
              styles.changeText,
              { color: portfolioData.change24h > 0 ? '#4CAF50' : '#F44336' },
            ]}
          >
            {formatCurrency(portfolioData.change24h)} (
            {formatPercentage(portfolioData.changePercent)})
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Portfolio Performance</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#FFF',
            backgroundGradientFrom: '#FFF',
            backgroundGradientTo: '#FFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Holdings */}
      <View style={styles.holdingsCard}>
        <Text style={styles.sectionTitle}>Your Holdings</Text>
        {portfolioData.holdings.map((holding, index) => (
          <View key={index} style={styles.holdingItem}>
            <View style={styles.holdingLeft}>
              <View style={styles.coinIcon}>
                <Text style={styles.coinSymbol}>{holding.symbol}</Text>
              </View>
              <View>
                <Text style={styles.holdingName}>{holding.name}</Text>
                <Text style={styles.holdingAmount}>
                  {holding.amount} {holding.symbol}
                </Text>
              </View>
            </View>
            <View style={styles.holdingRight}>
              <Text style={styles.holdingValue}>{formatCurrency(holding.value)}</Text>
              <Text
                style={[
                  styles.holdingChange,
                  { color: holding.change > 0 ? '#4CAF50' : '#F44336' },
                ]}
              >
                {formatPercentage(holding.change)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ✅ StyleSheet (renamed to 'styles')
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  totalValueLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  holdingsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinSymbol: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  holdingAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  holdingChange: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
});
