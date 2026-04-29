import React from 'react';
import { UserRole } from '../../../../types';



// Modals
import { AddInstituteModal } from '../../admin/modals/AddInstituteModal';
import { EditProfileModal } from '../../headmaster/modals/EditProfileModal';
import { SecurityPortalModal } from '../../platform/modals/SecurityPortalModal';
import { ManageInstituteModal } from '../../platform/modals/ManageInstituteModal';
import { AddStudentModal as AddStudentModalMentor } from '../../mentor/modals/AddStudentModal';
// GoLiveModal removed - implementation consolidated in Video Screens
import { UploadMaterialModal } from '../../teacher/modals/UploadMaterialModal';
import { AnnouncementModal } from '../../teacher/modals/AnnouncementModal';
import { AnnouncementHistoryModal } from '../../teacher/modals/AnnouncementHistoryModal';
import { NoticeDetailModal } from '../../headmaster/modals/NoticeDetailModal';
import { AddClassModal } from '../../headmaster/modals/AddClassModal';
import { AddStaffModal } from '../../headmaster/modals/AddStaffModal';
import { IssueFeeModal } from '../../headmaster/modals/IssueFeeModal';
import { FeeLedgerModal } from '../../headmaster/modals/FeeLedgerModal';
import { FeesReportModal } from '../../headmaster/modals/FeesReportModal';
import { UploadVideoModal } from '../../headmaster/modals/UploadVideoModal';
import { VideoPlayerModal } from '../../headmaster/modals/VideoPlayerModal';

interface DashboardModalManagerProps {
    role: UserRole;
    state: {
        showAddInstituteModal: boolean;
        showEditProfileModal: boolean;
        showSecurityModal: boolean;
        showAddStudentModal: boolean;
        // showMentorGoLiveModal removed
        // showTeacherGoLiveModal removed
        showUploadModal: boolean;
        showAnnouncementModal: boolean;
        showAnnouncementHistoryModal: boolean;
        showNoticeDetailModal: boolean;
        showAddClassModal: boolean;
        showAddTeacherModal: boolean;
        showIssueFeeModal: boolean;
        showFeeLedgerModal: boolean;
        showFeesReportModal: boolean;
        showUploadVideoModal: boolean;
        showVideoPlayerModal: boolean;
        showManageInstModal: boolean;
        selectedInst: any;
        
        // Data for modals
        instForm: any;
        instModalStep: number;
        profileForm: any;
        studentForm: any;
        editingUserId: string | null;
        assignedClassId: string;
        assignedSection: string;
        assignedClassName: string;
        isMentorLiveStreamActive: boolean;
        isTeacherLiveStreamActive: boolean;
        dbCameraNodes: any[];
        uploadTitle: string;
        uploadClassId: string;
        uploadType: 'PDF' | 'LINK';
        uploadUrl: string;
        selectedFile: any;
        isUploadingMaterial: boolean;
        isUploadingVideo: boolean;
        teacherAssignedSections: any[];
        rolePermissions: any;
        selectedNotice: any;
        newClassName: string;
        classSections: string;
        editingClassId: string | null;
        userForm: any;
        userModalType: any;
        userModalMode: any;
        playingVideo: any;
        dbStudents?: any[];
        dbFees?: any[];
    };
    actions: {
        setShowAddInstituteModal: (show: boolean) => void;
        setInstForm: (form: any) => void;
        setInstModalStep: (step: number) => void;
        handleAddInstitute: () => Promise<void>;
        setShowEditProfileModal: (show: boolean) => void;
        setProfileForm: (form: any) => void;
        handleUpdateProfile: () => Promise<void>;
        setShowSecurityModal: (show: boolean) => void;
        handleUpdatePassword: (pass: string) => Promise<void>;
        handleLogoutAllDevices: () => Promise<void>;
        setShowAddStudentModal: (show: boolean) => void;
        setEditingUserId: (id: string | null) => void;
        setStudentForm: (form: any) => void;
        handleSaveStudent: () => Promise<void>;
        // setShowMentorGoLiveModal removed
        // handleToggleMentorLiveStream removed
        // setShowTeacherGoLiveModal removed
        // handleToggleTeacherLiveStream removed
        setShowUploadModal: (show: boolean) => void;
        setUploadTitle: (title: string) => void;
        setUploadClassId: (id: string) => void;
        setUploadType: (type: any) => void;
        setUploadUrl: (url: string) => void;
        setSelectedFile: (file: any) => void;
        handleUploadMaterialSubmit: () => Promise<void>;
        setShowAnnouncementModal: (show: boolean) => void;
        handlePostAnnouncement: (data: any) => Promise<void>;
        setShowAnnouncementHistoryModal: (show: boolean) => void;
        announcements: any[];
        handleDeleteAnnouncement: (id: string) => Promise<void>;
        setShowNoticeDetailModal: (show: boolean) => void;
        setShowAddClassModal: (show: boolean) => void;
        setNewClassName: (name: string) => void;
        setClassSections: (sections: string) => void;
        handleSaveClass: () => Promise<void>;
        setShowAddTeacherModal: (show: boolean) => void;
        setUserForm: (form: any) => void;
        setStaffModalType: (type: any) => void;
        handleSaveStaff: () => Promise<void>;
        setShowIssueFeeModal: (show: boolean) => void;
        setShowFeeLedgerModal: (show: boolean) => void;
        setShowFeesReportModal: (show: boolean) => void;
        setShowUploadVideoModal: (show: boolean) => void;
        handleMentorVideoUpload: (video: any) => Promise<void>;
        setShowVideoPlayerModal: (show: boolean) => void;
        setShowManageInstModal: (show: boolean) => void;
        handleInstituteAction: (type: string, inst: any) => void;
        handleUpdateInstituteLogo: (instId: string) => void;
        showToast: (msg: string, type?: any) => void;
    };
}

