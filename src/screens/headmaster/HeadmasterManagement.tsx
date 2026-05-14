import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';
import { Icons } from '@components/common/Icons';
import { UserRole } from '@/types';
import { ManageRosterModal } from '@screens/headmaster/modals/ManageRosterModal';
import { IssueFeeModal } from '@screens/headmaster/modals/IssueFeeModal';
import { 
    AppTheme, 
    AppCard, 
    AppRow, 
    AppButton, 
    AppTypography, 
    SectionHeader, 
    StatusPill, 
    PlatinumSearchHeader 
} from '@components/common';
import { triggerHaptic } from '@utils/haptics';
import { QRInvitationModal } from '@screens/headmaster/modals/QRInvitationModal';
import { useSchoolData } from '@context/SchoolDataContext';
import { useMockAuth } from '@context/MockAuthContext';

const { width } = Dimensions.get('window');

interface HeadmasterManagementProps {
  users: any[];
  dbStaff: any[];
  dbStudents: any[];
  dbClasses: any[];
  dbRoster: any[];
  onShowAddClassModal: () => void;
  onShowAddTeacherModal: () => void;
  onShowAddStudentModal: () => void;
  onEditStaff: (user: any) => void;
  onDeleteStaff: (id: string) => Promise<void> | void;
  onEditStudent: (student: any) => void;
  onDeleteStudent: (id: string) => Promise<void> | void;
  onEditClass: (cls: any) => void;
  onDeleteClass: (id: string) => Promise<void> | void;
  onAssignToRoster: (classId: string, section: string, user: any, subject?: string, rosterType?: 'TEACHER' | 'STUDENT' | 'MENTOR') => void;
  onRemoveFromRoster: (rosterId: string) => Promise<void> | void;
  onIssueBulkFee?: (studentIds: string[], title: string, amount: number, dueDate: string) => Promise<void>;
}

type ManagementTab = 'FACULTY' | 'STUDENTS' | 'CLASSES';

