// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function TabLayout() {
  // const { expoPushToken, notification } = usePushNotifications();

  // // Log the token when it's available
  // useEffect(() => {
  //   if (expoPushToken) {
  //     console.log('✅ Push token in TabLayout:', expoPushToken);
  //   }
  // }, [expoPushToken]);

  // // Log when notification is received
  // useEffect(() => {
  //   if (notification) {
  //     console.log('🔔 Notification received in TabLayout:', notification);
  //   }
  // }, [notification]);

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: 'Market',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trending-up-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}