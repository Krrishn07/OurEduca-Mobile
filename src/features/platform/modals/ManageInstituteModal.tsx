import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface ManageInstituteModalProps {
  visible: boolean;
  onClose: () => void;
  institute: any;
  onAction: (type: string, inst: any) => void;
  onUpdateLogo: (instId: string) => void;
  showToast: (msg: string) => void;
}

export const ManageInstituteModal: React.FC<ManageInstituteModalProps> = ({
  visible,
  onClose,
  institute,
  onAction,
  onUpdateLogo,
  showToast
}) => {
  if (!institute) return null;

  const isSuspended = institute.status === 'SUSPENDED';

  const menuItems = [
    { id: 'SUSPEND', label: isSuspended ? 'Activate' : 'Suspend', icon: isSuspended ? 'Shield' : 'Lock', color: isSuspended ? '#10b981' : '#f43f5e', bg: isSuspended ? 'bg-emerald-50' : 'bg-rose-50' },
    { id: 'RESET_PASSWORD', label: 'Reset Pass', icon: 'Power', color: '#6366f1', bg: 'bg-indigo-50' },
    { id: 'BILLING', label: 'Billing', icon: 'Payment', color: '#f59e0b', bg: 'bg-amber-50' },
    { id: 'VERIFY', label: 'Review', icon: 'Verify', color: '#3b82f6', bg: 'bg-blue-50' }
  ];

  const DataNode = ({ label, value, icon: Icon }: any) => (
    <View className="bg-white p-5 rounded-[24px] border border-gray-50 shadow-sm flex-1 min-w-[140px]">
        <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-xl bg-gray-50 items-center justify-center mr-2 border border-gray-100/50">
                <Icon size={14} color="#6366f1" />
            </View>
            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex-1" numberOfLines={1}>{label}</Text>
        </View>
        <Text className="text-sm font-black text-gray-900 tracking-tight" numberOfLines={1}>{value}</Text>
    </View>
  );

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={institute.name}
      subtitle={`${institute.status} • ${institute.plan}`}
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View>
        {/* Quick Actions Grid */}
        <View className="mb-8">
            <View className="flex-row items-center mb-4 px-1">
                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Administrative Controls</Text>
            </View>
            <View className="flex-row flex-wrap gap-4">
                {menuItems.map((item) => {
                    const Icon = (Icons as any)[item.icon] || Icons.Shield;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                                if (item.id === 'BILLING') { showToast("Opening billing suite..."); onClose(); return; }
                                onAction(item.id === 'SUSPEND' && isSuspended ? 'REACTIVATE' : item.id, institute);
                                onClose();
                            }}
                            activeOpacity={0.7}
                            className={`flex-1 min-w-[140px] p-6 rounded-[32px] border border-white items-center shadow-sm ${item.bg}`}
                        >
                            <View className="w-12 h-12 rounded-2xl bg-white/80 items-center justify-center mb-3 shadow-inner">
                                <Icon size={20} color={item.color} />
                            </View>
                            <Text style={{ color: item.color }} className="text-[10px] font-black uppercase tracking-[2px]">{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>

        {/* School Details */}
        <View className="mb-10">
            <View className="flex-row items-center mb-4 px-1">
                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">School Information</Text>
            </View>
            <View className="flex-row gap-4 mb-4">
                <DataNode label="Registry" value={institute.email || 'No Email'} icon={Icons.Mail} />
                <DataNode label="Enrolled" value={new Date(institute.created_at).toLocaleDateString()} icon={Icons.Calendar} />
            </View>

            <TouchableOpacity 
                onPress={() => onUpdateLogo(institute.id)} 
                activeOpacity={0.7}
                className="w-full py-5 bg-white rounded-[24px] border border-gray-50 items-center shadow-sm"
            >
                <View className="flex-row items-center">
                    <Icons.School size={16} color="#6366f1" />
                    <Text className="ml-3 text-indigo-600 font-black text-[10px] uppercase tracking-[3px]">Update Institutional Identity</Text>
                </View>
            </TouchableOpacity>
        </View>

        <AppButton 
            label="Close Management"
            variant="outline"
            onPress={onClose}
            className="py-5"
        />
      </View>
    </ModalShell>
  );
};
