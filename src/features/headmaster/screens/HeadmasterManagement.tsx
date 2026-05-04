import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../../../../components/Icons';
import { UserRole } from '../../../../types';
import { ManageRosterModal } from '../modals/ManageRosterModal';
import { IssueFeeModal } from '../modals/IssueFeeModal';
import { AppTheme, AppCard, AppRow, AppButton, AppTypography, AppRadius, SectionHeader, StatusPill } from '../../../design-system';

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
  const [activeTab, setActiveTab] = useState<ManagementTab>('FACULTY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<any | null>(null);
  const [rosterItemToRemove, setRosterItemToRemove] = useState<any | null>(null);

  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showIssueFeeModal, setShowIssueFeeModal] = useState(false);
  const [rosterAssignType, setRosterAssignType] = useState<'TEACHER' | 'STUDENT' | 'MENTOR'>('STUDENT');

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100 }}>
          {/* Teacher List Section */}
          <SectionHeader 
            title="TEACHER LIST"
            className="px-2"
            rightElement={
              <TouchableOpacity 
                  onPress={() => { setRosterAssignType('TEACHER'); setShowRosterModal(true); }}
                  className="w-8 h-8 bg-indigo-600 items-center justify-center rounded-xl shadow-lg shadow-indigo-200"
              >
                  <Icons.Plus size={16} color="white" />
              </TouchableOpacity>
            }
          />
          <AppCard className="mb-8 p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {mentor && (
              <AppRow 
                title={mentor.users?.name}
                subtitle="Class Mentor"
                avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                showBorder={teachers.length > 0}
                rightElement={
                  <TouchableOpacity onPress={() => setRosterItemToRemove(mentor)} className="w-8 h-8 bg-rose-50 items-center justify-center rounded-xl border border-rose-100 active:scale-95">
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
                  <TouchableOpacity onPress={() => setRosterItemToRemove(t)} className="w-8 h-8 bg-rose-50 items-center justify-center rounded-xl border border-rose-100 active:scale-95">
                      <Icons.Trash size={12} color="#f43f5e" />
                  </TouchableOpacity>
                }
              />
            ))}
          </AppCard>

          {/* Student List Section */}
          <SectionHeader 
            title="STUDENT LIST"
            className="px-2"
            rightElement={
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => setShowIssueFeeModal(true)} className="w-8 h-8 bg-white items-center justify-center rounded-xl border border-indigo-100 shadow-sm active:scale-95">
                        <Icons.Payment size={14} color="#4f46e5" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => { setRosterAssignType('STUDENT'); setShowRosterModal(true); }}
                        className="w-8 h-8 bg-indigo-600 items-center justify-center rounded-xl shadow-lg shadow-indigo-200"
                    >
                        <Icons.Plus size={16} color="white" />
                    </TouchableOpacity>
                </View>
            }
          />
          <AppCard className="mb-6 p-0 overflow-hidden border border-white shadow-xl shadow-indigo-100/30">
            {students.map((rosterItem, idx) => (
              <AppRow 
                key={rosterItem.id}
                title={rosterItem.users?.name}
                subtitle="Enrolled Student"
                avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                avatarBg="#eef2ff"
                showBorder={idx < students.length - 1}
                rightElement={
                  <TouchableOpacity onPress={() => setRosterItemToRemove(rosterItem)} className="w-8 h-8 bg-rose-50 items-center justify-center rounded-xl border border-rose-100 active:scale-95">
                      <Icons.Trash size={12} color="#f43f5e" />
                  </TouchableOpacity>
                }
              />
            ))}
          </AppCard>
      </ScrollView>
    );
  };

  const renderActiveList = () => {
    if (selectedSection) return renderSectionDetails();

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100 }}>
            {/* Navigation Tabs */}
            <View className="flex-row bg-indigo-50/50 p-1 rounded-[24px] border border-indigo-100/30 mb-8 shadow-sm">
                {(['FACULTY', 'STUDENTS', 'CLASSES'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    const count = tab === 'FACULTY' ? facultyData.length : tab === 'STUDENTS' ? studentsData.length : classesData.length;
                    const label = tab === 'FACULTY' ? 'Teachers' : tab === 'STUDENTS' ? 'Students' : 'Classes';
                    return (
                        <TouchableOpacity 
                            key={tab} 
                            onPress={() => { setActiveTab(tab); setSearchQuery(''); }} 
                            className={`flex-1 py-3.5 rounded-[20px] items-center ${isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : ''}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-indigo-400'}`}>
                              {label} <Text className={isActive ? 'text-white/60' : 'text-indigo-300'}>({count})</Text>
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List Header */}
            <SectionHeader 
                title="SCHOOL DIRECTORY"
                className="px-2"
                rightElement={
                    <View className="flex-row items-center gap-2">
                        <View className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 flex-row items-center shadow-sm">
                            <Icons.Search size={12} color="#6366f1" />
                            <TextInput 
                                className="ml-2 text-[10px] font-black text-gray-800 h-4 p-0 min-w-[60px]" 
                                placeholder="SEARCH..." 
                                placeholderTextColor="#94a3b8" 
                                value={searchQuery} 
                                onChangeText={setSearchQuery} 
                            />
                        </View>
                    </View>
                }
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
                            subtitle={user.grade || 'Registered Student'}
                            avatarIcon={<Icons.Profile size={15} color="#4f46e5" />}
                            avatarBg="#eef2ff"
                            showBorder={idx < studentsData.length - 1}
                            rightElement={<Icons.ChevronRight size={13} color="#d1d5db" />}
                        />
                    ))}
                  </AppCard>
                )}
                {activeTab === 'CLASSES' && classesData.map((cls) => (
                    <TouchableOpacity 
                        key={cls.id} 
                        onPress={() => handleSectionClick(cls, cls.sections?.[0] || 'A')}
                        className="w-[48.2%] mb-4"
                        activeOpacity={0.9}
                    >
                      <AppCard className="p-4 border border-white shadow-xl shadow-indigo-100/30 items-center justify-center aspect-square">
                        <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mb-3 border border-indigo-100">
                          <Icons.Classes size={18} color="#4f46e5" />
                        </View>
                        <Text className="text-[13px] font-black text-gray-900 text-center font-inter-black" numberOfLines={1}>{cls.name}</Text>
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 font-inter-black">{cls.sections?.length || 1} Sections</Text>
                      </AppCard>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-[#f5f7ff]">
        {/* Platinum Banner Node - 140px Sync */}
        <LinearGradient 
            colors={AppTheme.colors.gradients.brand} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
            className="h-[140px] px-6 pt-5 rounded-b-[40px] relative shadow-2xl shadow-indigo-200/50 z-30"
        >
            <View className="flex-row justify-between items-start mb-5 relative z-10">
                <View className="flex-1 mr-4">
                    <Text className={`${AppTypography.heroTitle} text-white font-inter-black`} numberOfLines={1}>
                        {selectedSection ? `${selectedClass?.name || ''} — ${selectedSection}` : 'Management'}
                    </Text>
                </View>
                <TouchableOpacity 
                    onPress={selectedSection ? () => { setSelectedClass(null); setSelectedSection(null); } : (activeTab === 'CLASSES' ? onShowAddClassModal : (activeTab === 'STUDENTS' ? onShowAddStudentModal : onShowAddTeacherModal))}
                    className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center border border-white/20 active:scale-95"
                >
                    {selectedSection ? <Icons.Close size={20} color="white" /> : <Icons.Plus size={20} color="white" />}
                </TouchableOpacity>
            </View>
            <View className="absolute right-[-15] bottom-[-15] opacity-10 rotate-12">
                <Icons.Grid size={130} color="white" />
            </View>
        </LinearGradient>

        <View className="flex-1 relative z-20">
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
    </View>
  );
};
