// app/(tabs)/app-tutorial.tsx - Complete App Tutorial Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AppTutorialScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Crypto Market",
      description: "Your comprehensive crypto tracking and news app. Let's walk through the main features and how to use them effectively.",
      feature: "Getting Started",
      tips: [
        "Navigate using the bottom tab bar",
        "Dark mode is available in Settings",
        "All data syncs across your devices"
      ]
    },
    {
      title: "Market Overview",
      description: "Track top 100 cryptocurrencies with real-time data. Switch between Market Cap, Price, 24h Change, and Volume views.",
      feature: "Crypto Market Tab",
      tips: [
        "Tap on any crypto to view detailed information",
        "Use the search icon to find specific cryptocurrencies",
        "Filter by Market Cap, Price, or Volume",
        "Green indicates price increase, red indicates decrease"
      ]
    },
    {
      title: "Your Watchlist",
      description: "Save your favorite cryptocurrencies for quick access. Add coins to your watchlist by tapping the heart icon.",
      feature: "Watchlist Tab",
      tips: [
        "Swipe right to access your watchlist",
        "Add coins by tapping the heart icon on any crypto",
        "Remove coins by tapping the heart again",
        "Your watchlist syncs across devices"
      ]
    },
    {
      title: "Market News",
      description: "Stay updated with the latest crypto news from multiple sources. Filter by All Markets, Bitcoin, or Ethereum.",
      feature: "Market News",
      tips: [
        "Browse featured articles at the top",
        "Filter news by specific cryptocurrencies",
        "Tap any article to read the full story",
        "Save articles for later reading"
      ]
    },
    {
      title: "Saved Articles",
      description: "Access your saved articles anytime. Export your saved articles or clear them when needed.",
      feature: "Saved Articles",
      tips: [
        "Articles are saved locally on your device",
        "Use Export to share your saved articles",
        "Clear All removes all saved articles",
        "Swipe left on articles to delete individually"
      ]
    },
    {
      title: "Settings & Preferences",
      description: "Customize your app experience with notifications, dark mode, currency settings, and language preferences.",
      feature: "Settings",
      tips: [
        "Enable push notifications for market alerts",
        "Switch between light and dark themes",
        "Change your default currency (USD, EUR, etc.)",
        "Select your preferred language"
      ]
    },
    {
      title: "Support & Help",
      description: "Access help center, contact support, provide feedback, and rate the app from the settings menu.",
      feature: "Support Features",
      tips: [
        "Help Center has FAQs and guides",
        "Contact Support for personalized help",
        "Send Feedback to improve the app",
        "Rate the app in your app store"
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];

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
    scrollContainer: {
      flex: 1,
    },
    progressContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      backgroundColor: theme.colors.surface,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginBottom: 10,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
      width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
    },
    stepIndicator: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    contentContainer: {
      padding: 20,
      backgroundColor: theme.colors.surface,
    },
    featureTag: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      alignSelf: 'flex-start',
      marginBottom: 15,
    },
    featureTagText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    tutorialTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
    },
    tutorialDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: 25,
    },
    tipsContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 15,
      marginBottom: 25,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 10,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    tipBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginTop: 7,
      marginRight: 10,
    },
    tipText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      minWidth: 100,
    },
    prevButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
    },
    disabledButton: {
      opacity: 0.5,
    },
    navButtonText: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: 5,
    },
    prevButtonText: {
      color: theme.colors.text,
    },
    nextButtonText: {
      color: 'white',
    },
    skipButton: {
      padding: 10,
    },
    skipButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>App Tutorial</Text>
        <TouchableOpacity style={dynamicStyles.skipButton} onPress={() => router.back()}>
          <Text style={dynamicStyles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        {/* Progress */}
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View style={dynamicStyles.progressFill} />
          </View>
          <Text style={dynamicStyles.stepIndicator}>
            Step {currentStep + 1} of {tutorialSteps.length}
          </Text>
        </View>

        {/* Content */}
        <View style={dynamicStyles.contentContainer}>
          <View style={dynamicStyles.featureTag}>
            <Text style={dynamicStyles.featureTagText}>{currentTutorial.feature}</Text>
          </View>
          
          <Text style={dynamicStyles.tutorialTitle}>{currentTutorial.title}</Text>
          <Text style={dynamicStyles.tutorialDescription}>{currentTutorial.description}</Text>

          <View style={dynamicStyles.tipsContainer}>
            <Text style={dynamicStyles.tipsTitle}>💡 Tips & Tricks</Text>
            {currentTutorial.tips.map((tip, index) => (
              <View key={index} style={dynamicStyles.tipItem}>
                <View style={dynamicStyles.tipBullet} />
                <Text style={dynamicStyles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={dynamicStyles.navigationContainer}>
        <TouchableOpacity
          style={[
            dynamicStyles.navButton,
            dynamicStyles.prevButton,
            currentStep === 0 && dynamicStyles.disabledButton
          ]}
          onPress={prevStep}
          disabled={currentStep === 0}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          <Text style={[dynamicStyles.navButtonText, dynamicStyles.prevButtonText]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            dynamicStyles.navButton,
            dynamicStyles.nextButton,
            currentStep === tutorialSteps.length - 1 && dynamicStyles.disabledButton
          ]}
          onPress={currentStep === tutorialSteps.length - 1 ? () => router.back() : nextStep}
        >
          <Text style={[dynamicStyles.navButtonText, dynamicStyles.nextButtonText]}>
            {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    width: 40,
  },
});