import React from 'react';
import { UserRole } from '@/types';
import { RestrictedAccessView } from '@components/common/RestrictedAccessView';

import { TeacherHome } from '@screens/teacher/TeacherHome';
import { TeacherClasses } from '@screens/teacher/TeacherClasses';
import { TeacherVideos } from '@screens/teacher/TeacherVideos';
import { TeacherMessages } from '@screens/teacher/TeacherMessages';
import { TeacherProfile } from '@screens/teacher/TeacherProfile';

import { TeacherGrading } from '@screens/teacher/TeacherGrading';
import { TeacherReports } from '@screens/teacher/TeacherReports';
import { TeacherClassDetail } from '@screens/teacher/TeacherClassDetail';

import { DashboardDomainBundles } from '@/types/dashboard';
import { TeacherApprovals } from '@screens/teacher/TeacherApprovals';

interface TeacherRouterProps {
    bundle: DashboardDomainBundles['teacher'];
    common: DashboardDomainBundles['common'];
}

export const TeacherRouter: React.FC<TeacherRouterProps> = ({ bundle, common }) => {
    const { data, actions } = bundle;
    const { activeTab, currentUser, currentUserRole, currentSchool, onNavigate, hasPermission, onLogout, showToast } = common;

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'Upload Material':
                actions.setShowUploadModal(true);
                return;
            case 'Post Announcement':
                actions.setShowAnnouncementModal(true);
                return;
            case 'Verification Hub':
                actions.setShowApprovals?.(true);
                return;
            default:
                showToast(`Action: ${action}`);
        }
    };

    if (data.showGrading) {
        return (
            <TeacherGrading 
                onBack={() => { 
                    actions.setShowGrading?.(false); 
                    actions.setGradingInitialClass?.(null); 
                    actions.setSelectedAssignmentForGrading?.(null);
                }}
                initialClass={data.gradingInitialClass}
                initialAssignment={data.selectedAssignmentForGrading}
                onAddAssignment={(cid) => {
                    actions.setModalInitialClassId?.(cid || null);
                    actions.setShowAssignmentModal?.(true);
                }}
            />
        );
    }

    if (data.showReports) {
        return (
            <TeacherReports 
                assignedSections={data.teacherAssignedSections || []}
                onBack={() => actions.setShowReports?.(false)}
                onShowToast={showToast}
                initialClassId={data.gradingInitialClass?.class_id || data.gradingInitialClass?.id}
            />
        );
    }

    if (data.showApprovals) {
        return <TeacherApprovals onBack={() => actions.setShowApprovals?.(false)} />;
    }

    switch (activeTab) {
        case 'home':
            return (
                <TeacherHome 
                    currentUser={currentUser!}
                    assignedSections={data.teacherAssignedSections}
                    teacherMaterials={data.teacherMaterials}
                    onDeleteMaterial={actions.handleDeleteMaterial}

                    totalStudents={data.teacherTotalStudents}
                    announcements={data.announcements} 
                    meetings={data.meetings}      
                    onQuickAction={handleQuickAction}
                    onStatPress={(target) => onNavigate(target)}
                    onNavigateToClass={(cls) => onNavigate('classes')}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    currentSchool={currentSchool}
                />
            );
        case 'classes':
            if (hasPermission && !hasPermission('classes')) {
                return (
                    <RestrictedAccessView 
                        featureName="Classroom Management" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <TeacherClasses 
                    assignedSections={data.teacherAssignedSections}
                    dbRoster={data.dbRoster}
                    onNavigateToClass={(cls) => onNavigate('home')}
                    onShowUploadModal={() => actions.setShowUploadModal(true)}
                />
            );
        case 'videos':
            if (hasPermission && !hasPermission('videos')) {
                return (
                    <RestrictedAccessView 
                        featureName="Resource Management" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <TeacherVideos 
                    videoList={data.dbVideos}
                    videoTab={data.teacherVideoTab}
                    setVideoTab={actions.setTeacherVideoTab}
                    videoSearch={data.teacherVideoSearch}
                    setVideoSearch={actions.setTeacherVideoSearch}
                    onShowVideoUploadModal={() => actions.setShowUploadVideoModal(true)}
                    onVideoPress={(v: any) => { actions.setPlayingVideo(v); actions.setShowVideoPlayerModal(true); }}
                    isLiveStreamActive={data.isTeacherLiveStreamActive}
                    onDeleteVideo={async (id) => { await actions.deleteVideo(id, currentSchool?.id || ''); }}

                    currentUser={currentUser}
                    teacherAssignedSections={data.teacherAssignedSections}
                />
            );
        case 'messages':
            if (hasPermission && !hasPermission('messages')) {
                return (
                    <RestrictedAccessView 
                        featureName="Messaging" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <TeacherMessages 
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
                <TeacherProfile 
                    currentUser={currentUser!}
                    onEdit={() => {}} // Placeholder
                    onLogout={onLogout || (() => {})}
                    recentActivity={data.systemLogs}
                />
            );
        default:
            return (
                <TeacherHome 
                    currentUser={currentUser!} 
                    assignedSections={data.teacherAssignedSections} 
                    teacherMaterials={data.teacherMaterials} 
                    totalStudents={data.teacherTotalStudents}
                    announcements={data.announcements} 
                    meetings={data.meetings} 
                    onQuickAction={handleQuickAction}
                    onStatPress={(target) => onNavigate(target)}
                    onNavigateToClass={(cls) => onNavigate('classes')}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    currentSchool={currentSchool}
                />
            );
    }
};
