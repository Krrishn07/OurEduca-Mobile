import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Modal, ScrollView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, 
  LayoutAnimation, Animated, Dimensions, Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRole, User } from '../types';
import { Icons } from '../components/Icons';
import { useSchoolData } from '../contexts/SchoolDataContext';
import { useMockAuth, DbUser } from '../contexts/MockAuthContext';
import { PlatformRadius, PlatformTypography, PlatformSpacing, PlatformColors } from '../src/features/platform/theme';

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
  const { platformSettings, addUser, registerInstitute } = useSchoolData();
  const { setMockUser } = useMockAuth();
  const [step, setStep] = useState<'ROLE' | 'LOGIN_FLOW' | 'OTP' | 'EMAIL_INPUT' | 'EMAIL_OTP' | 'REGISTER_NEW_STUDENT'>('ROLE');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isFamilyLogin, setIsFamilyLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'QR'>('OTP');
  
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

  const transitionTo = (newStep: typeof step) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
      default: transitionTo('ROLE');
    }
  };

  const handlePhoneSubmit = () => {
    if (phone.length < 3) return; 
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      transitionTo('OTP');
    }, 1000);
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 4) return;
    setIsLoading(true);
    
    if (selectedRole === UserRole.PLATFORM_ADMIN || selectedRole === UserRole.SUPER_ADMIN) {
      if (step !== 'EMAIL_INPUT' && step !== 'EMAIL_OTP') {
        setIsLoading(false);
        transitionTo('EMAIL_INPUT');
        return;
      }
    }

    const targetRole = userRoleToDbRole(selectedRole || UserRole.STUDENT);
    try {
      if (isFamilyLogin) {
        await setMockUser('student');
      } else {
        await setMockUser(targetRole as string);
      }
      onLogin(selectedRole || UserRole.STUDENT);
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

  const handleQrScan = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (isFamilyLogin || selectedRole === UserRole.STUDENT) {
        transitionTo('REGISTER_NEW_STUDENT');
      } else {
         if (isFamilyLogin) {
            setMockUser('family');
            onLogin(UserRole.STUDENT);
         } else if (selectedRole) {
            setMockUser(userRoleToDbRole(selectedRole));
            onLogin(selectedRole);
         }
      }
    }, 1500);
  };

  const handleNewStudentRegistration = () => {
      setIsLoading(true);
      setTimeout(() => {
          const newUser: User = {
              id: `st_joined_${Date.now()}`,
              name: newStudentName,
              phone: newStudentPhone,
              role: UserRole.STUDENT,
              grade: 'Class 10', 
              section: 'A',      
              status: 'Active',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudentName)}&background=random`
          };
          addUser(newUser);
          setIsLoading(false);
          setMockUser('student');
          onLogin(UserRole.STUDENT);
      }, 1500);
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
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="w-full px-2">
      <View className="items-center mb-4">
        <View className="bg-indigo-50 p-3 rounded-[20px] mb-3">
          <Icons.Profile size={32} color={PlatformColors.primary.main} />
        </View>
        <Text className="text-[20px] font-black text-gray-900 text-center tracking-tight font-inter-black">{getRoleDisplayName(selectedRole)} Login</Text>
        <Text className="text-gray-400 text-[11px] text-center mt-0.5 font-inter">Access your professional dashboard</Text>
      </View>

      <View>
        {/* Tightened Method Picker */}
        {selectedRole !== UserRole.PLATFORM_ADMIN && selectedRole !== UserRole.SUPER_ADMIN && (
          <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
            <TouchableOpacity 
              onPress={() => setLoginMethod('OTP')}
              className={`flex-1 py-2.5 rounded-lg items-center ${loginMethod === 'OTP' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-wider font-inter-black ${loginMethod === 'OTP' ? 'text-indigo-600' : 'text-gray-400'}`}>OTP Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setLoginMethod('QR')}
              className={`flex-1 py-2.5 rounded-lg items-center ${loginMethod === 'QR' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-wider font-inter-black ${loginMethod === 'QR' ? 'text-indigo-600' : 'text-gray-400'}`}>QR Scan</Text>
            </TouchableOpacity>
          </View>
        )}

        {loginMethod === 'OTP' ? (
          <View>
            <Text className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 ml-1 font-inter-black">Phone Identity</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 h-12 mb-6">
              <Text className="text-gray-400 font-bold mr-3 border-r border-gray-100 pr-3 font-inter-bold">+91</Text>
              <TextInput
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="000 000 0000"
                className="flex-1 text-gray-900 font-bold text-base"
                style={{ fontFamily: 'Inter_700Bold' }}
              />
            </View>
            
            <TouchableOpacity
              onPress={handlePhoneSubmit}
              disabled={isLoading}
              className="w-full bg-indigo-600 py-4 rounded-xl shadow-lg shadow-indigo-100 items-center justify-center"
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase tracking-widest text-[10px] font-inter-black">Authorize Identity</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center">
            <View className="w-48 h-48 bg-slate-900 rounded-[24px] items-center justify-center border-4 border-dashed border-slate-700 mb-6 overflow-hidden">
                <LinearGradient colors={['rgba(79, 70, 229, 0.1)', 'transparent']} className="absolute inset-0" />
                <Icons.QrCode size={60} color="white" style={{ opacity: 0.3 }} />
                <View className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-red-500 opacity-40" />
            </View>
            <TouchableOpacity
              onPress={handleQrScan}
              className="w-full bg-slate-900 py-3.5 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-black uppercase tracking-widest text-[10px] font-inter-black">Initialize QR Scan</Text>
            </TouchableOpacity>
          </View>
        )}
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
        <View className="flex-1 px-6 justify-between py-4">
          
          {/* 1. Compressed Header Hero */}
          <View className="items-center mb-2">
            <View className="bg-indigo-600 w-12 h-12 rounded-[16px] items-center justify-center shadow-lg shadow-indigo-300 mb-4">
              <Icons.Classes size={24} color="white" />
            </View>
            <Text className="text-[28px] font-black text-gray-900 tracking-tighter leading-none font-inter-black">{platformSettings.platformName}</Text>
            <Text className="text-[9px] font-black text-indigo-500 uppercase tracking-[3px] mt-1.5 ml-1 font-inter-black">The Future of Institutional Excellence</Text>
          </View>

          {/* 2. Tightened Separator */}
          <View className="flex-row items-center justify-center mb-4 px-4">
             <View className="h-[1px] flex-1 bg-gray-200" />
             <View className="flex-row items-center mx-4">
                <View className="w-1 h-1 rounded-full bg-indigo-300 mr-2" />
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] font-inter-black">Select Portal</Text>
                <View className="w-1 h-1 rounded-full bg-indigo-300 ml-2" />
             </View>
             <View className="h-[1px] flex-1 bg-gray-200" />
          </View>

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
                    <View className="absolute right-[-10] bottom-[-10] opacity-10">
                      <Icons.School size={80} color="white" />
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
                    <Text className="text-xl font-black text-gray-900 mb-1 font-inter-black">Verify Identity</Text>
                    <Text className="text-gray-400 text-[11px] mb-6 text-center font-inter">Enter code sent to +91 {phone}</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={setOtp}
                      maxLength={4}
                      placeholder="0000"
                      className="w-full bg-white border border-indigo-100/50 rounded-[12px] p-4 text-center text-3xl font-black tracking-[15px] text-indigo-600 mb-6 shadow-sm"
                      style={{ fontFamily: 'Inter_900Black' }}
                    />
                    <TouchableOpacity onPress={handleOtpSubmit} className="w-full bg-indigo-600 py-4 rounded-[12px] items-center shadow-lg shadow-indigo-200">
                      <Text className="text-white font-black uppercase tracking-widest text-[10px] font-inter-black">Finalize Identity</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              )
            )}
          </View>

          {/* 4. Streamlined Footer Area - Unified 16px */}
          <View className="mt-4">
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

             <View className="items-center">
               <Text className="text-[8px] text-gray-400 font-bold uppercase tracking-widest font-inter-bold">Oureduca Infrastructure</Text>
             </View>
          </View>

        </View>
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
                    <View className="space-y-4">
                        <TextInput value={regName} onChangeText={setRegName} placeholder="Full Name" className="bg-gray-50 border border-gray-100 p-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regPhone} onChangeText={setRegPhone} keyboardType="phone-pad" placeholder="Phone Number" className="bg-gray-50 border border-gray-100 p-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Official Email Address" className="bg-gray-50 border border-gray-100 p-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regInstitute} onChangeText={setRegInstitute} placeholder="Institute Name" className="bg-gray-50 border border-gray-100 p-4 rounded-[12px] font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TextInput value={regAddress} onChangeText={setRegAddress} multiline placeholder="Official Address" className="bg-gray-50 border border-gray-100 p-4 rounded-[12px] h-24 font-bold text-sm" style={{ fontFamily: 'Inter_700Bold' }} />
                        <TouchableOpacity onPress={handleRegisterSubmit} className="bg-emerald-600 py-4 rounded-[16px] shadow-lg shadow-emerald-100 items-center">
                            <Text className="text-white font-black uppercase tracking-widest text-[11px] font-inter-black">Submit Request</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
      </Modal>
    </View>
  );
};
