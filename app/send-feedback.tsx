// app/(tabs)/send-feedback.tsx - Send Feedback Form
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SendFeedbackScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackCategories = [
    { id: 'bug', title: 'Bug Report', icon: 'bug-outline' },
    { id: 'feature', title: 'Feature Request', icon: 'bulb-outline' },
    { id: 'improvement', title: 'Improvement', icon: 'trending-up-outline' },
    { id: 'compliment', title: 'Compliment', icon: 'heart-outline' },
    { id: 'complaint', title: 'Complaint', icon: 'warning-outline' },
    { id: 'other', title: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = feedbackCategories.find(cat => cat.id === categoryId);
    handleInputChange('category', category?.title || '');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Please select a feedback category');
      return false;
    }
    if (!formData.subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Validation Error', 'Please enter your feedback message');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Feedback Sent!',
        'Thank you for your feedback. We\'ll review it and get back to you within 24-48 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                category: '',
                subject: '',
                message: '',
              });
              setSelectedCategory('');
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      flexGrow: 1,
      backgroundColor: theme.colors.surface,
    },
    formContainer: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 15,
      marginTop: 10,
      color: theme.colors.text,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 8,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryIcon: {
      marginRight: 6,
    },
    categoryText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    categoryTextSelected: {
      color: '#FFF',
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    submitButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    submitButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
  });

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Send Feedback</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={dynamicStyles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={dynamicStyles.formContainer}>
          <Text style={dynamicStyles.description}>
            We value your feedback! Please fill out the form below and we'll get back to you as soon as possible.
          </Text>

          {/* Name Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Name *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          {/* Email Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Email *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Category Selection */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Category *</Text>
            <View style={dynamicStyles.categoriesContainer}>
              {feedbackCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    dynamicStyles.categoryButton,
                    selectedCategory === category.id && dynamicStyles.categoryButtonSelected
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={selectedCategory === category.id ? '#FFF' : theme.colors.textSecondary}
                    style={dynamicStyles.categoryIcon}
                  />
                  <Text
                    style={[
                      dynamicStyles.categoryText,
                      selectedCategory === category.id && dynamicStyles.categoryTextSelected
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Subject *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Brief description of your feedback"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.subject}
              onChangeText={(value) => handleInputChange('subject', value)}
            />
          </View>

          {/* Message Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Message *</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              placeholder="Please provide detailed feedback..."
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              dynamicStyles.submitButton,
              isSubmitting && dynamicStyles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text
              style={[
                dynamicStyles.submitButtonText,
                isSubmitting && dynamicStyles.submitButtonTextDisabled
              ]}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    width: 40,
  },
});