import * as React from 'react';
import { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, useWindowDimensions, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from '@components/common/Icons';
import { User } from '@/types';
import { AppTheme } from '@constants/Theme';
import { AppCard, AppRow, StatusPill, SectionHeader, Skeleton, SkeletonCard, AvatarShimmer } from '@components/common';
import { USER_DEFAULTS } from '@constants/user';
import { triggerHaptic, HapticPatterns } from '@utils/haptics';

const StyledLinearGradient = LinearGradient;
const AnimatedGradient = Animated.createAnimatedComponent(StyledLinearGradient);

interface TeacherProfileProps {
  currentUser: User | null;
  onEdit: () => void;
  onAccountSecurity?: () => void;
  onLogout: () => void;
  recentActivity?: any[];
}

export const TeacherProfile = React.memo<TeacherProfileProps>(({
  currentUser,
  onEdit,
  onAccountSecurity,
  onLogout,
  recentActivity = [],
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [maskEmail, setMaskEmail] = useState(true);
  const [maskPhone, setMaskPhone] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const emailOpacity = useRef(new Animated.Value(1)).current;
  const phoneOpacity = useRef(new Animated.Value(1)).current;

  const toggleEmail = () => {
    triggerHaptic();
    Animated.timing(emailOpacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setMaskEmail(prev => !prev);
      Animated.timing(emailOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  };

  const togglePhone = () => {
    triggerHaptic();
    Animated.timing(phoneOpacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setMaskPhone(prev => !prev);
      Animated.timing(phoneOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLocalAvatarUri(result.assets[0].uri);
        setAvatarError(false);
        HapticPatterns.success();
      }
    } catch (error) {
      Alert.alert("Error", "Could not access your photo library.");
    }
  };

  const avatarScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  if (!currentUser) {
    return (
      <View className="flex-1 bg-[#f8faff]">
        <Skeleton width="100%" height={height * 0.15 + insets.top} borderRadius={0} className="rounded-b-[40px]" />
        <View className="px-6 -mt-6">
          <AvatarShimmer />
          <View className="mt-4">
            <Skeleton width="60%" height={24} className="mb-2" />
            <Skeleton width="30%" height={16} />
          </View>
        </View>
        <View className="px-4 mt-8">
          <Skeleton width={120} height={20} className="mb-4" />
          <SkeletonCard height={180} />
          <View className="h-8" />
          <Skeleton width={120} height={20} className="mb-4" />
          <SkeletonCard height={120} />
        </View>
      </View>
    );
  }

  const handleLogout = () => {
    HapticPatterns.warning();
    Alert.alert(
      "Sign Out?",
      "Are you sure you want to end your session? You will need to log in again to access the faculty dashboard.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: onLogout 
        }
      ]
    );
  };

  const getMaskedEmail = (email: string) => {
    if (!email || !maskEmail) return email;
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const visible = Math.min(2, name.length);
    return `${name.substring(0, visible)}***@${domain}`;
  };

  const getMaskedPhone = (phone: string) => {
    if (!phone || !maskPhone) return phone;
    const cleaned = phone.replace(/\s+/g, '');
    const prefix = phone.slice(0, 3);
    return `${prefix} ••••••${cleaned.slice(-4)}`;
  };

  return (
    <Animated.ScrollView 
      className="flex-1 bg-[#f8faff]" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      <View className="relative z-10">
        <AnimatedGradient
          colors={AppTheme.colors.gradients.brand}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={{ 
            paddingTop: insets.top, 
            height: height * 0.15 + insets.top,
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 150],
                outputRange: [0, -height * 0.04],
                extrapolate: 'clamp',
              })
            }]
          }}
          className="rounded-b-[40px] shadow-xl shadow-indigo-200/50 overflow-hidden"
        >
          <View className="absolute inset-0 items-center justify-center opacity-[0.08]">
            <Icons.Globe size={height * 0.2} color="white" />
          </View>
        </AnimatedGradient>

        <Animated.View 
          style={{ 
            opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0.6], extrapolate: 'clamp' }),
            transform: [{
              scale: scrollY.interpolate({ inputRange: [0, 150], outputRange: [1, 0.92], extrapolate: 'clamp' })
            }]
          }}
          className="absolute top-12 right-[-40px] w-48 h-48 rounded-full bg-white/8 blur-3xl" 
        />
      </View>

      <View className="px-6 relative z-20 -mt-6 mb-7">
        <View className="flex-row items-center">
          <Animated.View
            style={{
               transform: [{ scale: avatarScale }]
            }}
            className="relative"
          >
            <Pressable 
              onPress={pickImage}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.95 : 1,
              })}
              className="p-2 rounded-[24px] bg-white shadow-lg shadow-indigo-200/30 border border-white self-start"
            >
              <View className="w-20 h-20 rounded-[20px] bg-indigo-50/60 items-center justify-center border border-indigo-100 overflow-hidden shadow-inner relative">
                <View className="absolute inset-0 rounded-[20px] border border-white/60 z-10" pointerEvents="none" />
                {(localAvatarUri || (currentUser?.avatar && !avatarError)) ? (
                  <Image 
                    source={{ uri: localAvatarUri || currentUser.avatar! }} 
                    className="w-full h-full" 
                    resizeMode="cover" 
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <Text className="text-2xl text-indigo-600 tracking-tighter font-inter-black">
                    {currentUser?.name?.charAt(0) || 'T'}
                  </Text>
                )}
                <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => { triggerHaptic(); onEdit(); }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
              className="absolute -bottom-1 -right-1 bg-white shadow-xl shadow-indigo-200/40 p-2 rounded-xl border border-indigo-50"
            >
              <Icons.Edit size={16} color="#4f46e5" />
            </Pressable>
          </Animated.View>
        </View>

        <View className="mt-2">
          <Text 
            className="text-xl text-gray-900 tracking-[-0.5px] leading-none mb-2 font-inter-black"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentUser.name ?? USER_DEFAULTS.name}
          </Text>
          <View className="flex-row items-center">
            <StatusPill label={`${USER_DEFAULTS.role} Faculty`} type="info" />
          </View>
        </View>
      </View>

      <View className="px-4 mb-6">
        <SectionHeader
          title="PERSONAL INFORMATION"
          className="mb-3"
        />
        <AppCard className="p-0 overflow-hidden border border-white shadow-sm">
          <AppRow 
            title={
              <Animated.Text 
                style={{ opacity: emailOpacity }} 
                className="text-[13px] font-black tracking-tight font-inter-black leading-tight text-gray-900"
              >
                {getMaskedEmail(currentUser.email || USER_DEFAULTS.email)}
              </Animated.Text>
            }
            subtitle="Primary Email"
            avatarIcon={<Icons.Mail size={15} color="#4f46e5" />}
            avatarBg="rgba(238, 242, 255, 0.6)"
            onPress={toggleEmail}
            showBorder={true}
            rightElement={<Icons.Eye size={13} color={maskEmail ? "#d1d5db" : "#4f46e5"} />}
            innerClassName="bg-indigo-50/40"
          />
          <AppRow 
            title={
              <Animated.Text 
                style={{ opacity: phoneOpacity }} 
                className="text-[13px] font-black tracking-tight font-inter-black leading-tight text-gray-700"
              >
                {getMaskedPhone(currentUser.phone || USER_DEFAULTS.phone)}
              </Animated.Text>
            }
            subtitle="Direct Line"
            avatarIcon={<Icons.Phone size={15} color="#4f46e5" />}
            avatarBg="rgba(238, 242, 255, 0.6)"
            onPress={togglePhone}
            showBorder={true}
            rightElement={<Icons.Eye size={13} color={maskPhone ? "#d1d5db" : "#4f46e5"} />}
          />
          <AppRow 
            title={currentUser.office || USER_DEFAULTS.office}
            subtitle="Faculty Office"
            avatarIcon={<Icons.Globe size={15} color="#4f46e5" />}
            avatarBg="rgba(238, 242, 255, 0.6)"
            showBorder={false}
            rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
            titleClassName="text-gray-700"
          />
        </AppCard>
      </View>

      <View className="px-4 mb-10">
        <SectionHeader
          title="ACCOUNT & SECURITY"
          className="mb-3"
        />
        <AppCard className="p-0 overflow-hidden border border-white shadow-sm">
          <AppRow 
            title="Security Settings"
            subtitle="Password & Security"
            avatarIcon={<Icons.Lock size={15} color="#4f46e5" />}
            avatarBg="rgba(238, 242, 255, 0.6)"
            onPress={onAccountSecurity}
            showBorder={true}
            rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
          />
          <AppRow 
            title="Logout"
            subtitle="Sign out safely"
            avatarIcon={<Icons.Logout size={15} color="#e11d48" />}
            avatarBg="rgba(255, 241, 242, 0.6)"
            onPress={handleLogout}
            showBorder={false}
            innerClassName="bg-rose-50/40"
            titleClassName="text-rose-600"
            subtitleClassName="text-rose-400"
            rightElement={<Icons.ChevronRight size={13} color="#e11d48" />}
          />
        </AppCard>
      </View>

      <View className="px-4 mb-10">
        <SectionHeader
          title="RECENT ACTIVITY"
          className="mb-3"
          rightElement={
            <StatusPill 
              label="LOGS" 
              type="neutral" 
            />
          }
        />
        <AppCard className="p-0 overflow-hidden border border-white shadow-sm">
          {recentActivity.length > 0 ? recentActivity.map((act, idx) => (
            <AppRow
              key={act.id || idx}
              title={act.title}
              subtitle={`${act.user} • ${act.time}`}
              avatarIcon={act.icon}
              avatarBg={act.bg}
              showBorder={idx < recentActivity.length - 1}
              rightElement={<Icons.ChevronRight size={12} color="#d1d5db" />}
            />
          )) : (
              <View className="items-center py-10">
                  <Icons.Notifications size={20} color="#cbd5e1" />
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mt-2">No recent system activity</Text>
              </View>
          )}
        </AppCard>
      </View>

      <View className="px-4 mb-10">
          <View className="w-8 h-0.5 bg-gray-300 rounded-full mb-4" />
          <Text className="text-[9px] text-gray-400 uppercase tracking-[2px] font-inter-black">Verified Faculty Node</Text>
          <Text className="text-[8px] text-gray-400 mt-1 uppercase tracking-[1px] font-inter-black italic">TLS 1.3 SECURE CONNECTION</Text>
        </View>
    </Animated.ScrollView>
  );
});
