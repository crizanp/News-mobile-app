// app/(tabs)/help-center.tsx - Help Center Page
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function HelpCenterScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData = [
    {
      question: "How do I track my expenses?",
      answer: "To track expenses, tap the '+' button on the home screen, select 'Expense', choose a category, enter the amount and description, then save. Your expense will be automatically categorized and added to your budget tracking."
    },
    {
      question: "How can I set up a budget?",
      answer: "Go to the Budget tab, tap 'Create Budget', select the category you want to budget for, set your monthly limit, and choose the time period. The app will track your spending against this budget and notify you when you're approaching the limit."
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes! Go to Settings > Data Export, select the date range and format (CSV or PDF), then tap 'Export'. You can share the file via email or save it to your device."
    },
    {
      question: "How do I enable notifications?",
      answer: "Go to Settings > Notifications, then toggle on the types of notifications you want to receive. You can customize reminders for bill payments, budget alerts, and spending summaries."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely! We use bank-level encryption to protect your data. All information is stored securely on your device and encrypted before any cloud backup. We never share your personal financial information with third parties."
    },
    {
      question: "How do I delete an expense or income entry?",
      answer: "Find the transaction in your transaction history, swipe left on the entry, and tap 'Delete'. You can also tap on the entry to view details and use the delete option there."
    },
    {
      question: "Can I use multiple currencies?",
      answer: "Yes! Go to Settings > Currency, select your primary currency, and enable 'Multi-currency support'. You can then add expenses in different currencies, and the app will convert them to your primary currency."
    },
    {
      question: "How do I backup my data?",
      answer: "Go to Settings > Backup & Sync, enable 'Auto Backup', and sign in with your Google or Apple account. Your data will be automatically backed up and synced across your devices."
    }
  ];

  const quickActions = [
    { id: 'tutorial', title: 'App Tutorial', icon: 'play-circle-outline', description: 'Learn how to use all features' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: 'build-outline', description: 'Common issues and solutions' },
    { id: 'features', title: 'Feature Guide', icon: 'book-outline', description: 'Detailed feature explanations' },
    { id: 'contact', title: 'Contact Support', icon: 'headset-outline', description: 'Get personalized help' },
  ];

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFAQPress = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'tutorial':
        router.push('/app-tutorial');
        break;
      case 'troubleshooting':
        router.push('/troubleshooting');
        break;
      case 'features':
        router.push('/feature-guide');
        break;
      case 'contact':
        Linking.openURL('mailto:support@cryptews.com');
        break;
    }
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
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      marginTop: 20,
      paddingHorizontal: 20,
      color: theme.colors.text,
    },
    quickActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    quickActionContent: {
      marginLeft: 15,
      flex: 1,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    quickActionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    faqItem: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    faqQuestion: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqQuestionText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
      marginRight: 10,
    },
    faqAnswer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    faqAnswerText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollContainer}>
        {/* Search */}
        <View style={dynamicStyles.searchContainer}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search help topics..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={dynamicStyles.quickActionItem}
            onPress={() => handleQuickAction(action.id)}
          >
            <Ionicons name={action.icon as any} size={24} color={theme.colors.primary} />
            <View style={dynamicStyles.quickActionContent}>
              <Text style={dynamicStyles.quickActionTitle}>{action.title}</Text>
              <Text style={dynamicStyles.quickActionDescription}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* FAQ Section */}
        <Text style={dynamicStyles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFAQs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={dynamicStyles.faqItem}
            onPress={() => handleFAQPress(index)}
          >
            <View style={dynamicStyles.faqQuestion}>
              <Text style={dynamicStyles.faqQuestionText}>{faq.question}</Text>
              <Ionicons
                name={expandedFAQ === index ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
            {expandedFAQ === index && (
              <View style={dynamicStyles.faqAnswer}>
                <Text style={dynamicStyles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    width: 40,
  },
});