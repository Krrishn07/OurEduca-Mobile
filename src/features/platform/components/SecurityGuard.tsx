import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Fingerprint, Lock, ShieldCheck } from 'lucide-react-native';
import { useMockAuth } from '../../../../contexts/MockAuthContext';

const { height, width } = Dimensions.get('window');

interface SecurityGuardProps {
    children: React.ReactNode;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({ children }) => {
    const { currentUser, isLoading } = useMockAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [scanStatus, setScanStatus] = useState<'analyzing' | 'verifying' | 'granted' | 'restricted'>('analyzing');
    
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const contentFadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!isLoading) {
            startSecurityProtocol();
        }
    }, [isLoading, currentUser]);

    const startSecurityProtocol = () => {
        // Reset states
        setScanStatus('analyzing');
        
        // Pulse animation for the shield
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Scanning Line Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 200,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Security logic delay
        setTimeout(() => {
            setScanStatus('verifying');
            
            setTimeout(() => {
                if (currentUser) {
                    setScanStatus('granted');
                    setTimeout(() => {
                        // Exit transition
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 800,
                            useNativeDriver: true,
                        }).start(() => {
                            setIsAuthorized(true);
                            Animated.timing(contentFadeAnim, {
                                toValue: 1,
                                duration: 800,
                                useNativeDriver: true,
                            }).start();
                        });
                    }, 1000);
                } else {
                    setScanStatus('restricted');
                }
            }, 1500);
        }, 2000);
    };

    if (isAuthorized) {
        return (
            <Animated.View style={{ flex: 1, opacity: contentFadeAnim }}>
                {children}
            </Animated.View>
        );
    }

    return (
        <View className="flex-1 bg-[#020617]">
            <Animated.View 
                style={[StyleSheet.absoluteFill, { opacity: fadeAnim, zIndex: 50 }]}
            >
                <LinearGradient
                    colors={['#020617', '#1e1b4b', '#020617']}
                    className="flex-1 items-center justify-center px-8"
                >
                    {/* Security Scanner Container */}
                    <View className="items-center justify-center mb-12">
                        <Animated.View 
                            style={{ transform: [{ scale: pulseAnim }] }}
                            className="w-48 h-48 rounded-full bg-indigo-500/10 items-center justify-center border border-indigo-500/20"
                        >
                            <View className="w-40 h-40 rounded-full bg-indigo-500/20 items-center justify-center border border-indigo-500/40">
                                {scanStatus === 'granted' ? (
                                    <ShieldCheck size={80} color="#4ade80" strokeWidth={1.5} />
                                ) : scanStatus === 'restricted' ? (
                                    <Lock size={80} color="#f87171" strokeWidth={1.5} />
                                ) : (
                                    <Shield size={80} color="#818cf8" strokeWidth={1.5} />
                                )}
                            </View>
                        </Animated.View>

                        {/* Scanner Line */}
                        {(scanStatus === 'analyzing' || scanStatus === 'verifying') && (
                            <Animated.View 
                                style={{
                                    transform: [{ translateY: scanLineAnim }],
                                    position: 'absolute',
                                    top: 40,
                                    width: 180,
                                    height: 2,
                                    backgroundColor: '#818cf8',
                                    shadowColor: '#818cf8',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.8,
                                    shadowRadius: 10,
                                    elevation: 5,
                                }}
                            />
                        )}
                    </View>

                    {/* Status Text */}
                    <View className="items-center">
                        <Text className="text-indigo-200/50 text-xs font-bold tracking-widest uppercase mb-2">
                            OurEduca Sentinel Protocol
                        </Text>
                        <Text className="text-white text-3xl font-bold text-center mb-4">
                            {scanStatus === 'analyzing' && 'Scanning Identity...'}
                            {scanStatus === 'verifying' && 'Verifying Clearance...'}
                            {scanStatus === 'granted' && 'Access Granted'}
                            {scanStatus === 'restricted' && 'Access Restricted'}
                        </Text>
                        
                        <View className="flex-row items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <View className={`w-2 h-2 rounded-full ${
                                scanStatus === 'granted' ? 'bg-green-400' : 
                                scanStatus === 'restricted' ? 'bg-red-400' : 'bg-indigo-400'
                            }`} />
                            <Text className="text-gray-400 text-sm font-medium">
                                {scanStatus === 'analyzing' && 'Layer 1: Biometric Audit'}
                                {scanStatus === 'verifying' && 'Layer 2: Permission Matrix'}
                                {scanStatus === 'granted' && 'Administrative Rights Confirmed'}
                                {scanStatus === 'restricted' && 'Unauthorized Access Detected'}
                            </Text>
                        </View>
                    </View>

                    {/* Footer Bio Info */}
                    <View className="absolute bottom-12 items-center">
                        <Fingerprint size={32} color="#4f46e5" opacity={0.5} />
                        <Text className="text-indigo-300/30 text-[10px] mt-2 tracking-tighter">
                            SECURE ENCLAVE ACTIVE • AES-256 ENCRYPTION
                        </Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};
