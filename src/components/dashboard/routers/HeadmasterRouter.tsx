import React from 'react';
import { UserRole } from '@/types';

import { HeadmasterHome } from '@screens/headmaster/HeadmasterHome';
import { HeadmasterManagement } from '@screens/headmaster/HeadmasterManagement';
import { HeadmasterMessages } from '@screens/headmaster/HeadmasterMessages';
import { HeadmasterFees } from '@screens/headmaster/HeadmasterFees';
import { HeadmasterSettings } from '@screens/headmaster/HeadmasterSettings';
import { HeadmasterProfile } from '@screens/headmaster/HeadmasterProfile';

import { DashboardDomainBundles } from '@/types/dashboard';
import { RestrictedAccessView } from '@components/common/RestrictedAccessView';
import { AnnouncementsScreen } from '@components/common';

interface HeadmasterRouterProps {
    bundle: DashboardDomainBundles['headmaster'];
    common: DashboardDomainBundles['common'];
}

export const HeadmasterRouter: React.FC<HeadmasterRouterProps> = ({ bundle, common }) => {
    const { data, actions } = bundle;
    const { activeTab, currentUser, currentUserRole, currentSchool, onNavigate, onLogout, hasPermission } = common;

    switch (activeTab) {
        case 'home': 
            return (
                <HeadmasterHome 
                    dbStudents={data.dbStudents}
                    users={data.users}
                    dbStaff={data.dbStaff}
                    dbClasses={data.dbClasses}
                    announcements={data.announcements}
                    attendanceRate={data.attendanceRate || '...'}
                    systemLogs={data.systemLogs}
                    onPostNotice={() => actions.setShowAnnouncementModal(true)}
                    onShowHistory={() => onNavigate?.('notices')}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowNoticeDetail={actions.handleShowNoticeDetail}
                    currentSchool={currentSchool}
                    onNavigate={onNavigate}
                    currentUser={currentUser}
                    userName={currentUser?.name || ''}
                />
            );
        case 'manage': 
            if (hasPermission && !hasPermission('manage')) {
                return (
                    <RestrictedAccessView 
                        featureName="Staff Management" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <HeadmasterManagement 
                    users={data.users}
                    dbStaff={data.dbStaff}
                    dbStudents={data.dbStudents}
                    dbClasses={data.dbClasses}
                    dbRoster={data.dbRoster}
                    onShowAddClassModal={() => {
                        actions.setEditingClassId(null);
                        actions.setNewClassName('');
                        actions.setClassSections('A, B, C, D');
                        actions.setShowAddClassModal(true);
                    }}
                    onShowAddTeacherModal={() => {
                        actions.setUserForm({ name: '', email: '', subject: '', phone: '', office: '' });
                        actions.setUserModalType('TEACHER');
                        actions.setUserModalMode('ADD');
                        actions.setShowAddTeacherModal(true);
                    }}
                    onShowAddStudentModal={() => {
                        actions.setStudentForm({ name: '', roll: '', email: '', phone: '', grade: '' });
                        actions.setEditingUserId(null); 
                        actions.setShowAddStudentModal(true);
                    }}
                    onEditStaff={actions.handleEditStaff}
                    onDeleteStaff={actions.handleDeleteStaff}
                    onEditClass={(cls: any) => {
                        actions.setEditingClassId(cls.id);
                        actions.setNewClassName(cls.name);
                        actions.setClassSections(cls.sections ? cls.sections.join(', ') : 'A, B, C, D');
                        actions.setShowAddClassModal(true);
                    }}
                    onDeleteClass={actions.handleDeleteClass}
                    onEditStudent={(student: any) => {
                        actions.setEditingUserId(student.id);
                        actions.setStudentForm({ 
                            name: student.name, 
                            email: student.email || '', 
                            roll: student.roll_number || '',
                            phone: student.phone || '',
                            grade: student.grade || ''
                        });
                        actions.setShowAddStudentModal(true);
                    }}
                    onDeleteStudent={actions.handleDeleteStudent}
                    onAssignToRoster={actions.handleAssignToRoster}
                    onRemoveFromRoster={actions.handleRemoveFromRoster}
                    onIssueBulkFee={(studentIds: string[], title: string, amount: number, due: string) => 
                        actions.issueBulkFee(currentSchool?.id || '', studentIds, title, amount, due)}
                />
            );
        case 'messages': 
            if (hasPermission && !hasPermission('messages')) {
                return (
                    <RestrictedAccessView 
                        featureName="Institutional Communications" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <HeadmasterMessages 
                    selectedChat={common.selectedChat}
                    setSelectedChat={common.setSelectedChat}
                    msgInput={common.msgInput}
                    setMsgInput={common.setMsgInput}
                    displayContacts={common.getDisplayContacts()}
                    chatMessages={common.transformedChatMessages}
                    currentUser={currentUser}
                    handleSendMessage={common.handleSendMessage}
                />
            ); 
        case 'fees': 
            if (hasPermission && !hasPermission('fees')) {
                return (
                    <RestrictedAccessView 
                        featureName="Financial Management" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <HeadmasterFees 
                    paymentNotifications={(data.dbTransactions || []).map((tx: any) => ({
                        id: tx.id,
                        feeId: tx.fee_id,
                        studentId: tx.student_id,
                        schoolName: tx.student_name || tx.users?.name || 'Student',
                        date: tx.paid_at ? new Date(tx.paid_at).toLocaleDateString() : (tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'N/A'),
                        amount: Number(tx.amount || 0).toLocaleString(),
                        status: tx.status === 'VERIFIED' ? 'Verified' : (tx.status === 'REJECTED' ? 'Flagged' : 'Verify Now')
                    }))}
                    onVerify={actions.handleVerifyTransaction}
                    onSettleManual={actions.handleSettleFeeManual}
                    collectionTrends={data.collectionTrends || []}
                    totalCollected={data.totalCollected || 0}
                    pendingVerification={data.pendingVerification || 0}
                    onCreateFee={() => actions.setShowIssueFeeModal(true)}
                    onSendReminder={() => actions.handleSendReminder()}
                    onViewLedger={() => actions.setShowFeeLedgerModal(true)}
                    onViewReport={() => actions.setShowFeesReportModal(true)}
                />
            );
        case 'notices':
            return (
                <AnnouncementsScreen 
                    announcements={data.announcements}
                    currentUser={currentUser}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowNoticeDetail={actions.handleShowNoticeDetail}
                    onBack={() => onNavigate?.('home')}
                />
            );
        case 'settings':
            if (hasPermission && !hasPermission('settings')) {
                return (
                    <RestrictedAccessView 
                        featureName="Institutional Settings" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <HeadmasterSettings 
                    onSave={actions.handleUpdatePaymentConfig}
                />
            );
        case 'profile':
            return (
                <HeadmasterProfile 
                    currentUser={currentUser!}
                    onLogout={onLogout || (() => {})}
                    onEdit={() => {}} // Placeholder
                />
            );
        default:
            return (
                <HeadmasterHome 
                    dbStudents={data.dbStudents}
                    users={data.users}
                    dbStaff={data.dbStaff}
                    dbClasses={data.dbClasses}
                    announcements={data.announcements}
                    attendanceRate={data.attendanceRate || '...'}
                    systemLogs={data.systemLogs}
                    onPostNotice={() => actions.setShowAnnouncementModal(true)}
                    onShowHistory={() => onNavigate?.('notices')}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowNoticeDetail={actions.handleShowNoticeDetail}
                    currentSchool={currentSchool}
                    onNavigate={onNavigate}
                    currentUser={currentUser}
                    userName={currentUser?.name || ''}
                />
            );
    }
};
