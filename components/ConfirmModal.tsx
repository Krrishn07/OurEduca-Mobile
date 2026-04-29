import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Icons } from './Icons';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    type: 'DANGER' | 'INFO';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    visible, title, message, onConfirm, onCancel, type 
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 items-center justify-center p-6">
                <View 
                    style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: 32, 
                        shadowColor: '#000', 
                        shadowOffset: { width: 0, height: 20 }, 
                        shadowOpacity: 0.2, 
                        shadowRadius: 40, 
                        elevation: 20 
                    }}
                    className="w-full max-w-sm p-8 items-center border border-gray-100"
                >
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${type === 'DANGER' ? 'bg-rose-50 shadow-inner' : 'bg-indigo-50 shadow-inner'}`}>
                         {type === 'DANGER' ? (
                            <View className="relative">
                                <Icons.Trash size={32} color="#e11d48" />
                                <View className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full items-center justify-center border-2 border-rose-50">
                                    <View className="w-1.5 h-1.5 bg-rose-500 rounded-full"></View>
                                </View>
                            </View>
                         ) : (
                            <Icons.Alert size={32} color="#4f46e5" />
                         )}
                    </View>
                    
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">{title}</Text>
                    <Text className="text-sm text-gray-500 text-center mb-8 leading-5 px-2">{message}</Text>
                    
                    <View className="w-full">
                        <TouchableOpacity 
                            onPress={onConfirm}
                            className={`w-full py-4 rounded-2xl items-center mb-3 ${type === 'DANGER' ? 'bg-rose-600' : 'bg-indigo-600'}`}
                        >
                            <Text className="text-white font-bold text-lg">Confirm Action</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={onCancel}
                            className="w-full py-4 rounded-2xl items-center bg-gray-50 border border-gray-100"
                        >
                            <Text className="text-gray-500 font-bold text-lg">Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
