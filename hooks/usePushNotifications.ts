// hooks/usePushNotifications.ts
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Updated notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Check if running on a physical device
  if (!Device.isDevice) {
    Alert.alert('Error', 'Must use physical device for Push Notifications');
    console.log('❌ Not running on physical device');
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  console.log('📋 Initial permission status:', existingStatus);

  if (existingStatus !== 'granted') {
    console.log('🔄 Requesting permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('📋 Final permission status:', finalStatus);
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission Denied', 'Failed to get push notification permissions!');
    console.log('❌ Push notification permissions not granted');
    return null;
  }

  try {
    console.log('🔄 Getting Expo push token...');
    
    // Get the project ID from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('❌ No project ID found in app config');
      Alert.alert('Configuration Error', 'EAS project ID not found in app configuration');
      return null;
    }

    console.log('📱 Project ID:', projectId);

    // Get push token with project ID
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    token = tokenData.data;
    console.log('✅ Successfully got push token:', token);
    
    // Optionally show success alert
    Alert.alert('Success', `Push token received: ${token.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    Alert.alert('Token Error', `Failed to get push token: ${errorMessage}`);
    return null;
  }

  return token;
}

interface PushNotificationHook {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

export const usePushNotifications = (): PushNotificationHook => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    console.log('🚀 Initializing push notifications...');
    
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log('✅ Push notification setup successful');
          console.log('📱 Token:', token);
          setExpoPushToken(token);
        } else {
          console.log('❌ Failed to get push token');
        }
      })
      .catch(error => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('❌ Push notification setup failed:', errorMessage);
      });

    // Listen to incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      setNotification(notification);
    });

    // Listen to notification responses (user taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📬 User tapped notification:', response);
    });

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};

// Test function to send a test notification
export async function sendTestNotification(expoPushToken: string): Promise<void> {
  if (!expoPushToken) {
    Alert.alert('No Token', 'No push token available');
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default' as const,
    title: 'Test Notification',
    body: 'This is a test push notification!',
    data: { testData: 'Hello World!' },
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('Test notification sent:', result);
    Alert.alert('Test Sent', 'Check your device for the test notification');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error sending test notification:', errorMessage);
    Alert.alert('Test Failed', 'Failed to send test notification');
  }
}