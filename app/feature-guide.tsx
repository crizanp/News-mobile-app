// app/(tabs)/feature-guide.tsx - Feature Guide Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function FeatureGuideScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const featureCategories = [
    {
      id: 'market',
      title: 'Market Features',
      icon: 'trending-up-outline',
      features: [
        {
          name: 'Real-time Price Tracking',
          description: 'Get live cryptocurrency prices updated every few seconds',
          details: 'Monitor price movements for top 100 cryptocurrencies with real-time data feeds. Prices are color-coded: green for increases, red for decreases.'
        },
        {
          name: 'Market Cap Sorting',
          description: 'View cryptocurrencies ranked by market capitalization',
          details: 'Market cap represents the total value of all coins in circulation. Use this to identify the most valuable cryptocurrencies in the market.'
        },
        {
          name: 'Volume Analysis',
          description: 'Track trading volume to understand market activity',
          details: 'Trading volume indicates how much of a cryptocurrency is being bought and sold. Higher volume often indicates stronger market interest.'
        },
        {
          name: 'Price Change Indicators',
          description: '24-hour price change percentages with visual indicators',
          details: 'Quickly identify winners and losers with percentage change indicators. Green arrows show gains, red arrows show losses.'
        }
      ]
    },
    {
      id: 'watchlist',
      title: 'Watchlist Management',
      icon: 'heart-outline',
      features: [
        {
          name: 'Personal Watchlist',
          description: 'Save your favorite cryptocurrencies for quick access',
          details: 'Tap the heart icon on any cryptocurrency to add it to your watchlist. Access your favorites instantly from the Watchlist tab.'
        },
        {
          name: 'Cross-device Sync',
          description: 'Your watchlist syncs across all your devices',
          details: 'Sign in to your account to automatically sync your watchlist across all devices. Changes made on one device appear on all others.'
        },
        {
          name: 'Quick Remove',
          description: 'Easily remove coins from your watchlist',
          details: 'Tap the heart icon again to remove a cryptocurrency from your watchlist, or manage all favorites from the Watchlist tab.'
        }
      ]
    },
    {
      id: 'news',
      title: 'News & Information',
      icon: 'newspaper-outline',
      features: [
        {
          name: 'Market News Feed',
          description: 'Latest cryptocurrency news from trusted sources',
          details: 'Stay informed with curated news from multiple cryptocurrency news sources. Articles are updated frequently throughout the day.'
        },
        {
          name: 'News Filtering',
          description: 'Filter news by specific cryptocurrencies',
          details: 'Use the filter buttons to view news specific to Bitcoin, Ethereum, or all markets. Focus on the information that matters to you.'
        },
        {
          name: 'Featured Articles',
          description: 'Highlighted important stories and sponsored content',
          details: 'Featured articles appear at the top of the news feed and include both editorial picks and sponsored content clearly marked.'
        },
        {
          name: 'Save Articles',
          description: 'Save interesting articles for later reading',
          details: 'Bookmark articles to read later. Access all saved articles from the Saved tab and export them for offline reading.'
        }
      ]
    },
    {
      id: 'saved',
      title: 'Content Management',
      icon: 'bookmark-outline',
      features: [
        {
          name: 'Article Storage',
          description: 'Local storage of saved articles on your device',
          details: 'Saved articles are stored locally on your device for offline access. No internet connection required to read saved content.'
        },
        {
          name: 'Export Function',
          description: 'Export saved articles to share or backup',
          details: 'Export your saved articles in various formats. Share with others or create backups of important information.'
        },
        {
          name: 'Bulk Management',
          description: 'Clear all saved articles or manage individually',
          details: 'Use Clear All to remove all saved articles at once, or swipe left on individual articles to delete them selectively.'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Customization',
      icon: 'settings-outline',
      features: [
        {
          name: 'Theme Selection',
          description: 'Switch between light and dark themes',
          details: 'Choose between light and dark themes to match your preference or device settings. The theme applies across the entire app.'
        },
        {
          name: 'Currency Settings',
          description: 'Set your preferred currency for price display',
          details: 'Change the default currency from USD to EUR, GBP, or other supported currencies. All prices will be converted automatically.'
        },
        {
          name: 'Language Options',
          description: 'Multiple language support for international users',
          details: 'Select your preferred language from the available options. The entire app interface will be translated to your chosen language.'
        },
        {
          name: 'Notification Control',
          description: 'Customize push notifications and alerts',
          details: 'Enable or disable different types of notifications including price alerts, news updates, and market summaries.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      features: [
        {
          name: 'Help Center',
          description: 'Comprehensive FAQ and troubleshooting guides',
          details: 'Access detailed answers to common questions, step-by-step guides, and troubleshooting solutions for technical issues.'
        },
        {
          name: 'Contact Support',
          description: 'Direct contact with our support team',
          details: 'Get personalized help from our support team. Submit detailed questions or issues and receive responses within 24 hours.'
        },
        {
          name: 'Feedback System',
          description: 'Share your thoughts and suggestions',
          details: 'Help us improve the app by sending feedback, feature requests, or reporting bugs. Your input shapes future updates.'
        },
        {
          name: 'App Rating',
          description: 'Rate and review the app in your app store',
          details: 'Quick access to rate the app in your device\'s app store. Your reviews help other users discover the app.'
        }
      ]
    }
  ];

  const filteredCategories = featureCategories.map(category => ({
    ...category,
    features: category.features.filter(feature =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.details.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.features.length > 0);

  const handleCategoryPress = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      backgroundColor: theme.colors.headerBackground,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerSpacer: {
      width: 40,
    },
    scrollContainer: {
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryItem: {
      marginBottom: 2,
      backgroundColor: theme.colors.surface,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    categoryIcon: {
      marginRight: 15,
    },
    categoryContent: {
      flex: 1,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    categorySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    featuresList: {
      backgroundColor: theme.colors.background,
    },
    featureItem: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    featureName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 5,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    featureDetails: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Feature Guide</Text>
        <View style={dynamicStyles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        {/* Search */}
        <View style={dynamicStyles.searchContainer}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search features..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Feature Categories */}
        {filteredCategories.map((category) => (
          <View key={category.id} style={dynamicStyles.categoryItem}>
            <TouchableOpacity
              style={dynamicStyles.categoryHeader}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
                color={theme.colors.primary}
                style={dynamicStyles.categoryIcon}
              />
              <View style={dynamicStyles.categoryContent}>
                <Text style={dynamicStyles.categoryTitle}>{category.title}</Text>
                <Text style={dynamicStyles.categorySubtitle}>
                  {category.features.length} feature{category.features.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons
                name={expandedCategory === category.id ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            
            {expandedCategory === category.id && (
              <View style={dynamicStyles.featuresList}>
                {category.features.map((feature, index) => (
                  <View key={index} style={dynamicStyles.featureItem}>
                    <Text style={dynamicStyles.featureName}>{feature.name}</Text>
                    <Text style={dynamicStyles.featureDescription}>{feature.description}</Text>
                    <Text style={dynamicStyles.featureDetails}>{feature.details}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}