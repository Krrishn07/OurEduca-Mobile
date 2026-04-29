import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../../lib/supabase';
import { PlatformCard } from '../components/PlatformCard';
import { PlatformStatusBadge } from '../components/PlatformStatusBadge';
import * as DocumentPicker from 'expo-document-picker';
import { PlatformColors, PlatformRadius, PlatformTheme, PlatformShadows } from '../theme';

interface InstituteDetailsProps {
  institute: any;
  onBack: () => void;
  onAction: (type: 'SUSPEND' | 'VERIFY' | 'RESET_PASSWORD' | 'MESSAGE' | 'REACTIVATE' | 'CUSTOMIZE_ACCESS') => void;
  onUpdateLogo?: (id: string, file: any) => Promise<void>;
}

export const InstituteDetails: React.FC<InstituteDetailsProps> = ({
  institute,
  onBack,
  onAction,
  onUpdateLogo,
}) => {
  const [headmaster, setHeadmaster] = useState<any>(null);
  const [stats, setStats] = useState({ students: 0, staff: 0, classes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchInstituteData();
  }, [institute.id]);

  const handleLogoPicker = async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({
              type: 'image/*',
              copyToCacheDirectory: true
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              setIsUploading(true);
              if (onUpdateLogo) {
                  await onUpdateLogo(institute.id, {
                      uri: asset.uri,
                      name: asset.name,
                      type: asset.mimeType || 'image/jpeg'
                  });
              }
          }
      } catch (err) {
          console.error('Logo picker error:', err);
      } finally {
          setIsUploading(false);
      }
  };

  const fetchInstituteData = async () => {
    setIsLoading(true);
    try {
      const { data: hmData } = await supabase
        .from('users')
        .select('*')
        .eq('school_id', institute.id)
        .eq('role', 'headmaster')
        .single();
      
      setHeadmaster(hmData);

      const [
        { count: studentCount },
        { count: staffCount },
        { count: classCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', institute.id).eq('role', 'student'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', institute.id).neq('role', 'student'),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', institute.id)
      ]);

      setStats({
        students: studentCount || 0,
        staff: staffCount || 0,
        classes: classCount || 0
      });

    } catch (err) {
      console.error('Error fetching institute details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
        className="flex-1 bg-surface-subtle" 
        contentContainerStyle={{ paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
    >
      {/* 1. Platinum Header Banner - Simplified Naming */}
      <LinearGradient
        colors={PlatformColors.gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}
        className="pt-16 pb-28 px-6 shadow-2xl"
      >
        <View className="flex-row justify-between items-center mb-10">
            <TouchableOpacity 
                onPress={onBack}
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 active:scale-90"
            >
                <Icons.Close size={22} color="white" />
            </TouchableOpacity>
            <View className="bg-white/10 px-5 py-2 rounded-full border border-white/10">
                <Text className="text-[10px] font-black text-white uppercase tracking-[2px]">School Details</Text>
            </View>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleLogoPicker}
            disabled={isUploading}
            className="w-28 h-28 bg-white rounded-[32px] items-center justify-center shadow-2xl relative overflow-hidden border-4 border-white/10 active:scale-95"
          >
            {isUploading ? (
                <ActivityIndicator color={PlatformColors.primary} />
            ) : institute.logo_url ? (
                <Image 
                    source={{ uri: institute.logo_url }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            ) : (
                <Icons.School size={40} color={PlatformColors.primary} opacity={0.3} />
            )}
            {!isUploading && (
                <View className="absolute bottom-0 right-0 left-0 bg-black/40 py-1.5 items-center">
                    <Icons.Camera size={12} color="white" />
                </View>
            )}
          </TouchableOpacity>

          <View className="ml-5 flex-1">
            <Text className="text-2xl font-black text-white tracking-tighter leading-8">{institute.name}</Text>
            <View className="flex-row items-center mt-2.5">
              <PlatformStatusBadge 
                status={institute.status === 'ACTIVE' ? 'Verified School' : 'Needs Review'} 
                type={institute.status === 'ACTIVE' ? 'success' : 'warning'} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* 2. Stats Grid - High-Density Metrics */}
      <View className="px-6 -mt-16">
        <View className="flex-row gap-4 mb-4">
          <View className={`flex-1 bg-white p-5 ${PlatformRadius.primary} ${PlatformShadows.sm} border border-white items-center`}>
            <View className="w-10 h-10 bg-primary-10 rounded-xl mb-3 items-center justify-center">
              <Icons.Users size={20} color={PlatformColors.primary} />
            </View>
            <Text className="text-xl font-black text-gray-900 tracking-tighter">{stats.students}</Text>
            <Text className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Students</Text>
          </View>
          <View className={`flex-1 bg-white p-5 ${PlatformRadius.primary} ${PlatformShadows.sm} border border-white items-center`}>
            <View className="w-10 h-10 bg-violet-50 rounded-xl mb-3 items-center justify-center">
              <Icons.GraduationCap size={20} color="#7c3aed" />
            </View>
            <Text className="text-xl font-black text-gray-900 tracking-tighter">{stats.staff}</Text>
            <Text className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Teachers</Text>
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className={`flex-1 bg-white p-5 ${PlatformRadius.primary} ${PlatformShadows.sm} border border-white items-center`}>
            <View className="w-10 h-10 bg-orange-50 rounded-xl mb-3 items-center justify-center">
              <Icons.Calendar size={20} color="#f97316" />
            </View>
            <Text className="text-xl font-black text-gray-900 tracking-tighter">{stats.classes}</Text>
            <Text className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Classes</Text>
          </View>
          <View className={`flex-1 bg-white p-5 ${PlatformRadius.primary} ${PlatformShadows.sm} border border-white items-center`}>
            <View className={`w-10 h-10 rounded-xl mb-3 items-center justify-center ${
                institute.status === 'ACTIVE' ? 'bg-emerald-50' : 'bg-rose-50'
            }`}>
              <Icons.Clock size={20} color={institute.status === 'ACTIVE' ? PlatformColors.success : PlatformColors.error} />
            </View>
            <Text className={`text-[15px] font-black tracking-tighter ${
                institute.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
                {institute.status === 'ACTIVE' ? 'Active' : 'Paused'}
            </Text>
            <Text className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Account</Text>
          </View>
        </View>
      </View>

      {/* 3. Detailed Information Sections */}
      <View className="px-6 pt-8">
        {/* Plan Details */}
        <PlatformCard className="mb-4 border border-white">
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-4">Plan Details</Text>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 items-center justify-center rounded-2xl ${
                        institute.plan === 'Enterprise' ? 'bg-amber-50' : 'bg-primary-10'
                    }`}>
                        <Icons.Shield size={24} color={institute.plan === 'Enterprise' ? '#b45309' : PlatformColors.primary} />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="font-black text-gray-900 text-lg tracking-tight">{institute.plan || 'Basic'} Plan</Text>
                        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-tight mt-0.5">Renews Mar 2027</Text>
                    </View>
                </View>
            </View>
        </PlatformCard>

        {/* Admin Contact Card */}
        <PlatformCard className="mb-8 border border-white">
          <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-5">Admin Contact</Text>
          {isLoading ? (
            <ActivityIndicator color={PlatformColors.primary} size="small" />
          ) : headmaster ? (
            <>
              <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-primary-10 rounded-2xl items-center justify-center border border-primary/5">
                  <Icons.Profile size={24} color={PlatformColors.primary} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-black text-gray-900 text-lg tracking-tight">{headmaster.name}</Text>
                  <Text className="text-gray-400 font-bold text-[9px] uppercase tracking-[1px] mt-1">Principal / Admin</Text>
                </View>
              </View>
              
              <View className="gap-3">
                <View className="flex-row items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <Icons.Mail size={12} color={PlatformColors.primary} />
                  <Text className="ml-3 text-gray-700 font-black text-[13px]">{headmaster.email?.toLowerCase()}</Text>
                </View>
                <View className="flex-row items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <Icons.Phone size={12} color={PlatformColors.primary} />
                  <Text className="ml-3 text-gray-700 font-black text-[13px]">{headmaster.phone || "Not Provided"}</Text>
                </View>
              </View>
            </>
          ) : (
            <View className="py-8 items-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Text className="text-gray-400 font-black text-[9px] uppercase tracking-[2px]">No Admin Account Found</Text>
            </View>
          )}
        </PlatformCard>

        {/* 4. Action Protocol - Simplified Naming */}
        <View className="mb-10">
          <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-4 px-2">School Actions</Text>
          
          <View className="gap-3">
            {institute.status === 'PENDING' && (
                <TouchableOpacity 
                    onPress={() => onAction('VERIFY')}
                    className="bg-primary flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Icons.Check size={18} color="white" />
                    <Text className="text-white font-black text-[10px] uppercase tracking-[2px] ml-3">Verify School</Text>
                </TouchableOpacity>
            )}

            {institute.status === 'ACTIVE' && (
                <TouchableOpacity 
                    onPress={() => onAction('SUSPEND')}
                    className="bg-error-10 border border-error/5 flex-row items-center justify-center py-4 rounded-2xl active:scale-95"
                >
                    <Icons.Shield size={16} color={PlatformColors.error} />
                    <Text className="text-error font-black text-[10px] uppercase tracking-[2px] ml-3">Pause Account</Text>
                </TouchableOpacity>
            )}

            {institute.status === 'SUSPENDED' && (
                <TouchableOpacity 
                    onPress={() => onAction('REACTIVATE')}
                    className="bg-success flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-emerald-100 active:scale-95"
                >
                    <Icons.Check size={18} color="white" />
                    <Text className="text-white font-black text-[10px] uppercase tracking-[2px] ml-3">Unpause Account</Text>
                </TouchableOpacity>
            )}

            {institute.status === 'ACTIVE' && (
                <TouchableOpacity 
                    onPress={() => onAction('CUSTOMIZE_ACCESS')}
                    className="bg-white flex-row items-center justify-center py-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95"
                >
                    <Icons.Shield size={16} color={PlatformColors.primary} />
                    <Text className="text-primary font-black text-[10px] uppercase tracking-[2px] ml-3">Manage Permissions</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity 
                onPress={() => onAction('RESET_PASSWORD')}
                className="bg-white flex-row items-center justify-center py-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95"
            >
                <Icons.Lock size={16} color="#9ca3af" />
                <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[2px] ml-3">Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
