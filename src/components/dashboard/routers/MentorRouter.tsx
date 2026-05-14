import React from 'react';
import { UserRole, Video as VideoType } from '@/types';
import { RestrictedAccessView } from '@components/common/RestrictedAccessView';

import { MentorHome } from '@screens/mentor/MentorHome';
import { MentorClasses } from '@screens/mentor/MentorClasses';
import { MentorMessages } from '@screens/mentor/MentorMessages';
import { MentorVideos } from '@screens/mentor/MentorVideos';
import { MentorMonitor } from '@screens/mentor/MentorMonitor';
import { MentorProfile } from '@screens/mentor/MentorProfile';
import { MentorMaterials } from '@screens/mentor/MentorMaterials';

import { DashboardDomainBundles } from '@/types/dashboard';
import { AnnouncementsScreen } from '@components/common';
import { TeacherGrading } from '@screens/teacher/TeacherGrading';
import { TeacherReports } from '@screens/teacher/TeacherReports';
import { TeacherClassDetail } from '@screens/teacher/TeacherClassDetail';
import { TeacherApprovals } from '@screens/teacher/TeacherApprovals';

interface MentorRouterProps {
    bundle: DashboardDomainBundles['mentor'];
    common: DashboardDomainBundles['common'];
}

export const MentorRouter: React.FC<MentorRouterProps> = ({ bundle, common }) => {
    const { data, actions } = bundle;
    const { activeTab, currentUser, currentUserRole, currentSchool, onNavigate, hasPermission, onLogout, showToast } = common;

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
                <MentorHome 
                    currentUser={currentUser}
                    assignedClassName={data.assignedClassName}
                    mentorRoster={data.mentorRoster}
                    mentorStudents={data.mentorRoster}
                    dbStudents={data.dbStudents}
                    users={(data.dbStaff || []).concat(data.dbStudents || [])} // Simplified if users isn't passed separately

                    dbStaff={data.dbStaff}
                    dbClasses={data.dbClasses}
                    announcements={data.announcements}
                    onNavigate={onNavigate}
                    onPostNotice={() => actions.setShowAnnouncementModal(true)}
                    onShowHistory={() => onNavigate?.('notices')}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowAddStudentModal={() => actions.setShowAddStudentModal(true)}
                    onQuickAction={actions.handleQuickAction}
                    currentSchool={currentSchool}
                    attendanceRate={data.classAttendanceRate || '...'}
                    subjectCount={data.actualSubjectCount}
                    parentCount={data.actualParentCount}
                    teacherAssignedSections={data.teacherAssignedSections}
                    pendingGradesCount={data.pendingGradesCount}
                />
            );
        case 'classes':
            if (hasPermission && !hasPermission('classes')) {
                return (
                    <RestrictedAccessView 
                        featureName="Classroom Management" 
                        onContactAdmin={() => onNavigate('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <MentorClasses 
                    assignedClassName={data.assignedClassName}
                    mentorRoster={data.mentorRoster}
                    dbRoster={data.dbRoster}
                    dbClasses={data.dbClasses}
                    teacherAssignedSections={data.teacherAssignedSections}
                    dbMaterials={data.dbMaterials}
                    assignments={data.assignments}
                    sectionFaculty={data.dbSectionFaculty}
                    attendanceMap={data.attendanceMap}
                    isSavingAttendance={data.isSavingAttendance}
                    onSaveAttendance={actions.handleSaveAttendance}
                    onSyncToggle={actions.setAttendanceMap}
                    onShowAddStudentModal={() => {
                        actions.setEditingUserId(null); actions.setShowAddStudentModal(true)}}
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
                <MentorMessages 
                    selectedChat={common.selectedChat}
                    setSelectedChat={common.setSelectedChat}
                    msgInput={common.msgInput}
                    setMsgInput={common.setMsgInput}
                    displayContacts={common.getDisplayContacts()}
                    chatMessages={common.transformedChatMessages}
                    currentUser={currentUser}
                    handleSendMessage={common.handleSendMessage}
                    markMessagesAsRead={common.markMessagesAsRead}
                    uploadMessageFile={common.uploadMessageFile}
                    fetchMoreMessages={common.fetchMoreMessages}
                    currentSchoolId={currentSchool?.id}
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
                <MentorVideos 
                    videoList={data.dbVideos}
                    videoTab={data.mentorVideoTab}
                    setVideoTab={actions.setMentorVideoTab}
                    videoSearch={data.mentorVideoSearch}
                    setVideoSearch={actions.setMentorVideoSearch}
                    isLiveStreamActive={data.isMentorLiveStreamActive}
                    onShowVideoUploadModal={() => actions.setShowUploadVideoModal(true)}
                    onVideoPress={(v: any) => { actions.setPlayingVideo(v); actions.setShowVideoPlayerModal(true); }}
                    onDeleteVideo={(vId: string) => { actions.onDeleteVideo?.(vId); }} 

                    currentUser={currentUser}
                    onNavigate={onNavigate}
                    teacherAssignedSections={data.teacherAssignedSections}
                />
            );
        case 'profile':
            return (
                <MentorProfile 
                    currentUser={currentUser!}
                    onShowEditProfileModal={() => actions.setShowEditProfileModal(true)}
                    onLogout={onLogout || (() => {})}
                    recentActivity={data.systemLogs || []}
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
        case 'materials':
            return (
                <MentorMaterials 
                    materials={data.dbMaterials || []}
                    onUpload={() => actions.handleQuickAction?.('Upload Material')}
                    onDelete={actions.handleDeleteMaterial}
                    onBack={() => onNavigate?.('home')}
                />
            );
        default:
            return (
                <MentorHome 
                    currentUser={currentUser}
                    assignedClassName={data.assignedClassName}
                    mentorRoster={data.mentorRoster}
                    mentorStudents={data.mentorRoster}
                    dbStudents={data.dbStudents}
                    users={data.dbStaff.concat(data.dbStudents)}
                    dbStaff={data.dbStaff}
                    dbClasses={data.dbClasses}
                    announcements={data.announcements}
                    onNavigate={onNavigate}
                    onPostNotice={() => actions.setShowAnnouncementModal(true)}
                    onShowHistory={() => onNavigate?.('notices')}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowAddStudentModal={() => actions.setShowAddStudentModal(true)}
                    onQuickAction={actions.handleQuickAction}
                    currentSchool={currentSchool}
                    attendanceRate={data.classAttendanceRate}
                    subjectCount={data.actualSubjectCount}
                    parentCount={data.actualParentCount}
                    teacherAssignedSections={data.teacherAssignedSections}
                    pendingGradesCount={data.pendingGradesCount}
                    mentorMaterials={data.dbMaterials}
                    onDeleteMaterial={actions.handleDeleteMaterial}
                />
            );
    }
};
