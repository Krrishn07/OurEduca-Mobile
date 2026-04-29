# VideoScreens — React Native Expo

Complete video menu for all 4 roles, converted from the web preview.

## File Structure

```
VideoScreens/
├── constants.js                          ← Design tokens + mock data
├── VideoNavigator.jsx                    ← Drop-in Stack navigator (read this first)
├── components/
│   ├── SharedComponents.jsx              ← Av, LiveBadge, LiveRoomCard, RecordedCard
│   └── VideoPlayerScreen.jsx             ← Full-screen CCTV viewer (shared)
└── screens/
    ├── TeacherVideoScreen.jsx            ← Go Live · Library · Monitor
    ├── MentorVideoScreen.jsx             ← Monitor · Library (read-only)
    ├── StudentVideoScreen.jsx            ← Live Now · Library (+ parent toggle)
    └── HeadmasterVideoScreen.jsx         ← Meetings · Live Monitor · Meeting Room
```

## Quick Start

### 1. Install dependencies
```bash
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler

# For real streaming (add later):
npx expo install @daily-co/react-native-daily-js
npx expo install expo-camera expo-av
```

### 2. Drop into your tab navigator
```jsx
// In your role tab navigator (e.g. TeacherTabs.jsx)
import VideoNavigator from './VideoScreens/VideoNavigator';

<Tab.Screen
  name="Videos"
  component={VideoNavigator}
  initialParams={{ role: 'teacher' }}   // 'student' | 'teacher' | 'mentor' | 'headmaster'
/>
```

### 3. Replace mock data with Supabase
In `constants.js`, replace `LIVE_ROOMS` and `RECORDED` with real-time fetches:

```js
// In each screen's useEffect:
const { data: liveRooms } = await supabase
  .from('live_rooms')
  .select('*')
  .eq('status', 'live');

// Or use Supabase Realtime:
supabase
  .channel('live_rooms')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'live_rooms' }, payload => {
    // update state
  })
  .subscribe();
```

## Web-to-React-Native Conversion Map

| Web (JSX)              | React Native                          |
|------------------------|---------------------------------------|
| `<div>`                | `<View>`                              |
| `<span>` / `<p>`       | `<Text>`                              |
| `<button onClick>`     | `<TouchableOpacity onPress>`          |
| `overflow: auto`       | `<ScrollView>` / `<FlatList>`         |
| `position: fixed`      | `<Modal>` or absolute + `<SafeAreaView>` |
| `backdropFilter: blur` | `<BlurView>` from `expo-blur`         |
| CSS animations         | `Animated` API or `react-native-reanimated` |
| `gap: 10`              | `gap: 10` (RN 0.71+) or `marginBottom` |
| Google Fonts `@import` | `expo-font` + `useFonts()`            |
| `aspect-ratio: 16/9`   | `aspectRatio: 16/9` in StyleSheet     |

## Role Feature Matrix

| Feature                     | Teacher | Mentor | Student | Headmaster |
|-----------------------------|:-------:|:------:|:-------:|:----------:|
| Go Live (stream)            | ✅      | ❌     | ❌      | ❌         |
| CCTV / screen source        | ✅      | ❌     | ❌      | ❌         |
| Upload recording            | ✅      | ❌     | ❌      | ❌         |
| Monitor live (silent)       | ✅      | ✅     | ✅      | ✅         |
| Parent mode toggle          | ❌      | ❌     | ✅      | ❌         |
| Delete recordings           | ✅      | ❌     | ❌      | ❌         |
| Video library (read)        | ✅      | ✅     | ✅      | ❌         |
| Staff video meetings        | ❌      | ❌     | ❌      | ✅         |
| Institution logo watermark  | ✅      | ✅     | ✅      | ✅         |
