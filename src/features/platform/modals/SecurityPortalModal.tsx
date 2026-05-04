import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface SecurityPortalModalProps {
  visible: boolean;
  onClose: () => void;
  onLogoutAllDevices: () => void;
  onUpdatePassword: (newPass: string) => void;
}

export const SecurityPortalModal: React.FC<SecurityPortalModalProps> = ({
  visible,
  onClose,
  onLogoutAllDevices,
  onUpdatePassword
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const activeSessions = [
    { id: '1', device: 'Admin Terminal - MacOS', location: 'NY, USA', status: 'Live', isCurrent: true },
    { id: '2', device: 'Mobile Node - iPhone 15', location: 'LDN, UK', status: '2h ago', isCurrent: false },
    { id: '3', device: 'Backup Access - Win 11', location: 'TKO, JP', status: '2d ago', isCurrent: false },
  ];

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) return;
    setIsUpdating(true);
    await new Promise(r => setTimeout(r, 1500));
    onUpdatePassword(newPassword);
    setIsUpdating(false);
    setNewPassword(''); setConfirmPassword('');
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    await new Promise(r => setTimeout(r, 1200));
    onLogoutAllDevices();
    setIsLoggingOutAll(false);
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="Security Portal"
      subtitle="Institutional Protocol Node"
      headerGradient={AppTheme.colors.gradients.brand}
    >
      <View>
        {/* Authorized Terminals */}
        <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4 ml-1">
                <Text className={AppTypography.eyebrow}>Authorized Terminals</Text>
                <TouchableOpacity 
                  onPress={handleLogoutAll} 
                  disabled={isLoggingOutAll} 
                  className="bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 flex-row items-center"
                >
                    {isLoggingOutAll ? (
                      <ActivityIndicator size="small" color="#e11d48" />
                    ) : (
                      <>
                        <Icons.Power size={10} color="#e11d48" />
                        <Text className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-1.5">Purge All</Text>
                      </>
                    )}
                </TouchableOpacity>
            </View>
            <View className="gap-3">
                {activeSessions.map((session) => (
                    <View key={session.id} className="bg-white border border-gray-100 p-5 rounded-[24px] flex-row items-center shadow-sm">
                        <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${session.isCurrent ? 'bg-indigo-600 shadow-indigo-100 shadow-lg' : 'bg-gray-50'}`}>
                            {session.device.includes('iPhone') ? <Icons.Smartphone size={16} color={session.isCurrent ? 'white' : '#9ca3af'} /> : <Icons.Monitor size={16} color={session.isCurrent ? 'white' : '#9ca3af'} />}
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-black text-gray-900 tracking-tight">{session.device}</Text>
                            <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mt-1">{session.location} • {session.status}</Text>
                        </View>
                        {session.isCurrent && (
                          <View className="bg-indigo-50 px-2 py-0.5 rounded-md">
                            <Text className="text-[8px] font-black text-indigo-600 uppercase">Live</Text>
                          </View>
                        )}
                    </View>
                ))}
            </View>
        </View>

        {/* Credential Vault */}
        <View className="mb-8 bg-indigo-950 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
            <View className="absolute -top-10 -right-10 opacity-5">
              <Icons.Shield size={150} color="white" />
            </View>
            <View className="flex-row items-center mb-6">
                <Icons.Lock size={14} color="white" />
                <Text className="text-white font-black text-[10px] uppercase tracking-[3px] ml-3">Identity Key Rotation</Text>
            </View>
            <View className="gap-4">
                <TextInput 
                  secureTextEntry 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-sm h-14" 
                  placeholder="New Identity Key" 
                  placeholderTextColor="rgba(255,255,255,0.3)" 
                  value={newPassword} 
                  onChangeText={setNewPassword} 
                />
                <TextInput 
                  secureTextEntry 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-sm h-14" 
                  placeholder="Verification Hash" 
                  placeholderTextColor="rgba(255,255,255,0.3)" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                />
                <AppButton 
                  label="Update Key"
                  onPress={handleUpdatePassword}
                  loading={isUpdating}
                  disabled={!newPassword || newPassword !== confirmPassword}
                  className="py-5"
                />
            </View>
        </View>

        {/* Critical Actions */}
        <View className="mb-6">
            <Text className={`${AppTypography.eyebrow} mb-4 ml-1`}>Critical Protocols</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              className="bg-rose-50 border border-rose-100 p-6 rounded-[32px] flex-row items-center"
            >
                <View className="bg-rose-500 w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-rose-200">
                    <Icons.Alert size={20} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-rose-950 font-black text-sm tracking-tight">Identity Termination</Text>
                    <Text className="text-rose-600/60 text-[9px] font-black uppercase tracking-widest mt-1">Permanent Node Purge</Text>
                </View>
                <Icons.ChevronRight size={16} color="#fca5a5" />
            </TouchableOpacity>
        </View>

        <AppButton 
            label="Close Security Portal"
            variant="outline"
            onPress={onClose}
            className="py-5 mb-6"
        />
      </View>
    </ModalShell>
  );
};
