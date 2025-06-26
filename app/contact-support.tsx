// app/(tabs)/contact-support.tsx - Contact Support Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ContactSupportScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const supportOptions = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: 'mail-outline',
      action: 'email',
      contact: 'support@myapp.com',
      availability: '24/7'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak with our support team',
      icon: 'call-outline',
      action: 'phone',
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 9AM-6PM PST'
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      icon: 'chatbubble-outline',
      action: 'chat',
      contact: 'Available on website',
      availability: 'Mon-Fri, 9AM-6PM PST'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Message us on WhatsApp',
      icon: 'logo-whatsapp',
      action: 'whatsapp',
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 9AM-6PM PST'
    }
  ];

  const quickLinks = [
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: 'help-circle-outline',
      url: 'https://myapp.com/faq'
    },
    {
      id: 'status',
      title: 'Service Status',
      description: 'Check our service status',
      icon: 'pulse-outline',
      url: 'https://status.myapp.com'
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: 'people-outline',
      url: 'https://community.myapp.com'
    },
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'Detailed guides and tutorials',
      icon: 'book-outline',
      url: 'https://docs.myapp.com'
    }
  ];

  const handleSupportAction = (action: string, contact: string) => {
    switch (action) {
      case 'email':
        const emailSubject = 'Support Request - MyApp';
        const emailBody = 'Hi Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nDevice: [Your device info]\nApp Version: 1.0.0\n\nThank you!';
        Linking.openURL(`mailto:${contact}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`)
          .catch(() => Alert.alert('Error', 'Unable to open email client'));
        break;
      
      case 'phone':
        Linking.openURL(`tel:${contact}`)
          .catch(() => Alert.alert('Error', 'Unable to make phone call'));
        break;
      
      case 'chat':
        // Open website live chat
        Linking.openURL('https://myapp.com/support/chat')
          .catch(() => Alert.alert('Error', 'Unable to open live chat'));
        break;
      
      case 'whatsapp':
        const whatsappMessage = encodeURIComponent('Hi! I need help with MyApp.');
        const whatsappNumber = contact.replace(/[^\d]/g, '');
        Linking.openURL(`whatsapp://send?phone=${whatsappNumber}&text=${whatsappMessage}`)
          .catch(() => {
            // Fallback to WhatsApp web
            Linking.openURL(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`)
              .catch(() => Alert.alert('Error', 'WhatsApp is not installed'));
          });
        break;
    }
  };

  const handleQuickLink = (url: string) => {
    Linking.openURL(url)
      .catch(() => Alert.alert('Error', 'Unable to open link'));
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
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 20,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 25,
      lineHeight: 22,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      marginTop: 20,
      color: theme.colors.text,
    },
    supportCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    supportCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    supportIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    supportTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    supportDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    supportDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    contactInfo: {
      flex: 1,
    },
    contactText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
      marginBottom: 2,
    },
    availabilityText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    actionButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '500',
    },
    quickLinkCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    quickLinkIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    quickLinkContent: {
      flex: 1,
    },
    quickLinkTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    quickLinkDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    emergencyCard: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    emergencyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    emergencyText: {
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
        <Text style={dynamicStyles.headerTitle}>Contact Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.description}>
            Need help? We're here for you! Choose the best way to reach our support team.
          </Text>

          {/* Support Options */}
          <Text style={dynamicStyles.sectionTitle}>Get in Touch</Text>
          {supportOptions.map((option) => (
            <View key={option.id} style={dynamicStyles.supportCard}>
              <View style={dynamicStyles.supportCardHeader}>
                <View style={dynamicStyles.supportIcon}>
                  <Ionicons name={option.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.supportTitle}>{option.title}</Text>
                  <Text style={dynamicStyles.supportDescription}>{option.description}</Text>
                </View>
              </View>
              <View style={dynamicStyles.supportDetails}>
                <View style={dynamicStyles.contactInfo}>
                  <Text style={dynamicStyles.contactText}>{option.contact}</Text>
                  <Text style={dynamicStyles.availabilityText}>{option.availability}</Text>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.actionButton}
                  onPress={() => handleSupportAction(option.action, option.contact)}
                >
                  <Text style={dynamicStyles.actionButtonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Quick Links */}
          <Text style={dynamicStyles.sectionTitle}>Quick Links</Text>
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={dynamicStyles.quickLinkCard}
              onPress={() => handleQuickLink(link.url)}
            >
              <View style={dynamicStyles.quickLinkIcon}>
                <Ionicons name={link.icon as any} size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={dynamicStyles.quickLinkContent}>
                <Text style={dynamicStyles.quickLinkTitle}>{link.title}</Text>
                <Text style={dynamicStyles.quickLinkDescription}>{link.description}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}

          {/* Emergency Notice */}
          <View style={dynamicStyles.emergencyCard}>
            <Text style={dynamicStyles.emergencyTitle}>🚨 Urgent Issues</Text>
            <Text style={dynamicStyles.emergencyText}>
              For account security issues, unauthorized transactions, or other urgent matters, 
              please call our support line immediately at +1 (555) 123-4567.
            </Text>
          </View>
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