import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  /**
   * Request permissions and retrieve the unique Expo Push Token for this device.
   */
  registerForPushNotificationsAsync: async () => {
    let token;

    if (!Device.isDevice) {
      console.log('[NOTIFICATION_SERVICE] Physical device required for Push Notifications.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Alerts Restricted',
        'Institutional notifications are currently disabled. You may miss critical live session updates.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Retrieve the Expo Push Token
    try {
      // For Expo 51+, the projectId is usually fetched automatically if configured in app.json
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('[NOTIFICATION_SERVICE] Token Registered:', token);
    } catch (e) {
      console.error('[NOTIFICATION_SERVICE] Token Fetch Error:', e);
    }

    // Platform-specific configuration for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4f46e5',
      });
    }

    return token;
  },

  /**
   * Send a local notification immediately for UI/UX testing purposes.
   */
  sendLocalTestNotification: async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${title}`,
        body,
        data: { test: true },
        color: '#4f46e5', // Institutional Indigo
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Listen for incoming notifications while the app is in use.
   */
  addNotificationListener: (callback: (notification: Notifications.Notification) => void) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Listen for when a user interacts with a notification (taps it).
   */
  addNotificationResponseListener: (callback: (response: Notifications.NotificationResponse) => void) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
};
