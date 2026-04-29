import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { useSchoolData } from '../../../../contexts/SchoolDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { AppTheme, AppTypography, ModalShell, AppButton, AppRadius, AppShadows } from '../../../design-system';

const StyledLinearGradient = styled(LinearGradient);

interface SystemHealthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({
  visible,
  onClose,
}) => {
  const { healthStatus, dbLatency, users } = useSchoolData();

  // Animation values for subtle motion
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  const isOffline = healthStatus === 'Offline';
  const baseTraffic = isOffline ? 0 : (users?.length || 0) * 0.35; 
  const activeTraffic = Math.max(0, baseTraffic + Math.sin(Date.now() / 5000) * 2).toFixed(1);
  const capacityPercent = isOffline ? 0 : Math.min(95, Math.max(5, ((users?.length || 0) / 100) * 100));

  const healthMetrics = [
    { label: 'API Gateway', status: healthStatus === 'Optimal' ? 'Healthy' : 'Degraded', value: isOffline ? '∞' : `${(dbLatency * 0.8).toFixed(0)}ms`, icon: 'Signal', color: healthStatus === 'Optimal' ? '#10b981' : '#f59e0b' },
    { label: 'DB Cluster', status: healthStatus === 'Optimal' ? 'Optimal' : 'Throttled', value: isOffline ? '∞' : `${dbLatency}ms`, icon: 'Database', color: healthStatus === 'Optimal' ? '#10b981' : '#f59e0b' },
    { label: 'Cache Node', status: isOffline ? 'Offline' : 'Healthy', value: isOffline ? '0%' : '12%', icon: 'Check', color: isOffline ? '#ef4444' : '#3b82f6' },
    { label: 'Auth Crypto', status: isOffline ? 'Offline' : 'Healthy', value: isOffline ? '∞' : '99ms', icon: 'Lock', color: isOffline ? '#ef4444' : '#8b5cf6' },
  ];

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="System Status"
      subtitle={`Overall Health: ${healthStatus}`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      {/* Status Sentinel - Platinum Alert/Success Plate */}
      <View className={`p-5 rounded-[24px] border-2 mb-8 flex-row items-center ${
          healthStatus === 'Optimal' ? 'bg-white border-emerald-500/10' : 'bg-white border-rose-500/10'
      } shadow-sm`}>
          <Animated.View 
              style={{ transform: [{ scale: healthStatus === 'Optimal' ? pulseAnim : 1 }] }}
              className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${healthStatus === 'Optimal' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-lg`}
          >
              <Icons.Check size={20} color="white" />
          </Animated.View>
          <View className="flex-1">
              <Text className="text-[15px] font-black text-gray-900 tracking-tight">
                System {healthStatus === 'Optimal' ? 'Operational' : 'Shift Detected'}
              </Text>
              <Text className={`text-[9px] font-black uppercase tracking-[1.5px] mt-1 ${healthStatus === 'Optimal' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {healthStatus === 'Optimal' ? 'All protocols executing at peak efficiency' : 'Partial service degradation in secondary nodes'}
              </Text>
          </View>
      </View>

      <View className="flex-row items-center mb-4 px-1">
          <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
          <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">App Performance</Text>
      </View>

      {/* Metrics Grid - Platinum Interactive Cards */}
      <View className="flex-row flex-wrap -mx-2 mb-8">
          {healthMetrics.map((m, i) => (
              <View key={i} className="w-[50%] px-2 mb-4">
                  <View className={`${AppTheme.card.interactive} p-5`}>
                      <View className="flex-row justify-between items-start mb-4">
                          <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                              <Icons.Activity size={18} color={m.color} />
                          </View>
                          <Text className="text-sm font-black text-gray-900 tracking-tighter">{m.value}</Text>
                      </View>
                      <Text className="text-[10px] font-black text-gray-800 uppercase tracking-widest" numberOfLines={1}>{m.label}</Text>
                      <View className="flex-row items-center mt-1.5">
                          <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: m.color }} />
                          <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: m.color }}>{m.status}</Text>
                      </View>
                  </View>
              </View>
          ))}
      </View>

      {/* Traffic Node - Deep Platinum Gradient */}
      <StyledLinearGradient 
        colors={isOffline ? ['#f8fafc', '#f1f5f9'] : ['#1e1b4b', '#4338ca', '#312e81']} 
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 1}} 
        className="p-6 rounded-[32px] shadow-2xl mb-10 overflow-hidden relative"
      >
          <View className="flex-row justify-between items-center mb-6 relative z-10">
              <View>
                  <Text className={`font-black uppercase text-[10px] tracking-[3px] mb-1.5 ${isOffline ? 'text-gray-400' : 'text-indigo-300'}`}>Global Load Status</Text>
                  <Text className={`text-2xl font-black tracking-tighter ${isOffline ? 'text-gray-300' : 'text-white'}`}>
                    {activeTraffic}k <Text className="text-[10px] font-black opacity-60">req/sec</Text>
                  </Text>
              </View>
              <View className={`px-4 py-1.5 rounded-xl border ${isOffline ? 'bg-gray-200 border-gray-300' : 'bg-white/10 border-white/20 backdrop-blur-md'}`}>
                  <Text className={`text-[10px] font-black uppercase tracking-[2px] ${isOffline ? 'text-gray-500' : 'text-white'}`}>Live</Text>
              </View>
          </View>
          
          <View className={`h-2.5 rounded-full overflow-hidden ${isOffline ? 'bg-gray-200' : 'bg-white/10'} relative z-10`}>
              <View 
                className={`h-full rounded-full ${isOffline ? 'bg-gray-400' : 'bg-emerald-400 shadow-lg shadow-emerald-500/50'}`} 
                style={{ width: `${capacityPercent}%` }} 
              />
          </View>
          
          <View className="flex-row justify-between mt-3 relative z-10">
              <Text className={`text-[9px] font-black uppercase tracking-widest ${isOffline ? 'text-gray-300' : 'text-white/40'}`}>0% Utilization</Text>
              <Text className={`text-[9px] font-black uppercase tracking-widest ${isOffline ? 'text-gray-300' : 'text-white/40'}`}>100% Limit</Text>
          </View>

          <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
              <Icons.Grid size={180} color="white" />
          </View>
      </StyledLinearGradient>

      <AppButton 
        label="Close Status"
        onPress={onClose}
        className="py-5"
        variant="primary"
      />
    </ModalShell>
  );
};
