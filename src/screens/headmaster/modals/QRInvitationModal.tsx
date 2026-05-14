import React from 'react';
import { View, Text, TouchableOpacity, Share, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Icons } from '@components/common/Icons';
import { ModalShell, AppButton, AppTypography } from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface QRInvitationModalProps {
  visible: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  classId: string;
  targetClassName: string;
  section: string;
}

export const QRInvitationModal: React.FC<QRInvitationModalProps> = ({
  visible,
  onClose,
  schoolId,
  schoolName,
  classId,
  targetClassName,
  section,
}) => {
  // Payload for onboarding: sid = School ID, sn = School Name, cid = Class ID, cn = Class Name, sec = Section
  const qrPayload = `oureduca://onboard?sid=${schoolId}&sn=${encodeURIComponent(schoolName || '')}&cid=${classId}&cn=${encodeURIComponent(targetClassName || '')}&sec=${section}&t=${Date.now()}`;

  const handleShare = async () => {
    triggerHaptic();
    try {
      await Share.share({
        message: `Join ${targetClassName} - Section ${section} on OurEduca! Scan this code to onboard instantly.`,
        url: qrPayload, // Some share targets might use the URL
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title="QR Invitation"
      subtitle="INSTANT STUDENT ONBOARDING"
    >
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <View style={{ backgroundColor: '#eef2ff', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#c7d2fe', marginBottom: 32 }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
            <QRCode
              value={qrPayload}
              size={200}
              color="#312e81"
              backgroundColor="white"
            />
          </View>
        </View>

        <View style={{ width: '100%', backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
             <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Icons.Classes size={20} color="white" />
             </View>
             <View>
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter_900Black' }}>Target Class</Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827', fontFamily: 'Inter_900Black' }}>{targetClassName}</Text>
             </View>
          </View>
          
          <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter_900Black' }}>Section</Text>
              <View style={{ backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, marginTop: 4, borderWidth: 1, borderColor: '#c7d2fe' }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#4338ca', fontFamily: 'Inter_900Black' }}>SEC {section}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter_900Black' }}>Institute</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4b5563', marginTop: 4, fontFamily: 'Inter_700Bold' }}>{schoolName}</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 32, marginBottom: 32, fontFamily: 'Inter_500Medium', lineHeight: 20 }}>
          Students can scan this code from the login screen to automatically link their profile to this class roster.
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <TouchableOpacity 
            onPress={handleShare}
            style={{ flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icons.Radio size={18} color="#475569" />
            <Text style={{ color: '#334155', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, fontFamily: 'Inter_900Black', marginLeft: 8 }}>Share Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onClose}
            style={{ flex: 1, backgroundColor: '#4f46e5', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, fontFamily: 'Inter_900Black' }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalShell>
  );
};
