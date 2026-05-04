import React from 'react';
import { UserRole } from '../../../../../types';


import { StudentHome } from '../../../student/screens/StudentHome';
import { StudentClasses } from '../../../student/screens/StudentClasses';
import { StudentVideos } from '../../../student/screens/StudentVideos';
import { StudentFees } from '../../../student/screens/StudentFees';
import { StudentProfile } from '../../../student/screens/StudentProfile';
import { StudentMessages } from '../../../student/screens/StudentMessages';

import { DashboardDomainBundles } from '../../types';
import { RestrictedAccessView } from '../../../../../components/RestrictedAccessView';

interface StudentRouterProps {
    bundle: DashboardDomainBundles['student'];
    common: DashboardDomainBundles['common'];
}

export const StudentRouter: React.FC<StudentRouterProps> = ({ bundle, common }) => {
    const { data, actions } = bundle;
    const { activeTab, currentUser, currentUserRole, currentSchool, onNavigate, onLogout, hasPermission } = common;

    switch (activeTab) {
        case 'home':
            return (
                <StudentHome 
                    currentUser={currentUser!}
                    currentSchool={currentSchool}
                    studentPrimaryClass={data.studentPrimaryClass}
                    allStudentClasses={data.allStudentClasses}
                    studentMaterials={data.studentMaterials}
                    studentAssignments={data.studentAssignments}
                    attendanceRate={data.studentAttendanceRate}
                    announcements={data.announcements}
                    onNavigate={onNavigate}
                    onShowHistory={() => actions.setShowAnnouncementHistoryModal(true)}
                />
            );
        case 'classes':
            if (hasPermission && !hasPermission('classes')) {
                return <RestrictedAccessView featureName="Classroom Access" role={currentUserRole} />;
            }
            return <StudentClasses studentPrimaryClass={data.studentPrimaryClass} allStudentClasses={data.allStudentClasses} />;
        case 'videos':
            if (hasPermission && !hasPermission('videos')) {
                return <RestrictedAccessView featureName="Resources Access" role={currentUserRole} />;
            }
            return (
                <StudentVideos 
                    studentMaterials={data.dbVideos} 
                    onVideoPress={(v: any) => { actions.setPlayingVideo(v); actions.setShowVideoPlayerModal(true); }}
                    isLiveStreamActive={false} // Placeholder
                    videoTab={data.studentVideoTab}
                    setVideoTab={actions.setStudentVideoTab}
                    videoSearch={data.studentVideoSearch}
                    setVideoSearch={actions.setManageSearch}
                    studentClasses={data.allStudentClasses}
                    currentUser={currentUser}
                    onNavigate={onNavigate}
                />
            );
        case 'fees': 
            if (hasPermission && !hasPermission('fees')) {
                return (
                    <RestrictedAccessView 
                        featureName="Fee Records" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <StudentFees 
                    fees={(data.dbFees || []).map((f: any) => ({

                        id: f.id,
                        title: f.title,
                        amount: f.amount,
                        status: f.status === 'PAID' ? 'Paid' : (f.status === 'OVERDUE' ? 'Overdue' : 'Pending'),
                        dueDate: f.due_date
                    }))}
                    studentName={currentUser?.name || 'Simulation Student'}
                    studentPaymentLink={data.studentPaymentLink}
                    isPaymentProcessing={false}
                    showPaymentSuccess={false}
                    handlePayNow={(id: string) => actions.initiateFeePayment(id, currentUser!.id, data.dbFees.find((f: any) => f.id === id)?.amount || 0, currentSchool?.id || '')}
                    handleLinkPress={(url: string) => {}}
                />
            );
        case 'messages':
            if (hasPermission && !hasPermission('messages')) {
                return (
                    <RestrictedAccessView 
                        featureName="Communications" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <StudentMessages 
                    currentUser={currentUser!}
                    displayContacts={common.getDisplayContacts()}
                    chatMessages={common.transformedChatMessages}
                    handleSendMessage={() => common.handleSendMessage(common.msgInput)}
                    selectedChat={common.selectedChat}
                    setSelectedChat={common.setSelectedChat}
                    msgInput={common.msgInput}
                    setMsgInput={common.setMsgInput}
                />
            );
        case 'profile':
            return (
                <StudentProfile 
                    currentUser={currentUser!} 
                    onLogout={onLogout || (() => {})}
                    onEditProfile={() => actions.setShowEditProfileModal(true)}
                />
            );
        default:
            return (
                <StudentHome 
                    currentUser={currentUser!} 
                    studentPrimaryClass={data.studentPrimaryClass} 
                    studentMaterials={data.studentMaterials} 
                    studentAssignments={data.studentAssignments}
                    attendanceRate={data.studentAttendanceRate || '...'}
                    announcements={data.announcements} 
                    onNavigate={(screen: any) => onNavigate(screen)}
                    currentSchool={currentSchool}
                />
            );
    }
};