export const DashboardModalManager: React.FC<DashboardModalManagerProps> = ({ role, state, actions }) => {
    // Platform Admin Modals
    const renderPlatformModals = () => (
        <>
            <AddInstituteModal 
                visible={state.showAddInstituteModal}
                onClose={() => { actions.setShowAddInstituteModal(false); actions.setInstModalStep(1); }}
                instForm={state.instForm}
                setInstForm={actions.setInstForm}
                instModalStep={state.instModalStep}
                setInstModalStep={actions.setInstModalStep}
                onAdd={actions.handleAddInstitute}
                showToast={actions.showToast}
            />
            <EditProfileModal 
                visible={state.showEditProfileModal}
                onClose={() => actions.setShowEditProfileModal(false)}
                profileForm={state.profileForm}
                setProfileForm={actions.setProfileForm}
                onSave={actions.handleUpdateProfile}
            />
            <ManageInstituteModal 
                visible={state.showManageInstModal}
                onClose={() => actions.setShowManageInstModal(false)}
                institute={state.selectedInst}
                onAction={actions.handleInstituteAction}
                onUpdateLogo={actions.handleUpdateInstituteLogo}
                showToast={actions.showToast}
            />
            <SecurityPortalModal
                visible={state.showSecurityModal}
                onClose={() => actions.setShowSecurityModal(false)}
                onUpdatePassword={actions.handleUpdatePassword}
                onLogoutAllDevices={actions.handleLogoutAllDevices}
            />
        </>
    );

    // Mentor Modals
    const renderMentorModals = () => (
        <>
            <AddStudentModalMentor 
                visible={state.showAddStudentModal}
                onClose={() => { actions.setShowAddStudentModal(false); actions.setEditingUserId(null); }}
                studentForm={state.studentForm}
                setStudentForm={actions.setStudentForm}
                onAdd={actions.handleSaveStudent}
                isEditing={!!state.editingUserId}
            />
            <EditProfileModal 
                visible={state.showEditProfileModal}
                onClose={() => actions.setShowEditProfileModal(false)}
                profileForm={state.profileForm}
                setProfileForm={actions.setProfileForm}
                onSave={actions.handleUpdateProfile}
            />
            {/* GoLiveModal removed */}
            <UploadMaterialModal 
                visible={state.showUploadModal}
                onClose={() => actions.setShowUploadModal(false)}
                uploadTitle={state.uploadTitle}
                setUploadTitle={actions.setUploadTitle}
                uploadClassId={state.uploadClassId}
                setUploadClassId={actions.setUploadClassId}
                assignedSections={[{ id: state.assignedClassId, class_id: state.assignedClassId, name: state.assignedClassName }]}
                isUploading={state.isUploadingMaterial}
                onUpload={actions.handleUploadMaterialSubmit}
                uploadType={state.uploadType}
                setUploadType={actions.setUploadType}
                uploadUrl={state.uploadUrl}
                setUploadUrl={actions.setUploadUrl}
                selectedFile={state.selectedFile}
                setSelectedFile={actions.setSelectedFile}
            />
        </>
    );

    // General School Modals (Headmaster, Teacher)
    const renderSchoolModals = () => (
        <>
            <AnnouncementModal 
                visible={state.showAnnouncementModal}
                onClose={() => actions.setShowAnnouncementModal(false)}
                onSave={actions.handlePostAnnouncement}
                userRole={role}
            />
            <AnnouncementHistoryModal 
                visible={state.showAnnouncementHistoryModal}
                onClose={() => actions.setShowAnnouncementHistoryModal(false)}
                announcements={actions.announcements}
                onDelete={actions.handleDeleteAnnouncement}
                role={role}
            />
            <NoticeDetailModal 
                visible={state.showNoticeDetailModal}
                onClose={() => actions.setShowNoticeDetailModal(false)}
                notice={state.selectedNotice}
            />
            <EditProfileModal 
                visible={state.showEditProfileModal}
                onClose={() => actions.setShowEditProfileModal(false)}
                profileForm={state.profileForm}
                setProfileForm={actions.setProfileForm}
                onSave={actions.handleUpdateProfile}
            />
            
            {role === UserRole.TEACHER && (
                <>
                    {/* GoLiveModal removed */}
                    <UploadMaterialModal 
                        visible={state.showUploadModal}
                        onClose={() => actions.setShowUploadModal(false)}
                        uploadTitle={state.uploadTitle}
                        setUploadTitle={actions.setUploadTitle}
                        uploadClassId={state.uploadClassId}
                        setUploadClassId={actions.setUploadClassId}
                        assignedSections={state.teacherAssignedSections}
                        isUploading={state.isUploadingMaterial}
                        onUpload={actions.handleUploadMaterialSubmit}
                        uploadType={state.uploadType}
                        setUploadType={actions.setUploadType}
                        uploadUrl={state.uploadUrl}
                        setUploadUrl={actions.setUploadUrl}
                        selectedFile={state.selectedFile}
                        setSelectedFile={actions.setSelectedFile}
                    />
                </>
            )}

            {(role === UserRole.SUPER_ADMIN || role === UserRole.PLATFORM_ADMIN || (role as any) === 'headmaster') && (
                <>
                    <AddClassModal 
                        visible={state.showAddClassModal}
                        onClose={() => actions.setShowAddClassModal(false)}
                        newClassName={state.newClassName}
                        setNewClassName={actions.setNewClassName}
                        classSections={state.classSections}
                        setClassSections={actions.setClassSections}
                        onSave={actions.handleSaveClass}
                        isEditing={!!state.editingClassId}
                    />
                    <AddStaffModal 
                        visible={state.showAddTeacherModal}
                        onClose={() => actions.setShowAddTeacherModal(false)}
                        userForm={state.userForm}
                        setUserForm={actions.setUserForm}
                        userModalType={state.userModalType as any}
                        setUserModalType={actions.setStaffModalType as any}
                        onSave={actions.handleSaveStaff}
                        isEditing={!!state.editingStaffId} 
                    />
                    <AddStudentModalMentor 
                        visible={state.showAddStudentModal}
                        onClose={() => { actions.setShowAddStudentModal(false); actions.setEditingUserId(null); }}
                        studentForm={state.studentForm}
                        setStudentForm={actions.setStudentForm}
                        onAdd={actions.handleSaveStudent}
                        isEditing={!!state.editingUserId}
                    />
                    <IssueFeeModal 
                        visible={state.showIssueFeeModal}
                        onClose={() => actions.setShowIssueFeeModal(false)}
                        onIssue={() => {}} // Placeholder
                    />
                    <FeeLedgerModal 
                        visible={state.showFeeLedgerModal}
                        onClose={() => actions.setShowFeeLedgerModal(false)}
                        students={state.dbStudents || []}
                        fees={state.dbFees || []}
                    />
                    <FeesReportModal 
                        visible={state.showFeesReportModal}
                        onClose={() => actions.setShowFeesReportModal(false)}
                    />
                </>
            )}
        </>
    );

    const getRoleModals = () => {
        if (role === UserRole.PLATFORM_ADMIN) return renderPlatformModals();
        if (role === UserRole.ADMIN_TEACHER) return renderMentorModals();
        return renderSchoolModals();
    };

    return (
        <>
            {getRoleModals()}
            
            <UploadVideoModal 
                visible={state.showUploadVideoModal}
                onClose={() => actions.setShowUploadVideoModal(false)}
                onUpload={actions.handleMentorVideoUpload}
                assignedSections={state.teacherAssignedSections}
                isUploading={state.isUploadingVideo}
            />
            <VideoPlayerModal 
                visible={state.showVideoPlayerModal}
                onClose={() => actions.setShowVideoPlayerModal(false)}
                video={state.playingVideo}
            />
        </>
    );
};
