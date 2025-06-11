// app/(tabs)/settings.tsx - Settings Page
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const settingsOptions = [
  {
    section: 'Preferences',
    items: [
      { id: 'notifications', title: 'Push Notifications', type: 'switch', value: true, icon: 'notifications-outline' },
      { id: 'darkMode', title: 'Dark Mode', type: 'switch', value: false, icon: 'moon-outline' },
      { id: 'currency', title: 'Default Currency', type: 'select', value: 'USD', icon: 'card-outline' },
      { id: 'language', title: 'Language', type: 'select', value: 'English', icon: 'language-outline' },
    ]
  },
  {
    section: 'Security',
    items: [
      { id: 'biometric', title: 'Biometric Login', type: 'switch', value: false, icon: 'finger-print-outline' },
      { id: 'twoFactor', title: 'Two-Factor Authentication', type: 'switch', value: true, icon: 'shield-checkmark-outline' },
      { id: 'autoLock', title: 'Auto Lock', type: 'select', value: '5 minutes', icon: 'lock-closed-outline' },
    ]
  },
  {
    section: 'Account',
    items: [
      { id: 'profile', title: 'Edit Profile', type: 'action', icon: 'person-outline' },
      { id: 'backup', title: 'Backup & Sync', type: 'action', icon: 'cloud-outline' },
      { id: 'export', title: 'Export Data', type: 'action', icon: 'download-outline' },
    ]
  },
  {
    section: 'Support',
    items: [
      { id: 'help', title: 'Help Center', type: 'action', icon: 'help-circle-outline' },
      { id: 'contact', title: 'Contact Support', type: 'action', icon: 'mail-outline' },
      { id: 'feedback', title: 'Send Feedback', type: 'action', icon: 'chatbubble-outline' },
      { id: 'about', title: 'About', type: 'action', icon: 'information-circle-outline' },
    ]
  },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<{[key: string]: any}>({
    notifications: true,
    darkMode: false,
    biometric: false,
    twoFactor: true,
  });

  const handleSwitchChange = (settingId: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));
  };

  const handleActionPress = (settingId: string, title: string) => {
    Alert.alert('Settings', `${title} pressed!`);
  };

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color="#666" />
              <Text style={styles.settingTitle}>{item.title}</Text>
            </View>
            <Switch
              value={settings[item.id]}
              onValueChange={(value) => handleSwitchChange(item.id, value)}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor="#FFF"
            />
          </View>
        );
      case 'select':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={() => handleActionPress(item.id, item.title)}
          >
                        <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color="#666" />
              <Text style={styles.settingTitle}>{item.title}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{item.value}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        );
      case 'action':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={() => handleActionPress(item.id, item.title)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon} size={24} color="#666" />
              <Text style={styles.settingTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {settingsOptions.map((section) => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map(renderSettingItem)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    marginRight: 5,
    fontSize: 14,
    color: '#666',
  },
});
