// app/advertisement.tsx - Advertisement Information Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function AdvertisementScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [adPreferences, setAdPreferences] = useState({
    personalizedAds: true,
    analyticsTracking: false,
    thirdPartyData: false,
  });

  const handleContactPress = () => {
    Linking.openURL('mailto:ads@myapp.com');
  };

  const handleUpgradePress = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Remove all advertisements and unlock premium features.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => {
          // Handle premium upgrade
          Alert.alert('Premium Upgrade', 'This would open the premium upgrade flow');
        }}
      ]
    );
  };

  const handleOptOut = () => {
    Alert.alert(
      'Opt Out of Ads',
      'You can opt out of personalized advertising. This will not reduce the number of ads you see, but they may be less relevant to you.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Opt Out', onPress: () => {
          setAdPreferences(prev => ({ ...prev, personalizedAds: false }));
          Alert.alert('Success', 'You have opted out of personalized ads.');
        }}
      ]
    );
  };

  const adNetworks = [
    { name: 'Google AdMob', purpose: 'Display and video advertisements' },
    { name: 'Facebook Audience Network', purpose: 'Targeted display advertisements' },
    { name: 'Unity Ads', purpose: 'Rewarded video advertisements' },
    { name: 'AppLovin', purpose: 'Native and interstitial advertisements' }
  ];

  const dataUsage = [
    { 
      type: 'Device Information', 
      description: 'Device model, operating system, screen size for ad optimization',
      collected: true 
    },
    { 
      type: 'Location Data', 
      description: 'General location for geo-targeted advertisements',
      collected: false 
    },
    { 
      type: 'Usage Patterns', 
      description: 'App usage statistics to show relevant advertisements',
      collected: true 
    },
    { 
      type: 'Demographic Info', 
      description: 'Age range and interests for personalized advertisements',
      collected: adPreferences.personalizedAds 
    }
  ];

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
    introSection: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 25,
    },
    introTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    introText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    upgradeCard: {
      backgroundColor: theme.colors.primary + '15',
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 20,
      marginVertical: 15,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    upgradeTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 10,
      textAlign: 'center',
    },
    upgradeText: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 22,
    },
    upgradeButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      alignSelf: 'center',
    },
    upgradeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    section: {
      backgroundColor: theme.colors.background,
      marginVertical: 5,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    sectionText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: 15,
    },
    networkItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    networkName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    networkPurpose: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 2,
      textAlign: 'right',
    },
    dataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dataContent: {
      flex: 1,
      marginRight: 15,
    },
    dataType: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    dataDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    dataStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 80,
      alignItems: 'center',
    },
    dataStatusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    preferencesCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 20,
      marginVertical: 15,
    },
    preferencesTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    preferenceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    preferenceText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      marginRight: 15,
    },
    actionButtons: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    actionButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 8,
    },
    actionButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    contactSection: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 10,
    },
    contactText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: 15,
    },
    contactButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.background,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  const getStatusStyle = (collected: boolean) => ({
    ...dynamicStyles.dataStatus,
    backgroundColor: collected 
      ? theme.colors.primary + '20' 
      : theme.colors.textSecondary + '20',
  });

  const getStatusTextStyle = (collected: boolean) => ({
    ...dynamicStyles.dataStatusText,
    color: collected ? theme.colors.primary : theme.colors.textSecondary,
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Advertisement Info</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        {/* Introduction */}
        <View style={dynamicStyles.introSection}>
          <Ionicons 
            name="megaphone" 
            size={32} 
            color={theme.colors.primary} 
            style={{ alignSelf: 'center', marginBottom: 15 }}
          />
          <Text style={dynamicStyles.introTitle}>Advertisement Information</Text>
          <Text style={dynamicStyles.introText}>
            MyApp is free to use thanks to advertisements. Here's everything you need to know about 
            how ads work in our app and how your data is used.
          </Text>
        </View>

       

        {/* How Ads Work */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>How Advertisements Work</Text>
          <Text style={dynamicStyles.sectionText}>
            We partner with reputable advertising networks to display relevant advertisements in our app. 
            These ads help us keep the app free while continuing to improve and add new features.
          </Text>
          <Text style={dynamicStyles.sectionText}>
            Advertisements may appear as banner ads, interstitial ads between screens, or rewarded video ads 
            that you can choose to watch for in-app benefits.
          </Text>
        </View>

        {/* Advertising Networks */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Our Advertising Partners</Text>
          <Text style={dynamicStyles.sectionText}>
            We work with the following trusted advertising networks:
          </Text>
          {adNetworks.map((network, index) => (
            <View key={index} style={dynamicStyles.networkItem}>
              <Text style={dynamicStyles.networkName}>{network.name}</Text>
              <Text style={dynamicStyles.networkPurpose}>{network.purpose}</Text>
            </View>
          ))}
        </View>

        {/* Data Usage for Ads */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Data Used for Advertising</Text>
          <Text style={dynamicStyles.sectionText}>
            Here's what data may be collected for advertising purposes:
          </Text>
          {dataUsage.map((item, index) => (
            <View key={index} style={dynamicStyles.dataItem}>
              <View style={dynamicStyles.dataContent}>
                <Text style={dynamicStyles.dataType}>{item.type}</Text>
                <Text style={dynamicStyles.dataDescription}>{item.description}</Text>
              </View>
              <View style={getStatusStyle(item.collected)}>
                <Text style={getStatusTextStyle(item.collected)}>
                  {item.collected ? 'Collected' : 'Not Collected'}
                </Text>
              </View>
            </View>
          ))}
        </View>

       
       

        {/* Contact Section */}
        <View style={dynamicStyles.contactSection}>
          <Text style={dynamicStyles.contactTitle}>Questions About Ads?</Text>
          <Text style={dynamicStyles.contactText}>
            If you have questions about advertisements, data usage, or want to report inappropriate ads, 
            please contact our advertising team.
          </Text>
          <TouchableOpacity style={dynamicStyles.contactButton} onPress={handleContactPress}>
            <Text style={dynamicStyles.contactButtonText}>Contact Ad Team</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>
            Your privacy and experience matter to us. We're committed to showing relevant, 
            non-intrusive advertisements while respecting your preferences.{'\n\n'}
            Advertisement policies are subject to change. We'll notify you of any significant updates.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    width: 40,
  },
});