export const HeadmasterManagement: React.FC<HeadmasterManagementProps> = ({
  users = [],
  dbStaff = [],
  dbStudents = [],
  dbClasses = [],
  dbRoster = [],

  onShowAddClassModal,
  onShowAddTeacherModal,
  onShowAddStudentModal,
  onEditStaff,
  onEditStudent,
  onEditClass,
  onDeleteClass,
  onAssignToRoster,
  onRemoveFromRoster,
  onIssueBulkFee,
}) => {
  const { currentSchool } = useMockAuth();
  const [activeTab, setActiveTab] = useState<ManagementTab>('FACULTY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<any | null>(null);
  const [rosterItemToRemove, setRosterItemToRemove] = useState<any | null>(null);

  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showIssueFeeModal, setShowIssueFeeModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [rosterAssignType, setRosterAssignType] = useState<'TEACHER' | 'STUDENT' | 'MENTOR'>('STUDENT');
  const [searchVisible, setSearchVisible] = useState(false);

  const facultyData = useMemo(() => {
    const list = dbStaff.length > 0 ? dbStaff : users.filter((u: any) => u.role === UserRole.TEACHER || u.role === UserRole.ADMIN_TEACHER || u.role === UserRole.SUPER_ADMIN);
    return (list || []).filter((u: any) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [dbStaff, users, searchQuery]);

  const studentsData = useMemo(() => {
    const list = dbStudents.length > 0 ? dbStudents : users.filter((u: any) => u.role === UserRole.STUDENT);
    return list.filter((u: any) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [dbStudents, users, searchQuery]);

  const classesData = useMemo(() => {
    return dbClasses.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [dbClasses, searchQuery]);

  const handleSectionClick = (cls: any, section: string) => {
    triggerHaptic();
    setSelectedClass(cls);
    setSelectedSection(section);
  };

  const renderSectionDetails = () => {
    if (!selectedClass || !selectedSection) return null;
    const sectionRoster = dbRoster.filter(r => r.class_id === selectedClass.id && r.section === selectedSection);
    const mentor = sectionRoster.find(r => r.role_in_class === 'mentor');
    const teachers = sectionRoster.filter(r => r.role_in_class === 'teacher');
    const students = sectionRoster.filter(r => r.role_in_class === 'student');

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}>
          <Animated.View entering={FadeInDown.duration(400)} layout={Layout.springify()}>
              {/* Teacher List Section */}
              <SectionHeader 
                title="FACULTY ROSTER"
                className="px-1"
                rightElement={
                  <TouchableOpacity 
                      onPress={() => { triggerHaptic(); setRosterAssignType('TEACHER'); setShowRosterModal(true); }}
                      className="bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg shadow-indigo-200 active:scale-95"
                  >
                      <Text className="text-[10px] font-black text-white uppercase tracking-[1px] font-inter-black">+ ASSIGN</Text>
                  </TouchableOpacity>
                }
              />
              <AppCard className="mb-8 p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                {mentor && (
                  <AppRow 
                    title={mentor.users?.name}
                    subtitle="Institutional Mentor"
                    avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={teachers.length > 0}
                    rightElement={
                      <TouchableOpacity onPress={() => { triggerHaptic(); setRosterItemToRemove(mentor); }} className="w-8 h-8 bg-rose-50 items-center justify-center rounded-xl border border-rose-100 active:scale-95">
                          <Icons.Trash size={12} color="#f43f5e" />
                      </TouchableOpacity>
                    }
                  />
                )}
                {teachers.filter(t => t.user_id !== mentor?.user_id).map((t, idx, arr) => (
                  <AppRow 
                    key={t.id}
                    title={t.users?.name}
                    subtitle={t.subject || 'Subject Teacher'}
                    avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={idx < arr.length - 1}
                    rightElement={
                      <TouchableOpacity onPress={() => { triggerHaptic(); setRosterItemToRemove(t); }} className="w-8 h-8 bg-rose-50 items-center justify-center rounded-xl border border-rose-100 active:scale-95">
                          <Icons.Trash size={12} color="#f43f5e" />
                      </TouchableOpacity>
                    }
                  />
                ))}
                {teachers.length === 0 && !mentor && (
                    <View className="py-8 items-center opacity-30">
                        <Icons.Users size={20} color="#6366f1" />
                        <Text className="text-[10px] font-black uppercase mt-2 font-inter-black">No Faculty Assigned</Text>
                    </View>
                )}
              </AppCard>

              {/* Student List Section */}
              <SectionHeader 
                title="ENROLLED STUDENTS"
                className="px-1"
                rightElement={
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setShowIssueFeeModal(true); }} 
                            className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 active:scale-95"
                        >
                             <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-[1px] font-inter-black">ISSUE FEE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setShowQrModal(true); }} 
                            className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 active:scale-95"
                        >
                             <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-[1px] font-inter-black">QR INVITE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { triggerHaptic(); setRosterAssignType('STUDENT'); setShowRosterModal(true); }}
                            className="bg-indigo-600 px-3 py-1.5 rounded-full shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            <Text className="text-[10px] font-black text-white uppercase tracking-[1px] font-inter-black">+ ADD</Text>
                        </TouchableOpacity>
                    </View>
                }
              />
              <AppCard className="mb-6 p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                {students.map((rosterItem, idx) => (
                  <AppRow 
                    key={rosterItem.id}
                    title={rosterItem.users?.name}
                    subtitle={`Roll: ${rosterItem.users?.roll_number || 'N/A'}`}
                    avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                    avatarBg="#eef2ff"
                    showBorder={idx < students.length - 1}
                    rightElement={
                      <TouchableOpacity onPress={() => { triggerHaptic(); setRosterItemToRemove(rosterItem); }} className="w-8 h-8 bg-rose-50 items-center justify-center rounded-xl border border-rose-100 active:scale-95">
                          <Icons.Trash size={12} color="#f43f5e" />
                      </TouchableOpacity>
                    }
                  />
                ))}
                {students.length === 0 && (
                    <View className="py-12 items-center opacity-30">
                        <Icons.Profile size={24} color="#6366f1" />
                        <Text className="text-[10px] font-black uppercase mt-2 font-inter-black">Empty Roster</Text>
                    </View>
                )}
              </AppCard>
          </Animated.View>
      </ScrollView>
    );
  };

  const renderActiveList = () => {
    if (selectedSection) return renderSectionDetails();

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}>
            {/* Navigation Tabs - Platinum Switcher */}
            <View className="bg-gray-50/80 p-1.5 rounded-[28px] border border-gray-100/50 flex-row shadow-sm mb-8">
                {(['FACULTY', 'STUDENTS', 'CLASSES'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    const label = tab === 'FACULTY' ? 'FACULTY' : tab === 'STUDENTS' ? 'SCHOLARS' : 'CLASSES';
                    return (
                        <TouchableOpacity 
                            key={tab} 
                            onPress={() => { triggerHaptic(); setActiveTab(tab); setSearchQuery(''); }} 
                            activeOpacity={0.9}
                            className={`flex-1 py-3.5 rounded-[22px] items-center transition-all ${
                                isActive ? 'bg-indigo-600 shadow-xl shadow-indigo-200' : 'bg-transparent'
                            }`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-[1px] font-inter-black ${
                                isActive ? 'text-white' : 'text-gray-400'
                            }`}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Animated.View entering={FadeInDown.duration(400)} layout={Layout.springify()}>
                <SectionHeader 
                    title={`${activeTab} DIRECTORY`}
                    className="px-1"
                />

                <View className={activeTab === 'CLASSES' ? 'flex-row flex-wrap justify-between' : 'p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30 rounded-[28px]'}>
                    {activeTab === 'FACULTY' && (
                      <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                        {facultyData.map((user, idx) => (
                            <AppRow 
                                key={user.id} 
                                onPress={() => onEditStaff(user)}
                                title={user.name}
                                subtitle={String(user.role).replace('_', ' ')}
                                avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                                avatarBg="#eef2ff"
                                showBorder={idx < facultyData.length - 1}
                                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                            />
                        ))}
                      </AppCard>
                    )}
                    {activeTab === 'STUDENTS' && (
                      <AppCard className="p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
                        {studentsData.map((user, idx) => (
                            <AppRow 
                                key={user.id} 
                                onPress={() => onEditStudent(user)}
                                title={user.name}
                                subtitle={user.grade || 'Academic Record Active'}
                                avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                                avatarBg="#eef2ff"
                                showBorder={idx < studentsData.length - 1}
                                rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                            />
                        ))}
                      </AppCard>
                    )}
                    {activeTab === 'CLASSES' && classesData.map((cls) => (
                        <View key={cls.id} className="w-[48.2%] mb-4">
                          <AppCard className="p-4 border border-white shadow-xl shadow-indigo-100/30 items-center">
                            <TouchableOpacity 
                                onPress={() => handleSectionClick(cls, cls.sections?.[0] || 'A')}
                                className="items-center w-full"
                            >
                                <View className="w-12 h-12 bg-indigo-50 rounded-[20px] items-center justify-center mb-3 border border-indigo-100/50">
                                <Icons.Classes size={20} color="#4f46e5" />
                                </View>
                                <Text className="text-[14px] font-black text-gray-900 text-center font-inter-black" numberOfLines={1}>{cls.name}</Text>
                            </TouchableOpacity>

                            <View className="flex-row flex-wrap justify-center gap-1.5 mt-4">
                                {(cls.sections || ['A']).map((sec: string) => (
                                    <TouchableOpacity 
                                        key={`${cls.id}-${sec}`}
                                        onPress={() => handleSectionClick(cls, sec)}
                                        className="bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-sm active:scale-90"
                                    >
                                        <Text className="text-[10px] font-black text-indigo-600 font-inter-black">{sec}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            <Text className="text-[8px] font-black text-gray-400 uppercase tracking-[1px] mt-3 font-inter-black">
                                SELECT SECTION
                            </Text>
                          </AppCard>
                        </View>
                    ))}
                </View>
            </Animated.View>
        </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-[#fbfbfe]">
        <PlatinumSearchHeader 
            title={selectedSection ? `${selectedClass?.name || ''} — ${selectedSection}` : 'Management'}
            subtitle={selectedSection ? 'ROSTER MANAGEMENT' : 'SCHOOL DIRECTORY'}
            onBack={selectedSection ? () => { triggerHaptic(); setSelectedClass(null); setSelectedSection(null); } : undefined}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchVisible={searchVisible}
            onSearchToggle={setSearchVisible}
            rightAction={
                <TouchableOpacity 
                    onPress={() => { 
                        triggerHaptic();
                        if (selectedSection) {
                            setSelectedClass(null); 
                            setSelectedSection(null);
                        } else {
                            if (activeTab === 'CLASSES') onShowAddClassModal();
                            else if (activeTab === 'STUDENTS') onShowAddStudentModal();
                            else onShowAddTeacherModal();
                        }
                    }}
                    className="w-9 h-9 bg-indigo-600 rounded-full items-center justify-center shadow-md shadow-indigo-200 active:scale-95"
                >
                    {selectedSection ? <Icons.Close size={18} color="white" /> : <Icons.Plus size={18} color="white" />}
                </TouchableOpacity>
            }
        />

        <View className="flex-1">
            {renderActiveList()}
        </View>

        <Modal visible={!!classToDelete} transparent={true} animationType="fade">
            <View className="flex-1 bg-black/60 items-center justify-center p-8">
                <AppCard className="p-8 w-full max-w-[340px] rounded-[32px]">
                    <Text className="text-xl font-black text-gray-900 text-center mb-2 font-inter-black">Delete Class?</Text>
                    <Text className="text-gray-500 text-center mb-8 text-sm font-medium font-inter-medium">This action will permanently remove the class and all records. It cannot be undone.</Text>
                    <View className="flex-row gap-3">
                        <AppButton 
                            label="Cancel"
                            variant="outline"
                            onPress={() => setClassToDelete(null)}
                            className="flex-1"
                        />
                        <AppButton 
                            label="Delete"
                            variant="danger"
                            onPress={async () => { if (classToDelete) { await onDeleteClass(classToDelete.id); setClassToDelete(null); } }}
                            className="flex-1"
                        />
                    </View>
                </AppCard>
            </View>
        </Modal>

        <ManageRosterModal visible={showRosterModal} onClose={() => setShowRosterModal(false)} staff={dbStaff} students={dbStudents} assignType={rosterAssignType} onAssign={(user, sub, roleInClass) => { if (selectedClass && selectedSection) onAssignToRoster(selectedClass.id, selectedSection, user, sub, roleInClass as any); }} />
        <IssueFeeModal visible={showIssueFeeModal} onClose={() => setShowIssueFeeModal(false)} targetName={`${selectedClass?.name || ''} - ${selectedSection || ''}`} onIssue={async (title, amount, due) => { if (onIssueBulkFee && selectedClass && selectedSection) { const students = dbRoster.filter(r => r.class_id === selectedClass.id && (r.section === selectedSection || !r.section) && r.role_in_class === 'student').map(r => r.user_id); await onIssueBulkFee(students, title, amount, due); } }} />
        <QRInvitationModal 
            visible={showQrModal} 
            onClose={() => setShowQrModal(false)}
            schoolId={currentSchool?.id || 'demo-school'}
            schoolName={currentSchool?.name || 'Institutional Academy'}
            classId={selectedClass?.id || ''}
            targetClassName={selectedClass?.name || ''}
            section={selectedSection || ''}
        />
    </View>
  );
};
