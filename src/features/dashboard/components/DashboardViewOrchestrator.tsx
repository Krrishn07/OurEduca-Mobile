import React from 'react';
import { UserRole } from '../../../../types';


import { MentorRouter } from './routers/MentorRouter';
import { PlatformRouter } from './routers/PlatformRouter';
import { TeacherRouter } from './routers/TeacherRouter';
import { StudentRouter } from './routers/StudentRouter';
import { HeadmasterRouter } from './routers/HeadmasterRouter';
import { DashboardDomainBundles } from '../types';

interface DashboardViewOrchestratorProps {
    role: UserRole;
    bundles: DashboardDomainBundles;
}

export const DashboardViewOrchestrator: React.FC<DashboardViewOrchestratorProps> = ({ role, bundles }) => {
    switch (role) {
        case UserRole.PLATFORM_ADMIN:
            return <PlatformRouter bundle={bundles.platform} common={bundles.common} />;
        
        case UserRole.SUPER_ADMIN:
            return <HeadmasterRouter bundle={bundles.headmaster} common={bundles.common} />;
        
        case UserRole.ADMIN_TEACHER:
            // Intelligence: If mentor has no assigned class, fallback ONLY if they have teacher roles
            if (!bundles.mentor.data.assignedClassId && (bundles.teacher.data.teacherAssignedSections?.length || 0) > 0) {
                return <TeacherRouter bundle={bundles.teacher} common={bundles.common} />;
            }
            return <MentorRouter bundle={bundles.mentor} common={bundles.common} />;
        
        case UserRole.TEACHER:
            return <TeacherRouter bundle={bundles.teacher} common={bundles.common} />;
        
        case UserRole.STUDENT:
        case UserRole.PARENT:
            return <StudentRouter bundle={bundles.student} common={bundles.common} />;
        
        default:
            return <HeadmasterRouter bundle={bundles.headmaster} common={bundles.common} />;
    }
};
