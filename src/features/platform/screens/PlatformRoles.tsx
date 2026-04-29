import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Icons } from '../../../../components/Icons';
import { ModifyPermissionsModal } from '../modals/ModifyPermissionsModal';
import { AddRoleModal } from '../modals/AddRoleModal';
import { ViewRoleUsersModal } from '../modals/ViewRoleUsersModal';
import { EditRoleModal } from '../modals/EditRoleModal';
import { normalizePermissions } from '../constants';
import { User, UserRole } from '../../../../types';
import { AppTheme, AppCard, AppButton, AppTypography, AppRadius, AppRow, StatusPill } from '../../../design-system';
import { LinearGradient } from 'expo-linear-gradient';

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
        <View className="flex-1 bg-[#f5f7ff]">
            {/* High-Fidelity Header */}
            <LinearGradient 
                colors={AppTheme.colors.gradients.brand} 
                start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
                className="px-6 pt-5 pb-10 rounded-b-[40px] shadow-xl shadow-indigo-200"
            >
                <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                    <Icons.Admin size={140} color="white" />
                </View>
                <View className="flex-row justify-between items-center relative z-10 mb-5">
                    <View>
                        <Text className={`${AppTypography.heroTitle} text-white`}>System Roles</Text>
                        <Text className={`${AppTypography.eyebrow} text-white/60 mt-1`}>RBAC Configuration</Text>
                    </View>
                    {!schoolId && (
                        <TouchableOpacity 
                            onPress={() => setIsAddRoleModalVisible(true)} 
                            className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
                        >
                            <Icons.Plus size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 rounded-2xl border border-white/20 px-4 py-3 flex-row items-center relative z-10">
                    <Icons.Search size={18} color="white" opacity={0.8} />
                    <TextInput 
                        className="flex-1 ml-3 text-sm font-bold text-white p-0" 
                        placeholder="Filter system roles..." 
                        placeholderTextColor="rgba(255, 255, 255, 0.4)" 
                        selectionColor="white"
                        value={searchQuery} 
                        onChangeText={setSearchQuery} 
                    />
                </View>
            </LinearGradient>

            {/* Roles Eyebrow — Compactness consistent with dashboard */}
            <View className="flex-row items-center mt-6 mb-3 px-6">
                <View className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-[2px] font-inter-black">Role Management</Text>
            </View>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 60 }} 
                showsVerticalScrollIndicator={false}
            >
            {/* Role list — 3-zone AppCard */}
            <AppCard className="p-0 overflow-hidden mb-4">
                {filteredRoles.map((role, index) => {
                    const RoleIcon = (Icons as any)[role.icon] || Icons.Shield;
                    return (
                        <View key={role.id}>
                            <AppRow
                                title={role.name}
                                subtitle={role.description}
                                statusDot={role.usersCount > 0 ? 'active' : 'none'}
                                avatarIcon={<RoleIcon size={16} color={role.color} />}
                                avatarBg={`${role.color}18`}
                                pills={
                                    <View className="flex-row flex-wrap gap-1 mt-1">
                                        {role.permissions.slice(0, 3).map((perm, pi) => (
                                            <View key={pi} className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">
                                                <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-inter-black">{perm}</Text>
                                            </View>
                                        ))}
                                        {role.permissions.length > 3 && (
                                            <View className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                                                <Text className="text-[8px] font-black text-indigo-500 uppercase tracking-widest font-inter-black">+{role.permissions.length - 3}</Text>
                                            </View>
                                        )}
                                    </View>
                                }
                                meta={`${role.usersCount} users`}
                                showBorder={false}
                            />
                            {/* Inline action row */}
                            <View className={`flex-row gap-2 px-4 pb-3 ${index < filteredRoles.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <TouchableOpacity
                                    onPress={() => handleModifyPermissions(role)}
                                    className="flex-1 flex-row items-center justify-center bg-indigo-600 py-2 rounded-xl shadow-sm active:scale-95"
                                >
                                    <Icons.Shield size={12} color="white" />
                                    <Text className="text-white text-[10px] font-black uppercase tracking-wider ml-1.5 font-inter-black">Permissions</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleViewUsers(role)}
                                    className="flex-1 flex-row items-center justify-center bg-gray-50 border border-gray-100 py-2 rounded-xl active:scale-95"
                                >
                                    <Icons.Users size={12} color="#6b7280" />
                                    <Text className="text-gray-600 text-[10px] font-black uppercase tracking-wider ml-1.5 font-inter-black">Users</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleEditRole(role)}
                                    className="w-9 items-center justify-center bg-gray-50 border border-gray-100 rounded-xl active:scale-95"
                                >
                                    <Icons.Settings size={14} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </AppCard>

                {/* Permissions Guide Node */}
                <LinearGradient 
                    colors={['#1e1b4b', '#312e81']} 
                    start={{x: 0, y: 0}} 
                    end={{x: 1, y: 1}} 
                    style={{ borderRadius: 20 }}
                    className="p-5 flex-row items-center shadow-lg shadow-indigo-200 mt-2 overflow-hidden"
                >
                    <View className="absolute right-[-20] bottom-[-20] opacity-10 transform rotate-12">
                        <Icons.Shield size={120} color="white" />
                    </View>
                    <View className="flex-1 relative z-10">
                        <Text className="text-white font-black text-[15px] mb-1 tracking-tight font-inter-black">Access Control Guide</Text>
                        <Text className="text-indigo-300 text-[11px] leading-relaxed font-medium font-inter-medium">
                            Role-based access determines what data nodes each user can interact with across the institutional hierarchy.
                        </Text>
                    </View>
                </LinearGradient>
            </ScrollView>

            <ModifyPermissionsModal visible={isPermissionsModalVisible} onClose={() => setIsPermissionsModalVisible(false)} role={selectedRole} onSave={handleSavePermissions} showConfirm={showConfirm} showToast={showToast} />
            <AddRoleModal visible={isAddRoleModalVisible} onClose={() => setIsAddRoleModalVisible(false)} onSave={handleAddRole} />
            <ViewRoleUsersModal visible={isUsersModalVisible} onClose={() => { setIsUsersModalVisible(false); setSelectedRole(null); }} roleName={selectedRole?.name || ''} roleColor={selectedRole?.color || '#4f46e5'} users={users} institutes={institutes} onJumpToInstitute={(id) => { setIsUsersModalVisible(false); onJumpToInstitute?.(id); }} />
            <EditRoleModal visible={isEditModalVisible} onClose={() => setIsEditModalVisible(false)} role={selectedRole} onSave={handleSaveMetadata} />
        </View>
    );
};
