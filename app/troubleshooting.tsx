// app/(tabs)/troubleshooting.tsx - Troubleshooting Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function TroubleshootingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const troubleshootingItems = [
    {
      title: "App crashes on startup",
      problem: "The app closes immediately after opening",
      solution: "1. Force close the app completely\n2. Restart your device\n3. Clear app cache in device settings\n4. Update to the latest version\n5. If problem persists, try reinstalling the app"
    },
    {
      title: "Data not syncing across devices",
      problem: "Changes made on one device don't appear on others",
      solution: "1. Check internet connection on both devices\n2. Ensure you're logged into the same account\n3. Go to Settings > Backup & Sync and toggle sync off/on\n4. Wait a few minutes for sync to complete\n5. Try manual sync by pulling down on the home screen"
    },
    {
      title: "Notifications not working",
      problem: "Not receiving budget alerts or reminders",
      solution: "1. Check device notification settings for the app\n2. Go to Settings > Notifications and enable alerts\n3. Ensure 'Do Not Disturb' is not blocking notifications\n4. Restart the app\n5. Check if battery optimization is blocking notifications"
    },
    {
      title: "Can't export data",
      problem: "Export feature fails or file doesn't generate",
      solution: "1. Check device storage space\n2. Grant file access permissions to the app\n3. Try exporting smaller date ranges\n4. Use a different export format (CSV vs PDF)\n5. Clear app cache and try again"
    },
    {
      title: "Categories not showing correctly",
      problem: "Expense categories are missing or incorrect",
      solution: "1. Go to Settings > Categories to check settings\n2. Ensure categories are enabled\n3. Try resetting categories to default\n4. Create custom categories if needed\n5. Restart the app to refresh categories"
    },
    {
      title: "Currency conversion issues",
      problem: "Wrong exchange rates or conversion errors",
      solution: "1. Check internet connection for live rates\n2. Go to Settings > Currency and update rates\n3. Verify your primary currency setting\n4. Try switching to manual rate entry\n5. Clear app cache and restart"
    },
    {
      title: "Slow performance",
      problem: "App runs slowly or freezes",
      solution: "1. Close other apps running in background\n2. Restart your device\n3. Clear app cache\n4. Archive old transactions\n5. Check available device storage\n6. Update to latest app version"
    },
    {
      title: "Market data not loading",
      problem: "Cryptocurrency prices not updating or showing",
      solution: "1. Check your internet connection\n2. Try refreshing by pulling down on the market screen\n3. Clear app cache and restart\n4. Check if you're using a VPN that might block data\n5. Verify the app has network permissions"
    },
    {
      title: "News articles not loading",
      problem: "News feed is empty or articles won't open",
      solution: "1. Ensure you have a stable internet connection\n2. Try switching between news filters (All Markets, Bitcoin, Ethereum)\n3. Clear app cache\n4. Check if content blockers are interfering\n5. Update to the latest app version"
    },
    {
      title: "Watchlist not saving",
      problem: "Added cryptocurrencies disappear from watchlist",
      solution: "1. Ensure you're signed into your account\n2. Check internet connection for sync\n3. Try removing and re-adding the cryptocurrency\n4. Clear app cache and restart\n5. Verify sync settings are enabled"
    }
  ];

  const handleItemPress = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index);
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
    introContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
    },
    introText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: 15,
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 10,
    },
    contactButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    troubleshootingItem: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 10,
    },
    itemContent: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    problemText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: 10,
    },
    solutionText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Troubleshooting</Text>
        <View style={dynamicStyles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        {/* Introduction */}
        <View style={dynamicStyles.introContainer}>
          <Text style={dynamicStyles.introText}>
            Having trouble with the app? Browse through these common issues and solutions. If you can't find what you're looking for, don't hesitate to contact our support team.
          </Text>
          <TouchableOpacity 
            style={dynamicStyles.contactButton}
            onPress={() => Linking.openURL('mailto:support@cryptews.com')}
          >
            <Ionicons name="headset-outline" size={20} color="white" />
            <Text style={dynamicStyles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Troubleshooting Items */}
        {troubleshootingItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={dynamicStyles.troubleshootingItem}
            onPress={() => handleItemPress(index)}
          >
            <View style={dynamicStyles.itemHeader}>
              <Text style={dynamicStyles.itemTitle}>{item.title}</Text>
              <Ionicons
                name={expandedItem === index ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
            {expandedItem === index && (
              <View style={dynamicStyles.itemContent}>
                <Text style={dynamicStyles.problemText}>Problem: {item.problem}</Text>
                <Text style={dynamicStyles.solutionText}>Solution:{'\n'}{item.solution}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}