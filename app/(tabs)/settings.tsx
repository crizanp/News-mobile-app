// app/(tabs)/settings.tsx - Enhanced Settings Page with Theme Support and Proper Navigation
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext'; // Adjust path as needed

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  
  const [settings, setSettings] = useState<{[key: string]: any}>({
    notifications: true,
    biometric: false,
    twoFactor: true,
  });

  // Dynamic settings options that reflect current theme state
  const settingsOptions = [
    {
      section: 'Preferences',
      items: [
        { id: 'notifications', title: 'Push Notifications', type: 'switch', value: settings.notifications, icon: 'notifications-outline' },
        { id: 'darkMode', title: 'Dark Mode', type: 'switch', value: isDark, icon: 'moon-outline' },
        { id: 'currency', title: 'Default Currency', type: 'select', value: 'USD', icon: 'card-outline' },
        { id: 'language', title: 'Language', type: 'select', value: 'English', icon: 'language-outline' },
      ]
    },
    {
      section: 'Support & Feedback',
      items: [
        { id: 'help', title: 'Help Center', type: 'action', icon: 'help-circle-outline' },
        { id: 'contact', title: 'Contact Support', type: 'action', icon: 'mail-outline' },
        { id: 'feedback', title: 'Send Feedback', type: 'action', icon: 'chatbubble-outline' },
        { id: 'rateApp', title: 'Rate This App', type: 'action', icon: 'star-outline' },
      ]
    },
    {
      section: 'Legal & Information',
      items: [
        { id: 'about', title: 'About', type: 'action', icon: 'information-circle-outline' },
        { id: 'privacyPolicy', title: 'Privacy Policy', type: 'action', icon: 'shield-outline' },
        { id: 'disclaimer', title: 'Disclaimer', type: 'action', icon: 'warning-outline' },
        { id: 'advertisement', title: 'Advertisement Info', type: 'action', icon: 'megaphone-outline' },
      ]
    },
  ];

  const handleSwitchChange = (settingId: string, value: boolean) => {
    if (settingId === 'darkMode') {
      toggleTheme(); // Use theme context toggle
    } else {
      setSettings(prev => ({ ...prev, [settingId]: value }));
    }
  };

  const handleActionPress = (settingId: string, title: string) => {
    switch (settingId) {
      case 'help':
        // Navigate to Help Center page
        router.push('/help-center');
        break;
      
      case 'contact':
        // Navigate to Contact Support page
        Linking.openURL('mailto:support@cryptews.com')
        break;
      
      case 'feedback':
        // Navigate to Send Feedback page
        router.push('/send-feedback');
        break;
      
      case 'rateApp':
        Alert.alert(
          'Rate This App',
          'Enjoying the app? Please take a moment to rate us on the App Store. Your feedback helps us improve!',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Rate App', onPress: () => openAppStore() }
          ]
        );
        break;
      
      case 'about':
                router.push('/about');

        break;
      
      case 'privacyPolicy':
                router.push('/privacy-policy');

        break;
      
      case 'disclaimer':
                router.push('/disclaimer');

        break;
      
      case 'advertisement':
                router.push('/advertisement');

        break;
      
      default:
        Alert.alert('Settings', `${title} pressed!`);
        break;
    }
  };

  const openWebLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const openAppStore = () => {
    // iOS App Store URL
    const iosAppStoreUrl = 'https://apps.apple.com/app/id1234567890'; // Replace with your actual app ID
    // Android Play Store URL
    const androidPlayStoreUrl = 'https://play.google.com/store/apps/details?id=com.crypto.news'; // Replace with your actual package name
    
    // Try iOS first, then Android as fallback
    Linking.openURL(iosAppStoreUrl).catch(() => {
      Linking.openURL(androidPlayStoreUrl).catch(() => {
        // If both fail, show a generic message
        Alert.alert(
          'Rate App',
          'Please search for "Crypto News" in your device\'s app store to leave a rating.',
          [{ text: 'OK' }]
        );
      });
    });
  };

  const handleUpgrade = () => {
    Alert.alert('Premium Upgrade', 'This would open the premium upgrade screen');
  };

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.id} style={[styles.settingItem, { borderColor: theme.colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
            </View>
            <Switch
              value={item.id === 'darkMode' ? isDark : settings[item.id]}
              onValueChange={(value) => handleSwitchChange(item.id, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        );
      case 'select':
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.settingItem, { borderColor: theme.colors.border }]}
            onPress={() => handleActionPress(item.id, item.title)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>{item.value}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        );
      case 'action':
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.settingItem, { borderColor: theme.colors.border }]}
            onPress={() => handleActionPress(item.id, item.title)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  // Create dynamic styles based on current theme
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
      backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 10,
      color: theme.colors.text,
    },
    versionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 5,
    },
    copyrightText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings Content */}
      <ScrollView style={dynamicStyles.scrollContainer}>
        {settingsOptions.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>{section.section}</Text>
            {section.items.map(renderSettingItem)}
          </View>
        ))}
        
        {/* App Version Footer */}
        <View style={styles.footer}>
          <Text style={dynamicStyles.versionText}>Version 1.0.0</Text>
          <Text style={dynamicStyles.copyrightText}>© 2024 MyApp. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Static styles that don't change with theme
const styles = StyleSheet.create({
  headerSpacer: {
    width: 40,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    marginLeft: 10,
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    marginRight: 5,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
});