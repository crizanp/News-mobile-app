import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const handleContactPress = () => {
    Linking.openURL('mailto:support@ighgroup.io');
  };

  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'Personally Identifiable Information (PII): Includes name, email address, and other contact information voluntarily provided.',
        'Non-Personally Identifiable Information (Non-PII): Includes IP address, browser type, device info, and usage statistics collected automatically.',
      ],
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain our website and services.',
        'To personalize and improve your user experience.',
        'To communicate updates, newsletters, and promotional content.',
        'To analyze user behavior and trends.',
        'To ensure platform security and integrity.',
        'To comply with legal and regulatory obligations.',
      ],
    },
    {
      title: 'Disclosure of Your Information',
      content: [
        'To third-party service providers who help operate our website, under confidentiality agreements.',
        'To legal authorities in response to lawful requests or to protect rights and users.',
        'During a business transfer such as a merger, acquisition, or asset sale.',
        'We do not sell your personal data to third parties.',
      ],
    },
    {
      title: 'Data Security',
      content: [
        'We use reasonable safeguards including encryption and access control to protect your information.',
        'Despite our efforts, no transmission method over the internet is 100% secure.',
      ],
    },
    {
      title: 'Third-Party Links',
      content: [
        'Cryptews App may include links to external sites not operated by us.',
        'We are not responsible for the content, privacy practices, or policies of those third-party websites.',
      ],
    },
    {
      title: 'Children’s Privacy',
      content: [
        'Cryptews App is not intended for children under 13.',
        'We do not knowingly collect personal data from children.',
        'If you believe your child has provided us information, contact us immediately to delete it.',
      ],
    },
    {
      title: 'Changes to This Privacy Policy',
      content: [
        'We may update this policy periodically.',
        'You will be notified via this page when changes are made.',
        'We encourage you to review this policy regularly.',
      ],
    },
    {
      title: 'Contact Us',
      content: [
        'If you have questions or concerns about this Privacy Policy, contact us at support@ighgroup.io.',
      ],
    },
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
    },
    introText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      marginBottom: 10,
    },
    lastUpdated: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
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
    contentItem: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: 12,
    },
    contactSection: {
      backgroundColor: theme.colors.primary + '10',
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      marginHorizontal: 10,
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

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        <View style={dynamicStyles.introSection}>
          <Text style={dynamicStyles.introTitle}>Privacy Policy</Text>
          <Text style={dynamicStyles.introText}>
            This Privacy Policy explains how Cryptews App collects, uses, and discloses your information. By using our site, you agree to this policy.
          </Text>
          <Text style={dynamicStyles.lastUpdated}>Last updated: May 14, 2024</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>{section.title}</Text>
            {section.content.map((item, idx) => (
              <Text key={idx} style={dynamicStyles.contentItem}>• {item}</Text>
            ))}
          </View>
        ))}

        <View style={dynamicStyles.contactSection}>
          <Text style={dynamicStyles.contactTitle}>Need Help or Have Questions?</Text>
          <Text style={dynamicStyles.contactText}>
            If you have any questions or concerns regarding this Privacy Policy, feel free to contact our team.
          </Text>
          <TouchableOpacity style={dynamicStyles.contactButton} onPress={handleContactPress}>
            <Text style={dynamicStyles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>
            This Privacy Policy may be updated occasionally. We encourage users to review it regularly to stay informed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
