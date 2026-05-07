import React, { useState, useEffect, useRef } from 'react';
import { Image, Modal, Platform, ScrollView, Text, TouchableOpacity, View, InteractionManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from './Icons';
import { UserRole } from '../types';
import { SCHOOL_CONFIG } from '../constants';
import { GlobalAIChat } from './GlobalAIChat';
import { useSchoolData } from '../contexts/SchoolDataContext';
import { useSystemStatus } from '../contexts/SystemStatusContext';
import { AppCard } from '../src/design-system';
import { useIsConnected } from '../src/utils/connectivity';
import { Animated } from 'react-native';

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
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);

  // Sync local tab with prop when it changes externally
  useEffect(() => {
    setLocalActiveTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    // Immediate UI update for both local state and parent state
    setLocalActiveTab(tabId);
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
      <View className="bg-white border-b border-gray-100 h-16 flex-row items-center justify-between px-5 shadow-sm z-10 shrink-0">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-100 items-center justify-center bg-white mr-3 shadow-sm shadow-indigo-100/30">
            {isPlatformAdmin ? (
              <View className="w-full h-full items-center justify-center bg-indigo-50">
                <Icons.Classes size={18} color="#4f46e5" />
              </View>
            ) : currentSchool?.logo_url ? (
              <Image source={{ uri: currentSchool.logo_url }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="w-full h-full items-center justify-center bg-gray-50">
                <Icons.School size={16} color="#94a3b8" />
              </View>
            )}
          </View>

          <View className="justify-center">
            <Text className="text-[15px] font-black text-gray-900 leading-tight tracking-tighter font-inter-black">
              {isPlatformAdmin ? platformSettings.platformName : (currentSchool?.name || SCHOOL_CONFIG.name)}
            </Text>
            <Text className="text-[8px] text-gray-400 font-black uppercase tracking-[2px] mt-0.5 font-inter-black">
              {isPlatformAdmin ? 'Platform Authority' : 'Institutional Portal'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center space-x-1.5">
            {(isPlatformAdmin || isHeadmaster || isStudentOrParent) && hasPermission('Messaging', role, currentSchool?.id) && (
              <TouchableOpacity
                onPress={() => handleTabChange('messages')}
                className={`w-9 h-9 items-center justify-center rounded-xl ${localActiveTab === 'messages' ? 'bg-indigo-50 border border-indigo-100' : ''}`}
              >
                <Icons.Messages size={18} color={localActiveTab === 'messages' ? '#4f46e5' : '#94a3b8'} />
                {isStudentOrParent ? <View className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" /> : null}
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setShowHelp(true)} className="w-9 h-9 items-center justify-center rounded-xl active:bg-gray-50">
              <Icons.Phone size={18} color="#94a3b8" />
            </TouchableOpacity>

            <View className="hidden lg:flex flex-row items-center px-3 py-1.5 bg-slate-50 rounded-full border border-gray-100 mx-2">
              <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
              <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">{role?.replace('_', ' ') || 'User'}</Text>
            </View>

            <TouchableOpacity onPress={onLogout} className="w-9 h-9 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 active:bg-red-50">
              <Icons.Logout size={18} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-1 flex-row relative">
        <View className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200">
          <ScrollView className="flex-1 py-5 px-4">
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleTabChange(item.id)}
                className={`w-full flex-row items-center px-4 py-3.5 mb-2 rounded-[20px] border ${localActiveTab === item.id ? 'bg-indigo-50 border-indigo-100 shadow-sm shadow-indigo-100/40' : 'border-transparent'}`}
              >
                <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${localActiveTab === item.id ? 'bg-white border border-indigo-100' : 'bg-slate-50 border border-gray-100'}`}>
                  <item.icon size={18} color={localActiveTab === item.id ? '#4f46e5' : '#4b5563'} />
                </View>
                <View className="flex-1 flex-row items-center justify-between">
                  <Text className={`text-sm font-black tracking-tight font-inter-black ${localActiveTab === item.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {item.label}
                  </Text>
                  {!hasPermission(item.id, role, currentSchool?.id) ? <Icons.Lock size={12} color="#9ca3af" /> : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-1 bg-slate-50">
          <View className="flex-1 w-full bg-slate-50">{children}</View>
        </View>
      </View>

      <View className="md:hidden bg-white border-t border-gray-200 flex-row justify-around items-center h-16 z-20 shadow-lg px-2" style={{ paddingBottom: Platform.OS === 'ios' ? 10 : 0 }}>
        {navItems.filter((item) => !(role === UserRole.SUPER_ADMIN && item.id === 'messages')).map((item) => (
          <TouchableOpacity key={item.id} onPress={() => handleTabChange(item.id)} className="flex-1 items-center justify-center space-y-1 h-full">
            <View className="relative">
              <item.icon size={24} color={localActiveTab === item.id ? '#4f46e5' : '#9ca3af'} />
              {!hasPermission(item.id, role, currentSchool?.id) ? <View className="absolute -top-1 -right-1 bg-white rounded-full"><Icons.Lock size={10} color="#6b7280" /></View> : null}
            </View>
            <Text className={`text-[10px] font-medium mt-1 font-inter-medium ${localActiveTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isLiveSessionActive && activeTab !== 'messages' ? <GlobalAIChat role={role} /> : null}

      <Modal visible={showHelp} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <AppCard className="w-full max-w-sm overflow-hidden p-0">
            <StyledLinearGradient colors={['#6366f1', '#4338ca', '#312e81']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="px-6 py-5 flex-row justify-between items-center">
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

            <View className="p-5 bg-gray-50/30">
              <View className="flex-row items-center p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
                <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 border border-white" />
                <View className="flex-1">
                  <Text className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1 font-inter-black">System Health</Text>
                  <Text className="text-[11px] font-black text-emerald-900 tracking-tight font-inter-black">Optimal Connection Secured</Text>
                </View>
                <Icons.Shield size={12} color="#10b981" />
              </View>

              <View className="gap-2.5">
                <AppCard className="flex-row items-center p-3.5">
                  <View className="w-9 h-9 bg-gray-50 rounded-xl items-center justify-center mr-3.5 border border-gray-100">
                    <Icons.Phone size={16} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 font-inter-black">Official Hotline</Text>
                    <Text className="text-[13px] font-black text-gray-900 tracking-tight font-inter-black">{platformSettings.supportPhone}</Text>
                  </View>
                </AppCard>

                <AppCard className="flex-row items-center p-3.5">
                  <View className="w-9 h-9 bg-gray-50 rounded-xl items-center justify-center mr-3.5 border border-gray-100">
                    <Icons.Mail size={16} color="#4f46e5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 font-inter-black">Digital Desk</Text>
                    <Text className="text-[13px] font-black text-indigo-600 tracking-tight font-inter-black">{platformSettings.supportEmail}</Text>
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
