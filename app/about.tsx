// app/about.tsx - About Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const handleContactPress = () => {
    Linking.openURL('mailto:support@cryptews App');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://cryptews App');
  };

  const handleIghGroupPress = () => {
    Linking.openURL('https://ighgroup.io');
  };

  const features = [
    {
      icon: 'newspaper-outline',
      title: 'News Aggregation',
      description: 'Comprehensive crypto news from trusted sources worldwide'
    },
    {
      icon: 'analytics-outline',
      title: 'Market Insights',
      description: 'Expert analysis and market trends for informed decisions'
    },
    {
      icon: 'time-outline',
      title: 'Real-Time Updates',
      description: 'Breaking news and developments as they happen'
    },
    {
      icon: 'people-outline',
      title: 'Community Hub',
      description: 'Engage with crypto enthusiasts and share trading strategies'
    },
    {
      icon: 'library-outline',
      title: 'Educational Resources',
      description: 'Guides, tutorials, and glossaries for all skill levels'
    },
    {
      icon: 'funnel-outline',
      title: 'Personalized Feed',
      description: 'Customizable news based on your crypto interests'
    }
  ];

  const team = [
    { name: 'Expert Editorial Team', role: 'Content Curation & Verification' },
    { name: 'Blockchain Analysts', role: 'Market Research & Analysis' },
    { name: 'Technical Writers', role: 'Educational Content Creation' },
    { name: 'Community Managers', role: 'User Engagement & Support' }
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
    logoContainer: {
      alignItems: 'center',
      paddingVertical: 30,
      backgroundColor: theme.colors.background,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: '#F7931A', // Bitcoin orange color
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 5,
    },
    version: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    section: {
      backgroundColor: theme.colors.background,
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F7931A20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    teamMember: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    teamName: {
      fontSize: 16,
      color: theme.colors.text,
    },
    teamRole: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    contactButton: {
      backgroundColor: '#F7931A',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 10,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    websiteButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#F7931A',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 5,
    },
    websiteButtonText: {
      color: '#F7931A',
      fontSize: 16,
      fontWeight: '600',
    },
    ighButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.textSecondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 5,
    },
    ighButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    disclaimer: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#F7931A',
      marginTop: 10,
    },
    disclaimerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.background,
    },
    copyrightText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        {/* App Logo and Name */}
        <View style={dynamicStyles.logoContainer}>
          <View style={dynamicStyles.logo}>
            <Ionicons name="trending-up" size={40} color="#FFFFFF" />
          </View>
          <Text style={dynamicStyles.appName}>Cryptews Official App</Text>
          <Text style={dynamicStyles.version}>by IGH Group</Text>
        </View>

        {/* Welcome Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Welcome to Cryptews App</Text>
          <Text style={dynamicStyles.description}>
            Welcome to Cryptews App by IGH Group - a premier news aggregator and crypto news portal, 
            designed to be your one-stop destination for comprehensive and up-to-the-minute news for 
            crypto enthusiasts and traders.
          </Text>
          <Text style={dynamicStyles.description}>
            Our platform is your hub for all things related to cryptocurrencies, blockchain technology, 
            and the digital asset ecosystem. We understand that staying informed is crucial in the 
            fast-paced world of crypto, which is why we aggregate news articles, analysis, opinion pieces, 
            and market insights from diverse trusted sources.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Our Mission</Text>
          <Text style={dynamicStyles.description}>
            We scour the web to bring you the most relevant and timely information, saving you valuable 
            time and effort. Our dedicated team of expert editors curates and verifies each piece of news, 
            ensuring you receive accurate and reliable content.
          </Text>
          <Text style={dynamicStyles.description}>
            From breaking news about Bitcoin and Ethereum to updates on altcoins, initial coin offerings (ICOs), 
            decentralized finance (DeFi), and emerging blockchain projects - we cover it all. Whether you're 
            a seasoned trader, blockchain developer, or curious newcomer, Cryptews App caters to your specific needs.
          </Text>
        </View>

        {/* Key Features */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Platform Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={dynamicStyles.featureItem}>
              <View style={dynamicStyles.featureIcon}>
                <Ionicons name={feature.icon as any} size={20} color="#F7931A" />
              </View>
              <View style={dynamicStyles.featureContent}>
                <Text style={dynamicStyles.featureTitle}>{feature.title}</Text>
                <Text style={dynamicStyles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Community Section */}
        {/* <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Join Our Community</Text>
          <Text style={dynamicStyles.description}>
            Engage with a vibrant community of crypto enthusiasts through our interactive features. 
            Participate in discussions, share your perspectives, and exchange trading strategies with 
            like-minded individuals. Our platform fosters collaboration and knowledge sharing, 
            empowering you to make informed decisions and stay ahead of the curve.
          </Text>
        </View> */}

        {/* Our Team */}
        {/* <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Our Team</Text>
          {team.map((member, index) => (
            <View key={index} style={dynamicStyles.teamMember}>
              <Text style={dynamicStyles.teamName}>{member.name}</Text>
              <Text style={dynamicStyles.teamRole}>{member.role}</Text>
            </View>
          ))}
        </View> */}

        {/* Educational Resources */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Educational Resources</Text>
          <Text style={dynamicStyles.description}>
            Beyond news, Cryptews App offers comprehensive educational resources to help you deepen 
            your understanding of cryptocurrencies and blockchain technology. Explore our guides, 
            tutorials, and glossaries to enhance your knowledge and stay informed about the latest 
            industry developments.
          </Text>
        </View>

        {/* Important Disclaimer */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Important Notice</Text>
          <View style={dynamicStyles.disclaimer}>
            <Text style={dynamicStyles.disclaimerText}>
              As we prioritize transparency and integrity, we encourage our users to conduct their own 
              research and due diligence before making any investment decisions. Cryptews App aims to 
              provide reliable information, but we cannot be held responsible for any actions taken 
              based on the content published on our platform.
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Get Connected</Text>
          <TouchableOpacity style={dynamicStyles.contactButton} onPress={handleContactPress}>
            <Text style={dynamicStyles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.websiteButton} onPress={handleWebsitePress}>
            <Text style={dynamicStyles.websiteButtonText}>Visit Cryptews App</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={dynamicStyles.ighButton} onPress={handleIghGroupPress}>
            <Text style={dynamicStyles.ighButtonText}>Learn About IGH Group</Text>
          </TouchableOpacity> */}
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