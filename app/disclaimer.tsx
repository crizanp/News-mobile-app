import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function DisclaimerScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const sections = [
    {
      title: 'General Disclaimer',
      content: [
        'The information provided by Cryptews App is for general informational purposes only.',
        'All information on the site is provided in good faith, however we make no representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability, or completeness of any information.',
      ],
    },
    {
      title: 'Not Financial Advice',
      content: [
        'Nothing on this site constitutes financial, investment, or trading advice.',
        'You should not treat any information on Cryptews App as a recommendation to make any investment decisions.',
        'Always do your own research or consult a licensed financial advisor before making any financial decisions.',
      ],
    },
    {
      title: 'Third-Party Links & Content',
      content: [
        'Cryptews App may contain links to external websites or display content from third-party sources.',
        'We do not monitor, verify, or endorse the accuracy of information from third parties.',
        'We are not responsible for any content, privacy practices, or services offered by these third parties.',
      ],
    },
    {
      title: 'No Liability',
      content: [
        'Under no circumstance shall Cryptews App be liable for any loss or damage incurred as a result of the use of our site or reliance on any information provided.',
        'Your use of the site and your reliance on any information is solely at your own risk.',
      ],
    },
    {
      title: 'Changes to This Disclaimer',
      content: [
        'We may update this Disclaimer at any time without prior notice.',
        'Your continued use of the site after any changes indicates acceptance of the new terms.',
      ],
    },
    {
      title: 'Contact',
      content: [
        'If you have any questions about this Disclaimer, please contact us at support@ighgroup.io.',
      ],
    },
  ];

  const styles = StyleSheet.create({
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disclaimer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Disclaimer</Text>
          <Text style={styles.introText}>
            This Disclaimer governs your use of Cryptews App and all content within it. Please read it carefully.
          </Text>
          <Text style={styles.lastUpdated}>Last updated: May 14, 2024</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((item, idx) => (
              <Text key={idx} style={styles.contentItem}>• {item}</Text>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Cryptews App, you acknowledge and accept this Disclaimer in full.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
