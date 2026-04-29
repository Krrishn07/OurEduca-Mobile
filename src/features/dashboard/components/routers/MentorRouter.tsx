import React from 'react';
import { UserRole, Video as VideoType } from '../../../../../types';
import { RestrictedAccessView } from '../../../../../components/RestrictedAccessView';


import { MentorHome } from '../../../mentor/screens/MentorHome';
import { MentorClasses } from '../../../mentor/screens/MentorClasses';
import { MentorMessages } from '../../../mentor/screens/MentorMessages';
import { MentorVideos } from '../../../mentor/screens/MentorVideos';
import { MentorMonitor } from '../../../mentor/screens/MentorMonitor';
import { MentorProfile } from '../../../mentor/screens/MentorProfile';
import { MentorMaterials } from '../../../mentor/screens/MentorMaterials';

import { DashboardDomainBundles } from '../../types';

interface MentorRouterProps {
    bundle: DashboardDomainBundles['mentor'];
    common: DashboardDomainBundles['common'];
}

export const MentorRouter: React.FC<MentorRouterProps> = ({ bundle, common }) => {
    const { data, actions } = bundle;
    const { activeTab, currentUser, currentUserRole, currentSchool, onNavigate, hasPermission, onLogout } = common;

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
                    onShowHistory={() => actions.setShowAnnouncementHistoryModal(true)}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowAddStudentModal={() => actions.setShowAddStudentModal(true)}
                    currentSchool={currentSchool}
                    attendanceRate={data.classAttendanceRate || '...'}
                    subjectCount={data.actualSubjectCount}
                    parentCount={data.actualParentCount}
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
                />
            );
        case 'monitor':
            if (hasPermission && !hasPermission('monitor')) {
                return (
                    <RestrictedAccessView 
                        featureName="Security Monitor" 
                        onContactAdmin={() => onNavigate?.('messages')}
                        role={currentUserRole}
                    />
                );
            }
            return (
                <MentorMonitor 
                    assignedClassId={data.assignedClassId}
                    assignedSection={data.assignedSection}
                    assignedClassName={data.assignedClassName}
                />
            );
        case 'profile':
            return (
                <MentorProfile 
                    currentUser={currentUser!}
                    onShowEditProfileModal={() => actions.setShowEditProfileModal(true)}
                    onLogout={onLogout || (() => {})}
                />
            );
        case 'materials':
            return (
                <MentorMaterials 
                    materials={data.dbMaterials || []}
                    onUpload={() => actions.setShowUploadMaterialModal?.(true) || actions.setShowUploadModal?.(true)}
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
                    onShowHistory={() => actions.setShowAnnouncementHistoryModal(true)}
                    onDeleteNotice={actions.handleDeleteAnnouncement}
                    onShowAddStudentModal={() => actions.setShowAddStudentModal(true)}
                    currentSchool={currentSchool}
                />
            );
    }
};
