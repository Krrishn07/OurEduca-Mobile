import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Icons } from '@components/common/Icons';
import { ModifyPermissionsModal } from './modals/ModifyPermissionsModal';
import { AddRoleModal } from './modals/AddRoleModal';
import { ViewRoleUsersModal } from './modals/ViewRoleUsersModal';
import { EditRoleModal } from './modals/EditRoleModal';
import { normalizePermissions } from './constants';
import { User, UserRole } from '@/types';
import { AppTheme, AppCard, AppButton, AppTypography, AppRadius, AppRow, StatusPill, PlatinumSearchHeader, SectionHeader } from '@components/common';
import { LinearGradient } from 'expo-linear-gradient';
import { triggerHaptic } from '@utils/haptics';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  icon: string;
  color: string;
}

interface PlatformRolesProps {
    users?: User[];
    dbPermissions?: any[];
    onSavePermissions?: (roleKey: string, permissions: string[], schoolId?: string | null) => void;
    showConfirm?: (title: string, message: string, onConfirm: () => void, type: 'DANGER' | 'INFO') => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    schoolId?: string | null;
    schoolName?: string;
    institutes?: any[];
    onJumpToInstitute?: (schoolId: string) => void;
}

export const PlatformRoles: React.FC<PlatformRolesProps> = ({ 
    users = [], 
    dbPermissions = [], 
    onSavePermissions,
    showConfirm,
    showToast,
    schoolId = null,
    schoolName,
    institutes = [],
    onJumpToInstitute
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isPermissionsModalVisible, setIsPermissionsModalVisible] = useState(false);
    const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
    const [isUsersModalVisible, setIsUsersModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const initialRoles: Role[] = [
        { id: 'platform', name: 'Platform Admin', description: 'Full system access, managing server settings and school directory.', usersCount: (users || []).filter(u => u.role === UserRole.PLATFORM_ADMIN).length, icon: 'Shield', color: '#4f46e5', permissions: ['Global Control', 'Manage Schools', 'Billing', 'Settings'] },
        { id: 'headmaster', name: 'Headmaster', description: 'Institutional lead with control over staff, students, and finances.', usersCount: (users || []).filter(u => u.role === UserRole.SUPER_ADMIN).length, icon: 'Admin', color: '#9333ea', permissions: ['School Settings', 'Staff Management', 'Fee Management', 'Messaging'] },
        { id: 'teacher', name: 'Teacher', description: 'Responsible for classroom management and student interaction.', usersCount: (users || []).filter(u => u.role === UserRole.TEACHER).length, icon: 'Users', color: '#2563eb', permissions: ['Classroom Access', 'Resources', 'Messaging'] },
        { id: 'mentor', name: 'Mentor', description: 'Guidance-focused role managing specific student groups.', usersCount: (users || []).filter(u => u.role === UserRole.ADMIN_TEACHER).length, icon: 'Sparkles', color: '#16a34a', permissions: ['Classroom Access', 'Resources', 'Messaging', 'Monitoring'] },
        { id: 'student', name: 'Student', description: 'Access to academic materials and personal performance reports.', usersCount: (users || []).filter(u => u.role === UserRole.STUDENT).length, icon: 'Classes', color: '#ea580c', permissions: ['View Classes', 'View Resources', 'Pay Fees'] },
        { id: 'parent', name: 'Parent', description: 'Access to monitor ward performance and school payments.', usersCount: (users || []).filter(u => u.role === UserRole.PARENT).length, icon: 'Payment', color: '#db2777', permissions: ['Pay Fees', 'Communication'] }
    ];

    const [systemRoles, setSystemRoles] = useState<Role[]>(initialRoles);

    useEffect(() => {
        if (dbPermissions && dbPermissions.length > 0) {
            setSystemRoles(prev => prev.map(role => {
                const scopedMatch = dbPermissions.find(p => p.role === role.id && p.school_id === schoolId);
                const globalMatch = dbPermissions.find(p => p.role === role.id && p.school_id === null);
                const dbMatch = scopedMatch || globalMatch;
                if (dbMatch) return { ...role, permissions: normalizePermissions(dbMatch.permissions) };
                return role;
            }));
        }
    }, [dbPermissions, schoolId]);

    const filteredRoles = useMemo(() => {
        return systemRoles.filter(role => 
            role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [systemRoles, searchQuery]);

    const handleModifyPermissions = (role: Role) => { setSelectedRole(role); setIsPermissionsModalVisible(true); };
    const handleViewUsers = (role: Role) => { setSelectedRole(role); setIsUsersModalVisible(true); };
    const handleAddRole = (newRoleData: any) => {
        const newRole: Role = { id: Math.random().toString(36).substr(2, 9), ...newRoleData, usersCount: 0 };
        setSystemRoles(prev => [...prev, newRole]);
    };
    const handleSavePermissions = (updatedPermissions: string[]) => {
        if (!selectedRole) return;
        setSystemRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r));
        if (onSavePermissions) onSavePermissions(selectedRole.id, updatedPermissions, schoolId);
        setIsPermissionsModalVisible(false);
        setSelectedRole(null);
    };
    const handleEditRole = (role: Role) => { setSelectedRole(role); setIsEditModalVisible(true); };
    const handleSaveMetadata = (updatedData: any) => {
        if (!selectedRole) return;
        setSystemRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, ...updatedData } : r));
        if (showToast) showToast(`Role updated successfully.`, 'success');
        setIsEditModalVisible(false);
        setSelectedRole(null);
    };

    return (
        <View className="flex-1 bg-[#fbfbfe]">
            <PlatinumSearchHeader 
                title="System Roles"
                subtitle="RBAC CONFIGURATION"
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search roles, permissions..."
                rightAction={
                    !schoolId && (
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setIsAddRoleModalVisible(true); }} 
                            className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center shadow-md shadow-indigo-200 active:scale-95"
                        >
                            <Icons.Plus size={20} color="white" />
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Statistics Overview (Optional but premium) */}
                <View className="flex-row gap-3 mb-8">
                    <View className="flex-1 bg-indigo-50/50 p-4 rounded-[28px] border border-indigo-100/50">
                        <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-inter-black mb-1">Total Roles</Text>
                        <Text className="text-2xl font-black text-indigo-900 font-inter-black">{systemRoles.length}</Text>
                    </View>
                    <View className="flex-1 bg-emerald-50/50 p-4 rounded-[28px] border border-emerald-100/50">
                        <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-inter-black mb-1">Active Users</Text>
                        <Text className="text-2xl font-black text-emerald-900 font-inter-black">{users.length}</Text>
                    </View>
                </View>

                <SectionHeader 
                    title="INSTITUTIONAL HIERARCHY"
                    className="px-1 mb-4"
                />

                {filteredRoles.map((role, index) => {
                    const RoleIcon = (Icons as any)[role.icon] || Icons.Shield;
                    return (
                        <AppCard key={role.id} className="p-0 overflow-hidden mb-5 border-white shadow-xl shadow-indigo-100/20 rounded-[32px]">
                            <View className="p-5">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-row items-center flex-1 mr-4">
                                        <View 
                                            className="w-12 h-12 rounded-[20px] items-center justify-center mr-4 border border-white shadow-sm"
                                            style={{ backgroundColor: `${role.color}10` }}
                                        >
                                            <RoleIcon size={22} color={role.color} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[17px] font-black text-slate-900 font-inter-black tracking-tight leading-6">{role.name}</Text>
                                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-[2.5px] mt-1 font-inter-black opacity-80">{role.usersCount} Active Nodes</Text>
                                        </View>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-full ${role.usersCount > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                                        <Text className={`text-[8px] font-black uppercase tracking-widest font-inter-black ${role.usersCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {role.usersCount > 0 ? 'ACTIVE' : 'IDLE'}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-slate-500 text-[12px] leading-5 font-inter-medium mb-5 px-1">
                                    {role.description}
                                </Text>

                                <View className="flex-row flex-wrap gap-2 mb-6 px-1">
                                    {role.permissions.slice(0, 4).map((perm, pi) => (
                                        <View key={pi} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                            <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-inter-black">{perm}</Text>
                                        </View>
                                    ))}
                                    {role.permissions.length > 4 && (
                                        <View className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                                            <Text className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-inter-black">+{role.permissions.length - 4}</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => { triggerHaptic(); handleModifyPermissions(role); }}
                                        className="flex-[1.5] flex-row items-center justify-center bg-indigo-600 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95"
                                    >
                                        <Icons.Shield size={14} color="white" />
                                        <Text className="text-white text-[11px] font-black uppercase tracking-widest ml-2 font-inter-black">Manage Permissions</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { triggerHaptic(); handleViewUsers(role); }}
                                        className="flex-1 flex-row items-center justify-center bg-white border border-slate-100 py-3.5 rounded-2xl shadow-sm active:scale-95"
                                    >
                                        <Icons.Users size={14} color="#64748b" />
                                        <Text className="text-slate-600 text-[11px] font-black uppercase tracking-widest ml-2 font-inter-black">Users</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { triggerHaptic(); handleEditRole(role); }}
                                        className="w-12 h-12 items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl active:scale-95"
                                    >
                                        <Icons.Settings size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </AppCard>
                    );
                })}

                {/* Permissions Guide Node */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <LinearGradient 
                        colors={['#1e1b4b', '#312e81']} 
                        start={{x: 0, y: 0}} 
                        end={{x: 1, y: 1}} 
                        style={{ borderRadius: 32 }}
                        className="p-6 flex-row items-center shadow-2xl shadow-indigo-200 mt-2 overflow-hidden"
                    >
                        <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                            <Icons.Shield size={120} color="white" />
                        </View>
                        <View className="flex-1 relative z-10">
                            <Text className="text-white font-black text-[16px] mb-1 tracking-tight font-inter-black">RBAC Architecture</Text>
                            <Text className="text-indigo-300 text-[11px] leading-relaxed font-inter-medium opacity-80">
                                Role-based access determines what data nodes each user can interact with across the institutional hierarchy.
                            </Text>
                        </View>
                        <View className="bg-white/10 p-3 rounded-2xl border border-white/20 ml-4">
                            <Icons.Activity size={20} color="white" />
                        </View>
                    </LinearGradient>
                </Animated.View>
            </ScrollView>

            <ModifyPermissionsModal visible={isPermissionsModalVisible} onClose={() => setIsPermissionsModalVisible(false)} role={selectedRole} onSave={handleSavePermissions} showConfirm={showConfirm} showToast={showToast} />
            <AddRoleModal visible={isAddRoleModalVisible} onClose={() => setIsAddRoleModalVisible(false)} onSave={handleAddRole} />
            <ViewRoleUsersModal visible={isUsersModalVisible} onClose={() => { setIsUsersModalVisible(false); setSelectedRole(null); }} roleName={selectedRole?.name || ''} roleColor={selectedRole?.color || '#4f46e5'} users={users} institutes={institutes} onJumpToInstitute={(id) => { setIsUsersModalVisible(false); onJumpToInstitute?.(id); }} />
            <EditRoleModal visible={isEditModalVisible} onClose={() => setIsEditModalVisible(false)} role={selectedRole} onSave={handleSaveMetadata} />
        </View>
    );
};
