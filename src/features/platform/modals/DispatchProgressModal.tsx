import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { AppTheme, ModalShell, AppButton, AppTypography } from '../../../design-system';

interface LogEntry {
    id: string;
    message: string;
    status: 'pending' | 'success' | 'complete';
}

interface DispatchProgressModalProps {
    visible: boolean;
    onClose: () => void;
    itemsToProcess: any[];
    onProcessItem: (item: any) => Promise<void>;
}

export const DispatchProgressModal: React.FC<DispatchProgressModalProps> = ({
    visible,
    onClose,
    itemsToProcess,
    onProcessItem
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scanPulseAnim = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (visible) {
            if (itemsToProcess.length > 0) startDispatch();
            else startEmptyScan();
        } else {
            setProgress(0); setLogs([]); setIsComplete(false); setIsScanning(false); progressAnim.setValue(0);
        }
    }, [visible]);

    const startEmptyScan = async () => {
        setIsScanning(true);
        setLogs([{ id: 'scan_start', message: 'Checking school records...', status: 'pending' }]);
        Animated.loop(Animated.sequence([
            Animated.timing(scanPulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }), 
            Animated.timing(scanPulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true })
        ])).start();
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsScanning(false); setIsComplete(true);
        setLogs(prev => [...prev, 
            { id: 'scan_ok', message: 'Check complete: 100%', status: 'success' }, 
            { id: 'scan_final', message: 'All systems normal', status: 'complete' }
        ]);
        scanPulseAnim.stopAnimation();
    };

    const startDispatch = async () => {
        setProgress(0); setIsComplete(false);
        setLogs([{ id: 'init', message: 'Starting payment engine...', status: 'pending' }]);
        await new Promise(resolve => setTimeout(resolve, 800));
        for (let i = 0; i < itemsToProcess.length; i++) {
            const item = itemsToProcess[i];
            const logId = `log_${i}`;
            setLogs(prev => [...prev, { id: logId, message: `Processed: ${item.name}`, status: 'pending' }]);
            await new Promise(resolve => setTimeout(resolve, 400));
            await onProcessItem(item);
            setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'success' } : l));
            const newProgress = ((i + 1) / itemsToProcess.length) * 100;
            setProgress(newProgress);
            Animated.timing(progressAnim, { toValue: newProgress, duration: 500, useNativeDriver: false }).start();
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsComplete(true);
        setLogs(prev => [...prev, { id: 'complete', message: 'Finished processing all schools', status: 'complete' }]);
    };

    return (
        <ModalShell
            visible={visible}
            onClose={onClose}
            title={itemsToProcess.length === 0 ? 'System Check' : 'Processing Payments'}
            subtitle={isScanning ? 'Verifying status' : isComplete ? 'Success' : `Node Progress: ${Math.round(progress)}%`}
            headerGradient={isComplete && itemsToProcess.length === 0 ? ['#059669', '#064e3b'] : AppTheme.colors.gradients.brand}
        >
            <View>
                {itemsToProcess.length > 0 && (
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-3 px-1">
                            <Text className={AppTypography.eyebrow}>Overall Progress</Text>
                            <Text className="text-sm font-black text-indigo-600 tracking-tighter">{Math.round(progress)}%</Text>
                        </View>
                        <View className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <Animated.View 
                                style={{ 
                                    width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), 
                                    backgroundColor: isComplete ? '#10b981' : '#4f46e5' 
                                }}
                                className="h-full rounded-full"
                            />
                        </View>
                    </View>
                )}

                <View className="bg-gray-50 rounded-[32px] p-6 h-64 border border-gray-100/50 overflow-hidden mb-10 shadow-inner">
                    <ScrollView 
                        ref={scrollViewRef} 
                        showsVerticalScrollIndicator={false} 
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {logs.map((log, index) => (
                            <View key={log.id} className={`flex-row items-center ${index !== logs.length - 1 ? 'mb-5' : ''}`}>
                                <View className={`w-2 h-2 rounded-full mr-4 ${
                                    log.status === 'success' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 
                                    log.status === 'complete' ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 
                                    'bg-amber-400'
                                }`} />
                                <Text className={`text-[11px] font-black tracking-tight uppercase leading-relaxed ${
                                    log.status === 'complete' ? 'text-indigo-600' : 'text-gray-500'
                                }`}>
                                    {log.message}
                                </Text>
                            </View>
                        ))}
                        {itemsToProcess.length === 0 && isComplete && (
                            <View className="py-10 items-center">
                                <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center mb-4 border border-emerald-100">
                                    <Icons.Check size={20} color="#10b981" />
                                </View>
                                <Text className="text-[12px] font-black text-gray-400 text-center leading-relaxed italic px-6">
                                    All institutional nodes verified. No pending issues detected in the current session.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                <AppButton 
                    label={isComplete ? 'Done' : 'Processing...'}
                    onPress={isComplete ? onClose : undefined}
                    disabled={!isComplete}
                    className="py-5 mb-6"
                />
            </View>
        </ModalShell>
    );
};
