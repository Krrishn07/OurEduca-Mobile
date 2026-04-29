import React from 'react';
import { UserRole } from '../../../../../types';


import { PlatformHome } from '../../../platform/screens/PlatformHome';
import { PlatformRoles } from '../../../platform/screens/PlatformRoles';
import { AdminInstitutes } from '../../../admin/screens/AdminInstitutes';
import { AdminProfile } from '../../../admin/screens/AdminProfile';
import { PlatformAuditTrail } from '../../../platform/screens/PlatformAuditTrail';
import { InstituteDetails } from '../../../platform/screens/InstituteDetails';
import { PlatformSystem } from '../../../platform/screens/PlatformSystem';
import { PlatformBilling } from '../../../platform/screens/PlatformBilling';
import { PlatformProfile } from '../../../platform/screens/PlatformProfile';
import { InquiryManagement } from '../../../platform/screens/InquiryManagement';

import { DashboardDomainBundles } from '../../types';

interface PlatformRouterProps {
    bundle: DashboardDomainBundles['platform'];
    common: DashboardDomainBundles['common'];
}

export const PlatformRouter: React.FC<PlatformRouterProps> = ({ bundle, common }) => {
    const { data, actions } = bundle;
    const { activeTab, currentUser, onNavigate, onLogout, hasPermission, currentUserRole } = common;

    switch (activeTab) {
        case 'institutes':
            return (
                <AdminInstitutes 
                    institutes={data.institutes}
                    activeInstituteTab={data.activeInstituteTab}
                    setActiveInstituteTab={actions.setActiveInstituteTab}
                    instSearch={data.instSearch}
                    setInstSearch={actions.setInstSearch}
                    isLoadingInstitutes={data.isLoadingInstitutes}
                    onVerifyInstitute={actions.handleVerifyInstitute}
                    onManage={actions.handleManageInstitute}
                    onReview={actions.handleOpenReview}
                    onShowAddInstituteModal={actions.onShowAddInstituteModal}
                    hasPermission={hasPermission}
                    currentUserRole={currentUserRole}
                />
            );
        case 'leads':
            return (
                <InquiryManagement 
                    leads={data.registrationMessages}
                    isLoading={data.isLoadingInquiries}
                    onUpdateStatus={actions.onUpdateRegistrationStatus}
                    onDelete={actions.onDeleteRegistration}
                    onOnboard={(lead) => {
                        // Map Inquiry data to Onboarding Form and trigger the Review Modal
                        actions.handleOpenReview({
                            id: '', 
                            inquiryId: lead.id,
                            name: lead.institute_name,
                            hmName: lead.name,
                            hmEmail: lead.email,
                            hmPhone: lead.phone,
                            plan: 'Basic',
                            status: 'ACTIVE'
                        });
                    }}
                    showToast={common.showToast}
                />
            );
        case 'roles':
            return (
                <PlatformRoles 
                    users={data.users}
                    dbPermissions={common.rolePermissions}
                    onSavePermissions={actions.handleSavePermissions}
                />
            );
        case 'billing':
            return (
                <PlatformBilling 
                    institutes={data.institutes}
                    isLoading={data.isLoadingFees}
                    onUpdateStatus={actions.handleUpdateInstituteStatus}
                    hasPermission={hasPermission}
                    currentUserRole={currentUserRole}
                />
            );
        case 'settings':
        case 'system':
            return (
                <PlatformSystem 
                    settings={data.platformSettings}
                    onUpdateSettings={actions.handleUpdatePlatformSettings}
                    hasPermission={hasPermission}
                    currentUserRole={currentUserRole}
                />
            );
        case 'profile': 
            return (
                <PlatformProfile 
                    currentUser={currentUser}
                    onEditProfile={() => actions.setShowEditProfileModal(true)}
                    onAccountSecurity={() => actions.setShowSecurityModal(true)}
                    onLogout={onLogout || (() => {})}
                />
            );
        case 'AuditTrail':
            return (
                <PlatformAuditTrail 
                    systemLogs={data.systemLogs}
                    onRefresh={actions.handleRefreshAudit}
                />
            );
        default: 
            return (
                <PlatformHome 
                    institutes={data.institutes} 
                    registrationMessages={data.registrationMessages}
                    isLoadingInquiries={data.isLoadingInquiries}
                    users={data.users} 
                    currentUser={currentUser} 
                    onVerify={actions.handleVerifyInstitute}
                    onReview={actions.handleOpenReview}
                    onNavigate={(target) => {
                        if (target === 'institutes_pending') {
                            actions.setActiveInstituteTab('PENDING');
                            onNavigate('institutes');
                        } else {
                            onNavigate(target);
                        }
                    }}
                />
            );
    }
};
