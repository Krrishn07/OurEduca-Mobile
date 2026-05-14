import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Modal, ScrollView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, 
  Animated, Dimensions, Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRole, User } from '@/types';
import { Icons } from '@components/common/Icons';
import { useSchoolData } from '@context/SchoolDataContext';
import { useMockAuth, DbUser } from '@context/MockAuthContext';
import { supabase } from '@lib/supabase';
import { PlatformRadius, PlatformTypography, PlatformSpacing, PlatformColors } from '@screens/platform/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppCard } from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import ReAnimated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Simple SafeAreaView fallback
const SafeAreaView: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-12' : 'pt-6'} ${className}`}>
    {children}
  </View>
);

// Map UI UserRole → DB role string for MockAuthContext
const userRoleToDbRole = (role: UserRole | 'FAMILY'): DbUser['role'] | 'family' => {
  if (role === 'FAMILY') return 'family';
  switch (role) {
    case UserRole.PLATFORM_ADMIN: return 'platform';
    case UserRole.SUPER_ADMIN:    return 'headmaster';
    case UserRole.ADMIN_TEACHER:  return 'mentor';
    case UserRole.TEACHER:        return 'teacher';
    case UserRole.STUDENT:        return 'student';
    case UserRole.PARENT:         return 'student';
    default:                       return 'student';
  }
};

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { platformSettings, registerInstitute } = useSchoolData();
  const { setMockUser, signInWithOtp, verifyOtp, onboardingStatus, pendingRequest } = useMockAuth();
  const [step, setStep] = useState<'ROLE' | 'LOGIN_FLOW' | 'OTP' | 'EMAIL_INPUT' | 'EMAIL_OTP' | 'REGISTER_NEW_STUDENT' | 'REGISTER_VIA_QR' | 'PENDING_VERIFICATION' | 'REJECTED'>('ROLE');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isFamilyLogin, setIsFamilyLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'QR'>('OTP');
  
  // QR State
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [qrOnboardingData, setQrOnboardingData] = useState<{
    schoolId: string;
    schoolName: string;
    classId: string;
    className: string;
    section: string;
  } | null>(null);
  
  // Phone State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // New Student Registration State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // Email State (Platform Admin & Super Admin)
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const scanningAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  // --- Registration / Sign Up Modal State ---
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  // Form Fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstitute, setRegInstitute] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, [step]);

  useEffect(() => {
    if (showScanner) {
      // Loop the scanning beam
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanningAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanningAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      // Loop the border pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanningAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [showScanner]);

  const transitionTo = (newStep: typeof step) => {
    // LayoutAnimation.configureNext removed
    setStep(newStep);
  };

  const handleRoleSelect = (role: UserRole | 'FAMILY') => {
    if (role === 'FAMILY') {
      setIsFamilyLogin(true);
      setSelectedRole(null);
    } else {
      setIsFamilyLogin(false);
      setSelectedRole(role as UserRole);
    }
    setPhone(''); setOtp(''); setEmail(''); setEmailOtp(''); setLoginMethod('OTP');
    transitionTo('LOGIN_FLOW');
  };

  const handleBack = () => {
    switch(step) {
      case 'LOGIN_FLOW': transitionTo('ROLE'); break;
      case 'OTP': transitionTo('LOGIN_FLOW'); break;
      case 'EMAIL_INPUT': transitionTo('LOGIN_FLOW'); break;
      case 'EMAIL_OTP': transitionTo('EMAIL_INPUT'); break;
      case 'REGISTER_NEW_STUDENT': transitionTo('LOGIN_FLOW'); break;
      case 'REGISTER_VIA_QR': transitionTo('LOGIN_FLOW'); break;
      default: transitionTo('ROLE');
    }
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    const { error } = await signInWithOtp(phone);
    setIsLoading(false);
    if (!error) {
      transitionTo('OTP');
    } else {
      Alert.alert("Error", "Could not send OTP. Please try again.");
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 4) return;
    setIsLoading(true);
    
    // 1. If it's a platform/super admin, handle email secondary check if needed
    if (selectedRole === UserRole.PLATFORM_ADMIN || selectedRole === UserRole.SUPER_ADMIN) {
      if (step !== 'EMAIL_INPUT' && step !== 'EMAIL_OTP') {
        setIsLoading(false);
        transitionTo('EMAIL_INPUT');
        return;
      }
    }

    try {
      // 2. Production Verify OTP & Resolve Identity
      const { error, status } = await verifyOtp(phone, otp);
      
      if (error) {
          Alert.alert("Verification Failed", "The code you entered is incorrect.");
          return;
      }

      // 3. Handle Status
      if (status === 'pending') {
          transitionTo('PENDING_VERIFICATION');
      } else if (status === 'rejected') {
          transitionTo('REJECTED');
      } else if (status === 'approved' || status === 'none') {
          // If approved, verifyOtp already set the session
          // If none (and we were in a login flow), we might need to decide what to do
          // For now, ifApproved/Resolved, we proceed
          onLogin(selectedRole || UserRole.STUDENT);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!email.includes('@')) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      transitionTo('EMAIL_OTP');
    }, 1000);
  };

  const handleEmailOtpSubmit = async () => {
    if (emailOtp.length < 4) return;
    setIsLoading(true);
    const targetRole = userRoleToDbRole(selectedRole || UserRole.PLATFORM_ADMIN);
    try {
      await setMockUser(targetRole as string);
      onLogin(selectedRole || UserRole.PLATFORM_ADMIN);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrScan = async () => {
    if (showScanner) {
        setShowScanner(false);
        return;
    }
    const { status } = await requestPermission();
    if (status === 'granted') {
        setShowScanner(true);
    } else {
        Alert.alert("Permission Required", "Please allow camera access to scan QR codes.");
    }
  };

  const onBarCodeScanned = ({ data }: { data: string }) => {
    if (!showScanner) return;
    
    // Format: oureduca://onboard?sid=X&cid=Y&sec=Z
    if (data.startsWith('oureduca://onboard')) {
        triggerHaptic();
        setShowScanner(false);
        
        try {
            // Manual parser — URLSearchParams is unreliable on Hermes
            const queryString = data.split('?')[1] || '';
            const paramMap: Record<string, string> = {};
            queryString.split('&').forEach(pair => {
                const [key, ...rest] = pair.split('=');
                if (key) paramMap[key] = decodeURIComponent(rest.join('=') || '');
            });

            // Check if sid or cid are missing
            if (!paramMap['sid'] || !paramMap['cid']) {
                triggerHaptic();
                Alert.alert("Incomplete Code", "This QR code is missing institutional data. Please ask your teacher for a new one.");
                return;
            }
            
            // Sanitize: reject literal "undefined" strings from broken QR payloads
            const clean = (val: string | undefined, fallback: string) => {
                if (!val || val === 'undefined' || val === 'null' || val.trim() === '') return fallback;
                return val;
            };
            
            const onboardingData = {
                schoolId: clean(paramMap['sid'], ''),
                schoolName: clean(paramMap['sn'], 'Institutional Academy'),
                classId: clean(paramMap['cid'], ''),
                className: clean(paramMap['cn'], 'Institutional Class'),
                section: clean(paramMap['sec'], 'A'),
            };
            
            console.log('[QR_ONBOARD] Parsed payload:', JSON.stringify(onboardingData));
            setQrOnboardingData(onboardingData);
            transitionTo('REGISTER_VIA_QR');
        } catch (err) {
            Alert.alert("Invalid Code", "This QR code is not compatible with OurEduca.");
        }
    } else {
        // Fallback for demo if scanning other QRs
        // Alert.alert("Not an Invitation", "Please scan an OurEduca institutional QR code.");
    }
  };

  const handleNewStudentRegistration = async () => {
      const name = newStudentName.trim();
      const phoneNum = newStudentPhone.trim();

      if (name.length < 3) {
          triggerHaptic();
          Alert.alert("Invalid Name", "Please enter your full name (min 3 characters).");
          return;
      }
      if (!/^[a-zA-Z ]+$/.test(name)) {
          triggerHaptic();
          Alert.alert("Invalid Name", "Name can only contain letters and spaces.");
          return;
      }
      if (phoneNum.length !== 10 || !/^\d+$/.test(phoneNum)) {
          triggerHaptic();
          Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number (numbers only).");
          return;
      }
      if (!qrOnboardingData?.schoolId || !qrOnboardingData?.classId) {
          triggerHaptic();
          Alert.alert("QR Error", "Invalid scan data. Please re-scan the QR code.");
          return;
      }

      setIsLoading(true);
      try {
          // 1. Check for Duplicate Request
          const { data: existing, error: checkError } = await supabase
            .from('student_onboarding_requests')
            .select('id, status')
            .eq('phone', phoneNum)
            .eq('class_id', qrOnboardingData.classId)
            .maybeSingle();
          
          if (existing) {
              triggerHaptic();
              if (existing.status === 'approved') {
                  Alert.alert("Already Verified", "You are already a member of this class! Please log in using your phone number to access your dashboard.");
                  transitionTo('LOGIN_FLOW');
              } else if (existing.status === 'rejected') {
                  Alert.alert("Request Declined", "Your previous request for this class was declined. Please contact the school office for assistance.");
                  transitionTo('ROLE');
              } else {
                  Alert.alert("Already Requested", "Your verification request is currently pending. Please wait for a teacher to approve your profile.");
                  setPhone(phoneNum);
                  transitionTo('PENDING_VERIFICATION');
              }
              return;
          }

          // 2. Submit New Request
          const { error: insertError } = await supabase
            .from('student_onboarding_requests')
            .insert({
                school_id: qrOnboardingData.schoolId,
                class_id: qrOnboardingData.classId,
                section: qrOnboardingData.section || 'A',
                full_name: name,
                phone: phoneNum,
                status: 'pending'
            });
          
          if (insertError) throw insertError;

          // 3. Move to Pending UI
          setPhone(phoneNum); // Set phone for persistent session tracking
          await verifyOtp(phoneNum, '0000'); // Initialize persistent state
          transitionTo('PENDING_VERIFICATION');
          
      } catch (err: any) {
          Alert.alert("Registration Failed", err.message || "Could not submit onboarding request.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleRegisterSubmit = async () => {
    if(!regName || !regPhone || !regInstitute) return;
    setIsRegistering(true);
    try {
        await registerInstitute({
            name: regName, phone: regPhone, email: regEmail,
            institute_name: regInstitute, address: regAddress
        });
        setShowRegisterModal(false);
        setRegName(''); setRegPhone(''); setRegEmail(''); setRegInstitute(''); setRegAddress('');
        Alert.alert("Success", "Registration successful! You will be able to access your dashboard as soon as our platform team verifies your account.");
    } catch (err: any) {
        Alert.alert("Error", "Failed to register institute.");
    } finally {
        setIsRegistering(false);
    }
  };

  const getRoleDisplayName = (role: UserRole | null) => {
    if (isFamilyLogin) return 'Student & Parent';
    switch (role) {
      case UserRole.TEACHER: return 'Teacher';
      case UserRole.ADMIN_TEACHER: return 'Class Mentor';
      case UserRole.SUPER_ADMIN: return 'Headmaster';
      case UserRole.PLATFORM_ADMIN: return 'Platform Admin';
      default: return 'Institutional User';
    }
  };

  const renderRoleSelector = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="w-full">
      {/* 1. Platinum Hero Card (Student & Parent) - Image Matched */}
      <TouchableOpacity
        onPress={() => handleRoleSelect('FAMILY')}
        activeOpacity={0.9}
        className="mb-8"
      >
        <LinearGradient
          colors={['#4f46e5', '#6366f1']}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          className={`${PlatformRadius.primary} p-6 shadow-xl shadow-indigo-100 relative overflow-hidden`}
        >
          <View className="flex-row items-center z-10">
            <View className="bg-white/20 p-5 rounded-[24px] border border-white/30 backdrop-blur-md">
              <Icons.Users size={32} color="white" />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-white text-[22px] font-black tracking-tighter">Student & Parent</Text>
              <Text className="text-indigo-50 text-[11px] font-medium mt-1 leading-4 pr-10">
                Access grades, fees, timetable, assignments & more
              </Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full border border-white/30">
               <Icons.ChevronRight size={18} color="white" />
            </View>
          </View>
          {/* Faint watermark building icon as seen in image */}
          <View className="absolute right-[-10] bottom-[-10] opacity-10">
            <Icons.School size={100} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* 2. Management & Faculty Nodes (Centered Style) */}
      <View className="flex-row flex-wrap justify-between">
        {[
          { r: UserRole.TEACHER, label: 'Teacher', sub: 'Manage classes, students & academic activities', icon: Icons.BookOpen, color: '#f59e0b', bg: 'bg-amber-50/50' },
          { r: UserRole.ADMIN_TEACHER, label: 'Mentor', sub: 'Guide students and monitor performance', icon: Icons.Security, color: '#8b5cf6', bg: 'bg-violet-50/50' },
          { r: UserRole.SUPER_ADMIN, label: 'Headmaster', sub: 'Oversee school operations & staff management', icon: Icons.School, color: '#ef4444', bg: 'bg-rose-50/50' },
          { r: UserRole.PLATFORM_ADMIN, label: 'Platform', sub: 'System settings, integrations & configuration', icon: Icons.Settings, color: '#64748b', bg: 'bg-slate-100/50' },
        ].map((item) => (
          <TouchableOpacity
            key={item.r}
            onPress={() => handleRoleSelect(item.r)}
            activeOpacity={0.7}
            className={`w-[48%] bg-white border border-gray-100 p-6 mb-4 ${PlatformRadius.large} shadow-sm items-center`}
          >
            <View className={`p-4 rounded-2xl ${item.bg} mb-4`}>
              <item.icon size={28} color={item.color} />
            </View>
            <Text className="font-black text-gray-900 text-[15px] tracking-tight mb-2 text-center">{item.label}</Text>
            <Text className="text-[10px] text-gray-400 font-medium text-center leading-4 mb-4" numberOfLines={2}>{item.sub}</Text>
            
            {/* Small circular chevron at bottom as per image */}
            <View className={`bg-white shadow-sm border border-gray-50 p-1.5 rounded-full`}>
               <Icons.ChevronRight size={12} color={item.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Register Institute bar (Mint Green Horizontal) */}
      <TouchableOpacity 
        onPress={() => setShowRegisterModal(true)}
        className="mt-6 bg-[#ecfdf5] border border-emerald-100/50 p-5 rounded-[24px] flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="bg-[#10b981] p-3 rounded-2xl mr-4 shadow-sm shadow-emerald-100">
            <Icons.Plus size={20} color="white" />
          </View>
          <View>
            <Text className="font-black text-[#047857] text-[15px] tracking-tight">Register Institute</Text>
            <Text className="text-[11px] text-[#059669] font-medium opacity-80">Create new organization account</Text>
          </View>
        </View>
        <Icons.ChevronRight size={16} color="#10b981" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLoginForm = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="w-full">
      <View>
        {/* 1. Header Section */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-indigo-50 rounded-[24px] items-center justify-center mb-3 border border-indigo-100/50 shadow-sm shadow-indigo-100/20">
            <Icons.Profile size={32} color="#4f46e5" />
          </View>
          <Text className="text-[22px] font-inter-bold text-gray-900 text-center tracking-tight">
            {getRoleDisplayName(selectedRole)} Login
          </Text>
          <Text className="text-gray-400 text-[12px] text-center mt-0.5 font-inter-medium">
            Access your professional dashboard
          </Text>
        </View>

        {/* 2. Segmented Picker (Method) */}
        {selectedRole !== UserRole.PLATFORM_ADMIN && selectedRole !== UserRole.SUPER_ADMIN && (
          <View className="flex-row bg-gray-100/50 p-1 rounded-2xl mb-8 border border-gray-100">
            <TouchableOpacity 
              onPress={() => setLoginMethod('OTP')}
              className={`flex-1 py-3 rounded-[12px] items-center ${loginMethod === 'OTP' ? 'bg-white shadow-md' : ''}`}
            >
              <Text className={`text-[11px] font-inter-bold uppercase tracking-wider ${loginMethod === 'OTP' ? 'text-indigo-600' : 'text-gray-400'}`}>OTP Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setLoginMethod('QR')}
              className={`flex-1 py-3 rounded-[12px] items-center ${loginMethod === 'QR' ? 'bg-white shadow-md' : ''}`}
            >
              <Text className={`text-[11px] font-inter-bold uppercase tracking-wider ${loginMethod === 'QR' ? 'text-indigo-600' : 'text-gray-400'}`}>QR Scan</Text>
            </TouchableOpacity>
          </View>
        )}

        <View>
          {loginMethod === 'OTP' ? (
            <ReAnimated.View key="otp-view" entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)}>
              <Text className="text-[10px] font-inter-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</Text>
              <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 h-[52px] mb-4 shadow-sm shadow-gray-100/30">
                <TouchableOpacity className="flex-row items-center mr-3 border-r border-gray-100 pr-3">
                  <Text className="text-gray-900 font-inter-bold text-[15px]">+91</Text>
                  <Icons.ChevronRight size={12} color="#94a3b8" style={{ transform: [{rotate: '90deg'}], marginLeft: 4 }} />
                </TouchableOpacity>
                <TextInput
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="000 000 0000"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-gray-900 font-inter-bold text-[15px]"
                />
              </View>
              
              <TouchableOpacity
                onPress={handlePhoneSubmit}
                disabled={isLoading}
                className="w-full overflow-hidden rounded-xl shadow-lg shadow-indigo-100 mb-4"
              >
                <LinearGradient
                  colors={['#4f46e5', '#6366f1']}
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                  className="w-full py-4 items-center justify-center"
                >
                  {isLoading ? <ActivityIndicator color="white" /> : (
                    <Text className="text-white font-inter-bold uppercase tracking-widest text-[11px]">Send OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ReAnimated.View>
          ) : (
            <ReAnimated.View key="qr-view" entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} className="items-center py-2">
              <Animated.View 
                style={{ transform: [{ scale: pulseAnim }] }}
                className={`w-44 h-44 bg-slate-900 rounded-[28px] items-center justify-center border-4 border-dashed ${showScanner ? 'border-indigo-500' : 'border-slate-700'} mb-4 overflow-hidden relative shadow-xl shadow-indigo-200/10`}
              >
                  {showScanner && permission?.granted ? (
                     <>
                        <CameraView 
                          style={{ width: '100%', height: '100%' }} 
                          facing="back"
                          barcodeScannerSettings={{
                              barcodeTypes: ['qr'],
                          }}
                          onBarcodeScanned={onBarCodeScanned}
                        />
                        <Animated.View 
                          style={{ 
                            transform: [{ 
                              translateY: scanningAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 200]
                              }) 
                            }],
                            opacity: scanningAnim.interpolate({
                               inputRange: [0, 0.1, 0.9, 1],
                               outputRange: [0, 1, 1, 0]
                            })
                          }}
                          className="absolute left-0 right-0 h-[3px] bg-indigo-500 shadow-xl shadow-indigo-500 z-50"
                        />
                     </>
                  ) : (
                    <>
                      <LinearGradient colors={['rgba(79, 70, 229, 0.1)', 'transparent']} className="absolute inset-0" />
                      <Icons.QrCode size={52} color="white" style={{ opacity: 0.3 }} />
                    </>
                  )}
              </Animated.View>
              <TouchableOpacity
                onPress={handleQrScan}
                className={`w-full ${showScanner ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-900'} py-4 rounded-2xl items-center justify-center`}
              >
                <Text className={`${showScanner ? 'text-indigo-600' : 'text-white'} font-inter-bold uppercase tracking-widest text-[11px]`}>
                  {showScanner ? 'Cancel Scanning' : 'Initialize QR Scan'}
                </Text>
              </TouchableOpacity>
            </ReAnimated.View>
          )}
        </View>
      </View>

    </Animated.View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* Platinum Background Element */}
      <View className="absolute top-0 left-0 right-0 h-[35%] bg-indigo-100/50">
        <LinearGradient colors={['#eef2ff', '#f8fafc']} className="flex-1" />
<View className="absolute bottom-0 left-0 right-0 h-24">
             <LinearGradient colors={['transparent', '#f8fafc']} className="flex-1" />
        </View>
      </View>

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            className="flex-1 px-6" 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingVertical: 16 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
          
          {/* 1. Header Hero & 2. Separator - Only shown on ROLE selection for parity */}
          {step === 'ROLE' && (
            <>
              <View className="items-center mb-2">
                <View className="bg-indigo-600 w-12 h-12 rounded-[16px] items-center justify-center shadow-lg shadow-indigo-300 mb-4">
                  <Icons.Classes size={24} color="white" />
                </View>
                <Text className="text-[28px] font-inter-bold text-gray-900 tracking-tighter leading-none">{platformSettings.platformName}</Text>
                <Text className="text-[9px] font-inter-bold text-indigo-500 uppercase tracking-[3px] mt-1.5 ml-1">The Future of Institutional Excellence</Text>
              </View>

              <View className="flex-row items-center justify-center mb-4 px-4">
                <View className="h-[1px] flex-1 bg-gray-200" />
                <View className="flex-row items-center mx-4">
                    <View className="w-1 h-1 rounded-full bg-indigo-300 mr-2" />
                    <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[2px]">Select Portal</Text>
                    <View className="w-1 h-1 rounded-full bg-indigo-300 ml-2" />
                </View>
                <View className="h-[1px] flex-1 bg-gray-200" />
              </View>
            </>
          )}

          {/* 3. Main Adaptive Content */}
          <View className="flex-1 justify-center">
            {step !== 'ROLE' && (
              <TouchableOpacity onPress={handleBack} className="flex-row items-center mb-4">
                <View className="bg-white p-1.5 rounded-full mr-2 shadow-sm">
                  <Icons.ChevronRight size={14} color="#4b5563" style={{ transform: [{rotate: '180deg'}] }} />
                </View>
                <Text className="text-gray-400 font-bold text-xs font-inter-bold">Back to Portal</Text>
              </TouchableOpacity>
            )}

            {step === 'ROLE' ? (
              <View className="w-full">
                {/* Condensed Hero Card - Unified 16px */}
                <TouchableOpacity onPress={() => handleRoleSelect('FAMILY')} activeOpacity={0.9} className="mb-4">
                  <LinearGradient colors={['#4f46e5', '#6366f1']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} className="rounded-[16px] p-4 shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                    <View className="flex-row items-center z-10">
                      <View className="bg-white/20 p-4 rounded-[12px] border border-white/30 backdrop-blur-md">
                        <Icons.Users size={28} color="white" />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text className="text-white text-xl font-black tracking-tighter font-inter-black">Student & Parent</Text>
                        <Text className="text-indigo-50 text-[10px] font-medium leading-3 pr-8 font-inter-medium">Grades, fees, timetable & more</Text>
                      </View>
                      <View className="bg-white/20 p-2 rounded-full">
                         <Icons.ChevronRight size={16} color="white" />
                      </View>
                    </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Compressed Faculty Grid - High Contrast */}
                <View className="flex-row flex-wrap justify-between">
                  {[
                    { r: UserRole.TEACHER, label: 'Teacher', icon: Icons.BookOpen, color: '#f59e0b', bg: 'bg-amber-50' },
                    { r: UserRole.ADMIN_TEACHER, label: 'Mentor', icon: Icons.Security, color: '#8b5cf6', bg: 'bg-violet-50' },
                    { r: UserRole.SUPER_ADMIN, label: 'Headmaster', icon: Icons.School, color: '#ef4444', bg: 'bg-rose-50' },
                    { r: UserRole.PLATFORM_ADMIN, label: 'Platform', icon: Icons.Settings, color: '#64748b', bg: 'bg-slate-100' },
                  ].map((item) => (
                    <TouchableOpacity key={item.r} onPress={() => handleRoleSelect(item.r)} activeOpacity={0.7} className="w-[48%] bg-white border border-white p-4 mb-3 rounded-[16px] shadow-md shadow-indigo-100/50 items-center">
                      <View className={`p-3 rounded-[12px] ${item.bg} mb-2`}>
                        <item.icon size={22} color={item.color} />
                      </View>
                      <Text className="font-black text-gray-900 text-xs tracking-tight mb-2 font-inter-black">{item.label}</Text>
                      <View className="bg-slate-50 shadow-inner border border-gray-100 p-1 rounded-full">
                         <Icons.ChevronRight size={10} color={item.color} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              step === 'LOGIN_FLOW' ? renderLoginForm() : (
                step === 'OTP' ? (
                  <View className="items-center w-full px-4">
                      <Text className="text-[22px] font-inter-bold text-gray-900 mb-1 tracking-tight">Verify Identity</Text>
                      <Text className="text-gray-400 text-[11px] mb-6 text-center font-inter-medium">Enter code sent to +91 {phone}</Text>
                      <TextInput
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={4}
                        placeholder="0000"
                        className="w-full bg-white border border-indigo-100/50 rounded-[16px] py-3.5 px-4 text-center text-3xl font-black tracking-[15px] text-indigo-600 mb-6 shadow-sm"
                        style={{ fontFamily: 'Inter_900Black' }}
                      />
                      <TouchableOpacity onPress={handleOtpSubmit} className="w-full overflow-hidden rounded-[16px] shadow-lg shadow-indigo-100">
                        <LinearGradient colors={['#4f46e5', '#6366f1']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="w-full py-4 items-center justify-center">
                          <Text className="text-white font-inter-bold uppercase tracking-widest text-[11px]">Finalize Identity</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                  </View>
                  ) : step === 'PENDING_VERIFICATION' ? (
                    <PendingVerificationView phone={phone} request={pendingRequest} onCancel={() => transitionTo('ROLE')} />
                  ) : step === 'REJECTED' ? (
                    <RejectedView request={pendingRequest} onRetry={() => transitionTo('ROLE')} />
                  ) : null
              )
            )}
          </View>



        </ScrollView>

          {step !== 'PENDING_VERIFICATION' && step !== 'REJECTED' && (
          <View className="px-6 pb-4 pt-2 bg-slate-50 border-t border-indigo-100/10">
            {step === 'ROLE' && (
              <TouchableOpacity onPress={() => setShowRegisterModal(true)} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-[16px] flex-row items-center justify-between mb-4 shadow-sm">
                <View className="flex-row items-center">
                  <View className="bg-[#10b981] p-2.5 rounded-[12px] mr-3 shadow-sm shadow-emerald-100">
                    <Icons.Plus size={18} color="white" />
                  </View>
                  <View>
                    <Text className="font-black text-[#047857] text-xs font-inter-black">Register Institute</Text>
                    <Text className="text-[9px] text-[#059669] font-medium opacity-70 font-inter-medium">New organization account</Text>
                  </View>
                </View>
                <Icons.ChevronRight size={14} color="#10b981" />
              </TouchableOpacity>
            )}
            {step !== 'ROLE' && (
              <View className="flex-row items-center justify-around py-3">
              <View className="items-center">
                <View className="w-7 h-7 bg-indigo-50 rounded-full items-center justify-center mb-1">
                  <Icons.Shield size={12} color="#6366f1" />
                </View>
                <Text className="text-[9px] font-inter-bold text-gray-400">Secure</Text>
              </View>
              <View className="items-center">
                <View className="w-7 h-7 bg-indigo-50 rounded-full items-center justify-center mb-1">
                  <Icons.Lock size={12} color="#6366f1" />
                </View>
                <Text className="text-[9px] font-inter-bold text-gray-400">Encrypted</Text>
              </View>
              <View className="items-center">
                <View className="w-7 h-7 bg-indigo-50 rounded-full items-center justify-center mb-1">
                  <Icons.Check size={12} color="#6366f1" />
                </View>
                <Text className="text-[9px] font-inter-bold text-gray-400">Trusted</Text>
              </View>
            </View>
          )}
            <View className="items-center mt-1">
              <Text className="text-[8px] text-gray-400 font-bold uppercase tracking-widest font-inter-bold">Oureduca Infrastructure</Text>
            </View>
          </View>
          )}

      </KeyboardAvoidingView>
    </SafeAreaView>

      {/* Registration Modal - Platinum Unified 16px */}
      <Modal visible={showRegisterModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[16px] h-[85%] shadow-2xl">
                <View className="p-6 border-b border-gray-50 flex-row justify-between items-center bg-gray-50/50">
                    <View>
                        <Text className="text-xl font-black text-gray-900 tracking-tighter font-inter-black">Register Institute</Text>
                        <Text className="text-xs text-gray-400 font-inter">Join the platinum platform</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowRegisterModal(false)} className="bg-gray-100 p-3 rounded-full">
                        <Icons.Close size={18} color="#6b7280" />
                    </TouchableOpacity>
                </View>
                <ScrollView className="p-6">
                    <View className="space-y-3">
                        <TextInput value={regName} onChangeText={setRegName} placeholder="Full Name" className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regPhone} onChangeText={setRegPhone} keyboardType="phone-pad" placeholder="Phone Number" className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Official Email Address" className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regInstitute} onChangeText={setRegInstitute} placeholder="Institute Name" className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regAddress} onChangeText={setRegAddress} multiline placeholder="Official Address" className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[12px] h-20 font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TouchableOpacity onPress={handleRegisterSubmit} className="bg-emerald-600 py-4 rounded-[16px] shadow-lg shadow-emerald-100 items-center">
                            <Text className="text-white font-black uppercase tracking-wider text-[11px] font-inter-black">Submit Request</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
      </Modal>

      {/* REGISTER_VIA_QR STEP UI - Premium Onboarding Experience */}
      <Modal visible={step === 'REGISTER_VIA_QR'} animationType="slide">
        <View className="flex-1 bg-[#f8fafc]">
          {/* Signature Portal Background */}
          <View className="absolute top-0 left-0 right-0 h-[40%] bg-indigo-100/50">
              <LinearGradient colors={['#eef2ff', '#f8fafc']} className="flex-1" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-12">
                <TouchableOpacity onPress={() => transitionTo('ROLE')} className="mb-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Icons.Back size={20} color="#4f46e5" />
                </TouchableOpacity>

                {/* Header Section (Portal Style) */}
                <ReAnimated.View entering={FadeInDown.delay(200).duration(600)} className="mb-6">
                    <View className="bg-indigo-600 px-3 py-1 rounded-md self-start mb-2">
                        <Text className="text-white text-[10px] font-inter-bold uppercase tracking-widest">ONBOARDING</Text>
                    </View>
                    <Text className="text-3xl font-inter-bold text-gray-900 tracking-tight">Join Your</Text>
                    <Text className="text-3xl font-inter-bold text-indigo-600 tracking-tight">Class</Text>
                </ReAnimated.View>

                {/* Structured Institutional Info Card */}
                <ReAnimated.View entering={FadeInDown.delay(400).duration(600)} className="mb-8">
                    <View className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-xl shadow-indigo-100/30 flex-row items-center">
                        {/* Left: Class Icon / Symbol */}
                        <View className="w-20 h-20 bg-indigo-50 rounded-[20px] items-center justify-center border border-indigo-100 shadow-sm">
                            <Icons.Classes size={36} color="#4f46e5" />
                        </View>

                        {/* Right: Institution Details Stack */}
                        <View className="flex-1 ml-5">
                            <View className="flex-row items-center mb-1">
                                <View className="bg-indigo-600 px-2 py-0.5 rounded-md mr-2">
                                    <Text className="text-white text-[10px] font-inter-bold uppercase tracking-widest">CLASS</Text>
                                </View>
                                <Text className="text-gray-900 text-[24px] font-inter-bold tracking-tight">
                                    {qrOnboardingData?.className || '12 TH'}
                                </Text>
                            </View>
                            
                            <View className="flex-row items-center mb-2">
                                <Text className="text-indigo-600 text-[14px] font-inter-bold uppercase tracking-wide">
                                    Section {qrOnboardingData?.section || 'A'}
                                </Text>
                                <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                                <Text className="text-gray-400 text-[12px] font-inter-medium">Verified Slot</Text>
                            </View>

                            <View className="flex-row items-center">
                                <Icons.School size={14} color="#64748b" />
                                <Text className="text-slate-500 text-[13px] font-inter-bold ml-1.5" numberOfLines={1}>
                                    {qrOnboardingData?.schoolName || 'University of Pennsylvania'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Subtle Security Indicator */}
                    <View className="flex-row items-center justify-center mt-4">
                        <Icons.ShieldCheck size={12} color="#10b981" />
                        <Text className="text-emerald-600 text-[9px] font-black uppercase tracking-[1px] ml-1.5 font-inter-black">
                            End-to-End Institutional Encryption
                        </Text>
                    </View>
                </ReAnimated.View>

                {/* Input Section */}
                <ReAnimated.View entering={FadeInDown.delay(600).duration(600)} className="space-y-5">
                    <View className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[16px]">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-1 font-inter-black ml-0.5">Student Full Name</Text>
                        <TextInput 
                            value={newStudentName}
                            onChangeText={setNewStudentName}
                            placeholder="e.g. Zain Ahmed"
                            className="text-[15px] font-bold text-gray-900 p-0 font-inter-bold"
                            placeholderTextColor="#cbd5e1"
                        />
                    </View>

                    <View className="bg-gray-50 border border-gray-100 py-3.5 px-4 rounded-[16px]">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[1px] mb-1 font-inter-black ml-0.5">Primary Phone Number</Text>
                        <View className="flex-row items-center">
                            <Text className="text-gray-400 font-bold mr-3 border-r border-gray-200 pr-3 font-inter-bold">+91</Text>
                            <TextInput 
                                value={newStudentPhone}
                                onChangeText={setNewStudentPhone}
                                keyboardType="phone-pad"
                                placeholder="000 000 0000"
                                className="flex-1 text-[15px] font-bold text-gray-900 p-0 font-inter-bold"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={handleNewStudentRegistration}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 py-4 rounded-[16px] items-center justify-center shadow-lg shadow-indigo-100 mt-4"
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : (
                            <Text className="text-white font-inter-bold uppercase tracking-[0.5px] text-[11px]">Confirm & Link Profile</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => transitionTo('ROLE')} className="w-full py-6 items-center">
                        <Text className="text-gray-400 font-inter-bold text-[10px] uppercase tracking-[1px]">Cancel Onboarding</Text>
                      </TouchableOpacity>
                 </ReAnimated.View>
             </ScrollView>
         </View>
       </Modal>
    </View>
  );
};

// ============================================================
// MODULAR SCREENS
// ============================================================

const PendingVerificationView: React.FC<{ phone: string, request: any, onCancel: () => void }> = ({ phone, request, onCancel }) => (
    <View className="flex-1">
        {/* Solid base to block parent's indigo gradient */}
        <View className="absolute inset-0 bg-slate-50" />
        <View className="absolute top-0 left-0 right-0 h-[35%] bg-indigo-100/50">
          <LinearGradient colors={['#eef2ff', '#f8fafc']} className="flex-1" />
          <View className="absolute bottom-0 left-0 right-0 h-24">
               <LinearGradient colors={['transparent', '#f8fafc']} className="flex-1" />
          </View>
        </View>
        <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 justify-between py-4">
                <View className="flex-1 justify-center items-center">
                    <ReAnimated.View entering={FadeInDown.duration(800)} className="items-center w-full">
                        <View className="relative mb-6">
                            <View className="absolute -inset-4 bg-amber-400/20 rounded-full blur-xl" />
                            <View className="w-16 h-16 bg-white rounded-[24px] items-center justify-center border border-amber-100 shadow-lg shadow-amber-100/30">
                                <Icons.Clock size={32} color="#f59e0b" />
                            </View>
                        </View>
                        <Text className="text-[22px] font-inter-bold text-gray-900 text-center tracking-tight mb-1">Verification Pending</Text>
                        <Text className="text-gray-400 text-center text-[12px] font-inter-medium mb-6" numberOfLines={1}>Your request to join <Text className="text-indigo-600 font-inter-bold">{request?.classes?.name || '10-A'}</Text> is under review.</Text>
                        <View className="w-full bg-white border border-gray-100 rounded-[20px] p-4 mb-6 shadow-sm">
                            <View className="space-y-2">
                                <View className="flex-row items-center">
                                    <View className="w-7 h-7 bg-slate-50 rounded-lg items-center justify-center mr-3">
                                        <Icons.Profile size={12} color="#64748b" />
                                    </View>
                                    <View>
                                        <Text className="text-[8px] font-inter-bold text-gray-400 uppercase tracking-wider">Reviewer</Text>
                                        <Text className="text-[11px] font-inter-bold text-gray-700">Mrs. Sarah Jenkins (Class Teacher)</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-7 h-7 bg-slate-50 rounded-lg items-center justify-center mr-3">
                                        <Icons.Clock size={12} color="#64748b" />
                                    </View>
                                    <View>
                                        <Text className="text-[8px] font-inter-bold text-gray-400 uppercase tracking-wider">Submitted</Text>
                                        <Text className="text-[11px] font-inter-bold text-gray-700">May 13, 2026, 04:30 PM</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className="w-full px-2 mb-6">
                            <Text className="text-[9px] font-inter-bold text-gray-400 uppercase tracking-[2px] mb-4 ml-1">Current Progress</Text>
                            <View className="space-y-4">
                                <View className="flex-row items-center">
                                    <View className="w-5 h-5 bg-indigo-600 rounded-full items-center justify-center mr-3 shadow-sm shadow-indigo-200">
                                        <Icons.Check size={10} color="white" />
                                    </View>
                                    <Text className="text-[12px] font-inter-bold text-gray-900">Request Submitted</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-5 h-5 bg-amber-50 border border-amber-200 rounded-full items-center justify-center mr-3">
                                        <View className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-[12px] font-inter-bold text-amber-600 mr-2">Teacher Review</Text>
                                        <Text className="text-[8px] font-inter-medium text-amber-500 uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">In Progress</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-5 h-5 bg-gray-50 border border-gray-100 rounded-full items-center justify-center mr-3" />
                                    <Text className="text-[12px] font-inter-medium text-gray-400">Portal Access Granted</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onCancel} className="w-full overflow-hidden rounded-[16px] shadow-lg shadow-indigo-100">
                            <LinearGradient colors={['#4f46e5', '#6366f1']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="w-full py-3.5 items-center justify-center">
                                <Text className="text-white font-inter-bold text-[11px] uppercase tracking-widest">Back to Home</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <View className="flex-row items-center justify-center mt-6">
                            <Icons.Security size={10} color="#94a3b8" style={{ marginRight: 6 }} />
                            <Text className="text-[10px] text-gray-400 font-inter-medium">Need help? Contact support at <Text className="text-indigo-500 font-inter-bold">support@inst.edu</Text></Text>
                        </View>
                    </ReAnimated.View>
                </View>
                <View className="pt-4 border-t border-indigo-100/20 items-center">
                    <Text className="text-[9px] text-gray-300 font-inter-bold uppercase tracking-[3px]">Oureduca Infrastructure</Text>
                </View>
            </View>
        </SafeAreaView>
    </View>
);

const RejectedView: React.FC<{ request: any, onRetry: () => void }> = ({ request, onRetry }) => (
    <View className="flex-1">
        {/* Solid base to block parent's indigo gradient */}
        <View className="absolute inset-0 bg-slate-50" />
        {/* Platinum Background Element (Rose Tinted - mirrors portal's indigo pattern) */}
        <View className="absolute top-0 left-0 right-0 h-[35%] bg-rose-100/50">
          <LinearGradient colors={['#fff1f2', '#f8fafc']} className="flex-1" />
          <View className="absolute bottom-0 left-0 right-0 h-24">
               <LinearGradient colors={['transparent', '#f8fafc']} className="flex-1" />
          </View>
        </View>
        <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 py-4">
                <View className="flex-1 justify-center">
                    <ReAnimated.View entering={FadeInDown.duration(800)} className="items-center w-full">
                        {/* Shield Icon */}
                        <View className="relative mb-6">
                            <View className="absolute -inset-4 bg-rose-400/15 rounded-full blur-xl" />
                            <View className="w-20 h-20 bg-rose-100 rounded-[28px] items-center justify-center border border-rose-200/50 shadow-lg shadow-rose-100/30">
                                <Icons.Close size={36} color="#ef4444" />
                            </View>
                        </View>

                        {/* Title & Subtitle */}
                        <Text className="text-[22px] font-inter-bold text-gray-900 text-center tracking-tight mb-2">Verification Rejected</Text>
                        <Text className="text-gray-400 text-center text-[13px] font-inter-medium mb-8 leading-5">We couldn't verify your information{'\n'}at this time.</Text>

                        {/* Why this happened - Rose Card */}
                        <View className="w-full bg-rose-50 border border-rose-100 rounded-[20px] p-5 mb-4">
                            <Text className="text-[14px] font-inter-bold text-rose-600 mb-2">Why this happened?</Text>
                            <Text className="text-[12px] font-inter-medium text-rose-400 leading-5">Your details didn't match our records or the documents provided were invalid.</Text>
                        </View>

                        {/* What you can do - White Card */}
                        <View className="w-full bg-white border border-gray-100 rounded-[20px] p-5 mb-8 shadow-sm">
                            <Text className="text-[14px] font-inter-bold text-gray-900 mb-4">What you can do?</Text>
                            <View className="space-y-4">
                                <View className="flex-row items-center">
                                    <Icons.Profile size={18} color="#94a3b8" />
                                    <Text className="text-[12px] font-inter-medium text-gray-500 ml-3">Check your details and try again</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Icons.School size={18} color="#94a3b8" />
                                    <Text className="text-[12px] font-inter-medium text-gray-500 ml-3">Contact your institute for help</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Icons.BookOpen size={18} color="#94a3b8" />
                                    <Text className="text-[12px] font-inter-medium text-gray-500 ml-3">Upload correct documents</Text>
                                </View>
                            </View>
                        </View>

                        {/* Try Again Button */}
                        <TouchableOpacity onPress={onRetry} className="w-full overflow-hidden rounded-[16px] shadow-lg shadow-indigo-100 mb-4">
                            <LinearGradient colors={['#4f46e5', '#6366f1']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="w-full py-4 items-center justify-center">
                                <Text className="text-white font-inter-bold text-[13px] uppercase tracking-wider">Try Again</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Contact Support Link */}
                        <TouchableOpacity onPress={onRetry} className="py-2">
                            <Text className="text-indigo-500 font-inter-bold text-[12px] text-center">Contact Support</Text>
                        </TouchableOpacity>
                    </ReAnimated.View>
                </View>
            </View>
        </SafeAreaView>
    </View>
);
