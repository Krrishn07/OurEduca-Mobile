/**
 * VideoNavigator.jsx
 *
 * Drop this navigator into your existing React Navigation tree.
 * Each role's Tab Navigator should import this file and register
 * it as a Stack that sits at the root so VideoPlayer can go fullscreen.
 *
 * ─── INSTALL ─────────────────────────────────────────────────────────────────
 *
 *   npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
 *   npx expo install react-native-screens react-native-safe-area-context
 *   npx expo install react-native-gesture-handler          # needed by Stack
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────
 *
 * In your role-specific navigator, replace the plain "Videos" screen with:
 *
 *   import VideoNavigator from './VideoNavigator';
 *
 *   // Inside your Tab.Navigator:
 *   <Tab.Screen name="Videos" component={VideoNavigator} />
 *
 * That's it. VideoNavigator handles its own internal stack, including
 * full-screen VideoPlayerScreen.
 *
 * ─── ROLE MAPPING ────────────────────────────────────────────────────────────
 *
 *   Role          | VideoListScreen
 *   ──────────────────────────────────────────
 *   student       | StudentVideoScreen
 *   teacher       | TeacherVideoScreen
 *   mentor        | MentorVideoScreen
 *   headmaster    | HeadmasterVideoScreen
 *
 * Pass `role` as an initialParam or read it from your auth context:
 *
 *   <Tab.Screen
 *     name="Videos"
 *     component={VideoNavigator}
 *     initialParams={{ role: 'teacher' }}
 *   />
 *
 * ─── DAILY.CO PRODUCTION WIRING ───────────────────────────────────────────────
 *
 *   npx expo install @daily-co/react-native-daily-js
 *   npx expo install expo-camera           # camera permissions
 *   npx expo install expo-av               # audio session
 *
 *   // In TeacherVideoScreen, after getting roomUrl + token from Edge Function:
 *   import Daily from '@daily-co/react-native-daily-js';
 *   const callRef = useRef(null);
 *
 *   const startStream = async (roomUrl, token) => {
 *     callRef.current = Daily.createCallObject();
 *     await callRef.current.join({ url: roomUrl, token });
 *     // callRef.current.startRecording();   // cloud recording
 *   };
 *
 *   const stopStream = async () => {
 *     await callRef.current.stopRecording();
 *     await callRef.current.leave();
 *     callRef.current.destroy();
 *   };
 *
 *   // Render participant videos:
 *   import { DailyMediaView } from '@daily-co/react-native-daily-js';
 *   <DailyMediaView
 *     videoTrack={participant.videoTrack}
 *     audioTrack={participant.audioTrack}
 *     style={{ flex: 1 }}
 *   />
 */

import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import VideoPlayerScreen     from './components/VideoPlayerScreen';
import TeacherVideoScreen    from './screens/TeacherVideoScreen';
import MentorVideoScreen     from './screens/MentorVideoScreen';
import StudentVideoScreen    from './screens/StudentVideoScreen';
import HeadmasterVideoScreen from './screens/HeadmasterVideoScreen';

// Replace with your own auth context / hook
// import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();

const SCREEN_MAP = {
  student:    StudentVideoScreen,
  teacher:    TeacherVideoScreen,
  mentor:     MentorVideoScreen,
  headmaster: HeadmasterVideoScreen,
};

export default function VideoNavigator({ route }) {
  // Get role from route params OR from auth context
  const role = route?.params?.role ?? 'student';
  // const { user } = useAuth();   // alternative: const role = user.role;

  const VideoListScreen = SCREEN_MAP[role] ?? StudentVideoScreen;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Role-specific video list screen */}
      <Stack.Screen name="VideoList" component={VideoListScreen} />

      {/* Full-screen player — shared across all roles */}
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          presentation: 'fullScreenModal',   // iOS true fullscreen
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * ─── PERMISSIONS SETUP ────────────────────────────────────────────────────────
 *
 * Add to app.json → expo.plugins:
 *
 * [
 *   "expo-camera",
 *   { "cameraPermission": "Allow Springfield Academy to access your camera for live classes." }
 * ],
 * [
 *   "expo-av",
 *   { "microphonePermission": "Allow Springfield Academy to access your microphone for live classes." }
 * ]
 *
 * Add to app.json → expo.android.permissions:
 *   "CAMERA", "RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"
 *
 * ─── REQUESTING PERMISSIONS IN TeacherVideoScreen ────────────────────────────
 *
 * import { Camera } from 'expo-camera';
 * import { Audio }  from 'expo-av';
 *
 * const requestPermissions = async () => {
 *   const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
 *   const { status: micStatus } = await Audio.requestPermissionsAsync();
 *   if (camStatus !== 'granted' || micStatus !== 'granted') {
 *     Alert.alert('Permissions required', 'Camera and microphone access is needed for live streaming.');
 *   }
 * };
 */
