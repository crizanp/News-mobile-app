// components/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface SkeletonLoaderProps {
  type?: 'market' | 'coinDetail' | 'list' | 'chart';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'market', count = 10 }) => {
  const { theme, isDark } = useTheme();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const shimmerStyle = {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  };

  // Dynamic colors based on theme
  const skeletonBaseColor = isDark ? '#2A2A2A' : '#E0E0E0';
  const skeletonHighlightColor = isDark ? '#3A3A3A' : '#F0F0F0';

  const SkeletonBox = ({ width, height, style = {} }: { width: number | string; height: number; style?: any }) => (
    <Animated.View
      style={[
        {
          backgroundColor: skeletonBaseColor,
          borderRadius: 8,
          width,
          height,
        },
        shimmerStyle,
        style,
      ]}
    />
  );

  const renderMarketSkeleton = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.headerSkeleton, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border,
      }]}>
        {/* <SkeletonBox width={150} height={24} />
        <SkeletonBox width={100} height={16} style={{ marginTop: 8 }} /> */}
      </View>

      {/* Sort Options Skeleton */}
      <View style={[styles.sortSkeleton, { backgroundColor: theme.colors.surface }]}>
        {[1, 2, 3, 4].map((item) => (
          <SkeletonBox key={item} width={70} height={32} style={{ marginHorizontal: 4 }} />
        ))}
      </View>

      {/* Coin List Skeleton */}
      <View style={styles.listContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={[styles.coinItemSkeleton, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: isDark ? '#000' : '#000',
          }]}>
            <View style={styles.coinLeftSection}>
              <SkeletonBox width={40} height={40} style={styles.coinIcon} />
              <View style={styles.coinInfo}>
                <SkeletonBox width={80} height={16} />
                <SkeletonBox width={50} height={14} style={{ marginTop: 4 }} />
              </View>
            </View>
            <View style={styles.coinRightSection}>
              <SkeletonBox width={60} height={16} />
              <SkeletonBox width={40} height={14} style={{ marginTop: 4 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCoinDetailSkeleton = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Skeleton */}
      <View style={[styles.detailHeaderSkeleton, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border,
      }]}>
        <SkeletonBox width={24} height={24} style={styles.backButton} />
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={24} height={24} style={styles.favoriteButton} />
      </View>

      {/* Price Section Skeleton */}
      <View style={[styles.priceSectionSkeleton, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }]}>
        <View style={styles.priceHeaderSkeleton}>
          <SkeletonBox width={60} height={24} />
          <SkeletonBox width={80} height={16} />
        </View>
        <SkeletonBox width={150} height={36} style={{ marginVertical: 8 }} />
        <SkeletonBox width={120} height={14} />
      </View>

      {/* Chart Section Skeleton */}
      <View style={[styles.chartSectionSkeleton, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }]}>
        {/* Time Range Buttons */}
        <View style={[styles.timeRangeSkeleton, { 
          backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA',
        }]}>
          {[1, 2, 3, 4].map((item) => (
            <SkeletonBox key={item} width={40} height={32} style={{ marginHorizontal: 4 }} />
          ))}
        </View>
        {/* Chart Area */}
        <SkeletonBox width={screenWidth - 80} height={220} style={styles.chartSkeleton} />
      </View>

      {/* Stats Section Skeleton */}
      <View style={styles.statsSectionSkeleton}>
        <SkeletonBox width={140} height={20} style={{ marginBottom: 16 }} />
        <View style={[styles.statsGridSkeleton, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.statItemSkeleton}>
              <SkeletonBox width={20} height={20} style={styles.statIcon} />
              <View style={styles.statContent}>
                <SkeletonBox width={70} height={12} />
                <SkeletonBox width={50} height={14} style={{ marginTop: 4 }} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Info Section Skeleton */}
      <View style={styles.infoSectionSkeleton}>
        <SkeletonBox width={120} height={20} style={{ marginBottom: 16 }} />
        <View style={[styles.infoCardSkeleton, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }]}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={[styles.infoRowSkeleton, { 
              borderBottomColor: theme.colors.border,
            }]}>
              <SkeletonBox width={100} height={16} />
              <SkeletonBox width={80} height={16} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderListSkeleton = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItemSkeleton, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: isDark ? '#000' : '#000',
        }]}>
          <SkeletonBox width={40} height={40} style={styles.listIcon} />
          <View style={styles.listContent}>
            <SkeletonBox width="70%" height={16} />
            <SkeletonBox width="50%" height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderChartSkeleton = () => (
    <View style={[styles.chartContainer, { 
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    }]}>
      <SkeletonBox width="100%" height={220} style={styles.chartOnly} />
    </View>
  );

  switch (type) {
    case 'market':
      return renderMarketSkeleton();
    case 'coinDetail':
      return renderCoinDetailSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'chart':
      return renderChartSkeleton();
    default:
      return renderMarketSkeleton();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  
  // Market Skeleton Styles
  headerSkeleton: {
    padding: 20,
    marginTop: 30,
    borderBottomWidth: 1,
  },
  sortSkeleton: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coinItemSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  coinLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinIcon: {
    borderRadius: 20,
    marginRight: 12,
  },
  coinInfo: {
    flex: 1,
  },
  coinRightSection: {
    alignItems: 'flex-end',
  },

  // Coin Detail Skeleton Styles
  detailHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    borderRadius: 12,
  },
  favoriteButton: {
    borderRadius: 12,
  },
  priceSectionSkeleton: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  priceHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartSectionSkeleton: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  timeRangeSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  chartSkeleton: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  statsSectionSkeleton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsGridSkeleton: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  statItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statIcon: {
    borderRadius: 10,
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  infoSectionSkeleton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoCardSkeleton: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  infoRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  // List Skeleton Styles
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  listIcon: {
    borderRadius: 20,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },

  // Chart Only Skeleton Styles
  chartContainer: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
  },
  chartOnly: {
    borderRadius: 16,
  },
});

export default SkeletonLoader;