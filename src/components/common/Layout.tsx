import React, { useState, useEffect, useRef } from 'react';
import { Image, Modal, Platform, ScrollView, Text, TouchableOpacity, View, InteractionManager, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from './Icons';
import { GlobalAIChat } from './GlobalAIChat';
import { AppCard } from './AppCard';
import { AppTypography } from '@constants/Theme';
import { HapticPatterns } from '@utils/haptics';
import { SHADOWS } from '@constants/shadows';
import { UserRole } from '@/types';
import { SCHOOL_CONFIG } from '@constants';
import { useSchoolData } from '@context/SchoolDataContext';
import { useSystemStatus } from '@context/SystemStatusContext';
import { useIsConnected } from '@utils/connectivity';
import { Navbar, Sidebar, BottomNav } from '@navbar';
// Animated imported above

const ConnectivityBanner = () => {
  const isConnected = useIsConnected();
  const [statusMode, setStatusMode] = useState<'OFFLINE' | 'RECONNECTING' | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setStatusMode('OFFLINE');
    } else if (isConnected && statusMode === 'OFFLINE') {
      setStatusMode('RECONNECTING');
      const timer = setTimeout(() => setStatusMode(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  const [isRendered, setIsRendered] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (statusMode) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -20, duration: 400, useNativeDriver: true })
      ]).start(() => {
          // Extra safety: only set to false if statusMode is still null
          setIsRendered(false);
      });
      
      // Fallback timer if animation callback doesn't fire
      hideTimeoutRef.current = setTimeout(() => {
        setIsRendered(false);
      }, 500);
    }
    return () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [statusMode]);

  if (!isRendered) return null;

  return (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        zIndex: 100
      }}
      className={`py-2 items-center justify-center border-b ${
        statusMode === 'OFFLINE' 
          ? 'bg-amber-500 border-amber-600' 
          : 'bg-emerald-500 border-emerald-600'
      }`}
    >
      <View className="flex-row items-center">
        {statusMode === 'OFFLINE' ? (
          <>
            <Icons.Clock size={12} color="white" />
            <Text className="text-white text-[10px] font-inter-black uppercase tracking-[2px] ml-2">
              You're Offline • Saving your work locally
            </Text>
          </>
        ) : (
          <>
            <Icons.Check size={12} color="white" />
            <Text className="text-white text-[10px] font-inter-black uppercase tracking-[2px] ml-2">
              You're Back Online • Everything synced!
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const StyledLinearGradient = (props: any) => <LinearGradient {...props} />;

interface NavItem {
  icon: any;
  label: string;
  id: string;
}

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  currentSchool?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, activeTab, onTabChange, onLogout, currentSchool }) => {
  const { platformSettings, hasPermission } = useSchoolData();
  const { isLiveSessionActive } = useSystemStatus();
  const [showHelp, setShowHelp] = useState(false);
  const handleTabChange = (tabId: string) => {
    HapticPatterns.tabSwitch();
    onTabChange(tabId);
  };


  const navItems = React.useMemo((): NavItem[] => {
    switch (role) {
      case UserRole.STUDENT:
      case UserRole.PARENT:
        return [
          { id: 'home', label: 'Home', icon: Icons.Home },
          { id: 'classes', label: 'Classes', icon: Icons.Classes },
          { id: 'fees', label: 'Fees', icon: Icons.Payment },
          { id: 'videos', label: 'Videos', icon: Icons.Video },
          { id: 'profile', label: 'Profile', icon: Icons.Profile },
        ];
      case UserRole.TEACHER:
        return [
          { id: 'home', label: 'Home', icon: Icons.Home },
          { id: 'classes', label: 'Classes', icon: Icons.Classes },
          { id: 'videos', label: 'Videos', icon: Icons.Video },
          { id: 'messages', label: 'Messages', icon: Icons.Messages },
          { id: 'profile', label: 'Profile', icon: Icons.Profile },
        ];
      case UserRole.ADMIN_TEACHER:
        return [
          { id: 'home', label: 'Home', icon: Icons.Home },
          { id: 'classes', label: 'Classes', icon: Icons.Classes },
          { id: 'monitor', label: 'Monitor', icon: Icons.Eye },
          { id: 'videos', label: 'Videos', icon: Icons.Video },
          { id: 'messages', label: 'Messages', icon: Icons.Messages },
          { id: 'profile', label: 'Profile', icon: Icons.Profile },
        ];
      case UserRole.SUPER_ADMIN:
        return [
          { id: 'home', label: 'Home', icon: Icons.Home },
          { id: 'manage', label: 'Manage', icon: Icons.Users },
          { id: 'messages', label: 'Messages', icon: Icons.Messages },
          { id: 'fees', label: 'Fees', icon: Icons.Payment },
          { id: 'settings', label: 'Settings', icon: Icons.Settings },
          { id: 'profile', label: 'Profile', icon: Icons.Profile },
        ];
      case UserRole.PLATFORM_ADMIN:
        return [
          { id: 'home', label: 'Home', icon: Icons.Home },
          { id: 'roles', label: 'Roles', icon: Icons.Admin },
          { id: 'institutes', label: 'Institutes', icon: Icons.School },
          { id: 'billing', label: 'Billing', icon: Icons.Payment },
          { id: 'settings', label: 'Settings', icon: Icons.Settings },
          { id: 'profile', label: 'Profile', icon: Icons.Profile },
        ];
      default:
        return [];
    }
  }, [role]);

  const isPlatformAdmin = role === UserRole.PLATFORM_ADMIN;
  const isHeadmaster = role === UserRole.SUPER_ADMIN;
  const isStudentOrParent = role === UserRole.STUDENT || role === UserRole.PARENT;

  return (
    <View className="flex-1 bg-slate-50">
      <ConnectivityBanner />
      <Navbar 
        isPlatformAdmin={isPlatformAdmin}
        platformName={platformSettings.platformName}
        currentSchool={currentSchool}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        setShowHelp={setShowHelp}
        role={role}
        hasPermission={(id) => hasPermission(id, role, currentSchool?.id)}
      />

      <View className="flex-1 flex-row relative">
        <Sidebar 
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          role={role}
          hasPermission={(id) => hasPermission(id, role, currentSchool?.id)}
        />

        <View className="flex-1 bg-slate-50">
          <View className="flex-1 w-full bg-slate-50">{children}</View>
        </View>
      </View>

      <BottomNav 
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={role}
        hasPermission={(id) => hasPermission(id, role, currentSchool?.id)}
      />

      {!isLiveSessionActive && activeTab !== 'messages' ? <GlobalAIChat role={role} /> : null}

      <Modal visible={showHelp} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <AppCard 
            className="w-[90%] max-w-[400px] bg-white rounded-[32px] overflow-hidden"
            style={SHADOWS.level3}
          >
            <StyledLinearGradient colors={['#6366f1', '#4338ca', '#312e81']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="px-6 py-6 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 items-center justify-center mr-3">
                  <Icons.Phone size={16} color="white" />
                </View>
                <View>
                  <Text className="text-white text-[15px] font-black tracking-tighter font-inter-black">Support Center</Text>
                  <Text className="text-indigo-100 text-[8px] font-black uppercase tracking-[2px] font-inter-black">Get Help</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowHelp(false)} className="bg-white/10 p-2 rounded-full border border-white/10">
                <Icons.Close size={16} color="white" />
              </TouchableOpacity>
            </StyledLinearGradient>

            <View className="p-6 bg-gray-50/30">
              <View className="flex-row items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 border border-white" />
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-[1px] leading-none mb-1 font-inter-black">System Health</Text>
                  <Text className="text-[13px] font-medium text-emerald-900 tracking-tight font-inter-black">Optimal Connection Secured</Text>
                </View>
                <Icons.Shield size={12} color="#10b981" />
              </View>

              <View className="gap-2.5">
                <AppCard className="flex-row items-center p-3.5">
                  <View className="w-9 h-9 bg-gray-50 rounded-xl items-center justify-center mr-3.5 border border-gray-100">
                    <Icons.Phone size={16} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                     <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[1px] mb-0.5 font-inter-black">Official Hotline</Text>
                     <Text className="text-[13px] font-medium text-gray-900 tracking-tight font-inter-black">{platformSettings.supportPhone}</Text>
                  </View>
                </AppCard>

                <AppCard className="flex-row items-center p-3.5">
                  <View className="w-9 h-9 bg-gray-50 rounded-xl items-center justify-center mr-3.5 border border-gray-100">
                    <Icons.Mail size={16} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                     <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[1px] mb-0.5 font-inter-black">Digital Desk</Text>
                     <Text className="text-[13px] font-medium text-indigo-600 tracking-tight font-inter-black">{platformSettings.supportEmail}</Text>
                  </View>
                </AppCard>
              </View>

              <View className="mt-6 pt-4 border-t border-gray-100 items-center">
                <Text className="text-[8px] font-black text-gray-300 uppercase tracking-[3px] font-inter-black">Official Support Channels</Text>
              </View>
            </View>
          </AppCard>
        </View>
      </Modal>
    </View>
  );
};
