import React, { useState, Component, ErrorInfo } from 'react';
import { View, Text, StatusBar, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserRole } from './types';
import { SchoolDataProvider, useSchoolData } from './contexts/SchoolDataContext';
import { MockAuthProvider, useMockAuth } from './contexts/MockAuthContext';
import { DevSimulationOverlay } from './components/DevSimulationOverlay';

class GlobalErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: any, info: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("CRITICAL ERROR BOUNDARY CAUGHT AN ERROR:", error.stack);
    console.error("CRITICAL ERROR BOUNDARY TRACE:", info.componentStack);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fee2e2', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#991b1b', marginBottom: 10 }}>Global App Crash Detected</Text>
          <Text style={{ color: '#b91c1c', marginBottom: 10 }}>{this.state.error?.toString()}</Text>
          <ScrollView style={{ flex: 1, backgroundColor: '#fef2f2', padding: 10 }}>
            <Text style={{ fontSize: 10, color: '#7f1d1d' }}>JS Stack: {this.state.error?.stack}</Text>
            <Text style={{ fontSize: 10, color: '#7f1d1d', marginTop: 10 }}>Component Stack: {this.state.info?.componentStack}</Text>
          </ScrollView>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

import { NotificationService } from './src/features/platform/services/NotificationService';
import * as Notifications from 'expo-notifications';

// ============================================================
// Inner app — has access to MockAuthContext
// ============================================================
function AppInner() {
  const { currentUser, currentUserRole, clearSession, currentSchool, updatePushToken } = useMockAuth();
  const { clearInstitutionalData } = useSchoolData();
  const [activeTab, setActiveTab] = useState('home');
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = React.useRef<any>();
  const responseListener = React.useRef<any>();

  // Global Notification Handshake
  React.useEffect(() => {
    NotificationService.registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // If user is already logged in, sync token to Supabase immediately
        if (currentUser) updatePushToken(token);
      }
    });

    notificationListener.current = NotificationService.addNotificationListener(notification => {
      console.log('[GLOBAL_NOTIFICATION] Foreground Event:', notification);
    });

    responseListener.current = NotificationService.addNotificationResponseListener(response => {
      console.log('[GLOBAL_NOTIFICATION] Interaction Event:', response);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Sync token if user logs in later
  React.useEffect(() => {
    if (currentUser && expoPushToken && !currentUser.expo_push_token) {
      updatePushToken(expoPushToken);
    }
  }, [currentUser, expoPushToken]);

  const handleLogout = () => {
    clearInstitutionalData();
    clearSession();
    setActiveTab('home');
  };

  const renderDashboard = () => {
    switch (currentUserRole) {
      case UserRole.STUDENT:
      case UserRole.PARENT:
        return <StudentDashboard role={currentUserRole} activeTab={activeTab} onNavigate={setActiveTab} />;
      case UserRole.TEACHER:
        return <TeacherDashboard activeTab={activeTab} onNavigate={setActiveTab} />;
      case UserRole.ADMIN_TEACHER:
        return <AdminDashboard role={currentUserRole} activeTab={activeTab} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case UserRole.SUPER_ADMIN:
      case UserRole.PLATFORM_ADMIN:
        return <AdminDashboard role={currentUserRole} activeTab={activeTab} onNavigate={setActiveTab} onLogout={handleLogout} />;
      default:
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <Text style={{ color: '#6b7280', fontWeight: '500' }}>Role not supported yet</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      {!currentUserRole ? (
        <Login onLogin={() => {
          // Login.tsx calls onLogin(role) after its OTP flow.
          // Role is now set in MockAuthContext by Login.tsx before calling this.
          // We only reset the tab here.
          setActiveTab('home');
        }} />
      ) : (
        <Layout
          role={currentUserRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          currentSchool={currentSchool}
        >
          {renderDashboard()}
        </Layout>
      )}
      <DevSimulationOverlay />
    </SafeAreaView>
  );
}

// ============================================================
// Root — provides all context providers
// ============================================================
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  if (!fontsLoaded && !fontError) {
    return null; // Native splash screen stays visible while fonts load
  }

  return (
    <SafeAreaProvider>
        <GlobalErrorBoundary>
            <MockAuthProvider>
                <SchoolDataProvider>
                    <AppInner />
                </SchoolDataProvider>
            </MockAuthProvider>
        </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
