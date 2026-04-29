import { supabase } from '../../../../lib/supabase';
import { useCallback } from 'react';
import { User, UserRole } from '../../../../types';

/**
 * Hook to manage institutional members (Staff, Students) and Classes.
 * Handles CRUD operations and roster assignments.
 */
export const useMemberManager = (
  mockAuthUser: any,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  fetchData: () => Promise<void>,
  logSystemActivity: any,
  setLoading: (loading: boolean) => void
) => {

  const handleSaveStaff = useCallback(async (userForm: any, staffModalType: string, editingStaffId: string | null) => {
    if (!mockAuthUser?.school_id) return;
    try {
      setLoading(true);
      const role_str = staffModalType === 'MENTOR' ? 'mentor' : 'teacher';
      
      if (editingStaffId) {
        const { error } = await supabase
          .from('users')
          .update({ name: userForm.name, email: userForm.email })
          .eq('id', editingStaffId);
        if (error) throw error;
        logSystemActivity(mockAuthUser.school_id, `Updated Faculty: ${userForm.name}`, 'Edit', '#f59e0b', mockAuthUser.id, 'INSTITUTION');
        showToast(`${userForm.name} updated successfully.`);
      } else {
        const { error } = await supabase
          .from('users')
          .insert({
            name: userForm.name,
            email: userForm.email,
            role: role_str,
            school_id: mockAuthUser.school_id,
            status: 'Active'
          });
        if (error) throw error;
        logSystemActivity(mockAuthUser.school_id, `Registered Faculty: ${userForm.name} (${role_str})`, 'UserCheck', '#ef4444', mockAuthUser.id, 'INSTITUTION');
        showToast(`${userForm.name} registered as ${staffModalType}.`);
      }
      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [mockAuthUser, fetchData, logSystemActivity, setLoading, showToast]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      if (mockAuthUser?.school_id) {
        logSystemActivity(mockAuthUser.school_id, `Deleted User Record`, 'Trash', '#ef4444', mockAuthUser.id, 'SECURITY');
      }
      showToast("User deleted successfully.");
      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [mockAuthUser, fetchData, logSystemActivity, setLoading, showToast]);

  const handleSaveClass = useCallback(async (className: string, sections: string, editingClassId: string | null) => {
    if (!className || !mockAuthUser?.school_id) return;
    try {
      setLoading(true);
      const sectionArray = sections.split(',').map(s => s.trim()).filter(s => s !== '');
      
      if (editingClassId) {
        const { error } = await supabase
          .from('classes')
          .update({ name: className, sections: sectionArray })
          .eq('id', editingClassId);
        if (error) throw error;
        logSystemActivity(mockAuthUser.school_id, `Updated Class: ${className}`, 'Edit', '#f59e0b', mockAuthUser.id, 'SYSTEM');
        showToast(`Class updated to ${className}.`);
      } else {
        const { error } = await supabase
          .from('classes')
          .insert({ name: className, sections: sectionArray, school_id: mockAuthUser.school_id });
        if (error) throw error;
        logSystemActivity(mockAuthUser.school_id, `Created New Class: ${className}`, 'BookOpen', '#4f46e5', mockAuthUser.id, 'SYSTEM');
        showToast(`${className} added.`);
      }
      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [mockAuthUser, fetchData, logSystemActivity, setLoading, showToast]);

  const handleDeleteClass = useCallback(async (classId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('classes').delete().eq('id', classId);
      if (error) throw error;
      if (mockAuthUser?.school_id) {
        logSystemActivity(mockAuthUser.school_id, `Deleted Class`, 'Trash', '#ef4444', mockAuthUser.id, 'SYSTEM');
      }
      showToast("Class deleted successfully.");
      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [mockAuthUser, fetchData, logSystemActivity, setLoading, showToast]);

  const handleAssignToRoster = useCallback(async (classId: string, section: string, user: User, subject?: string, rosterType?: string) => {
    if (!mockAuthUser?.school_id) return;
    try {
      const rawType = (rosterType || (user.role === UserRole.STUDENT ? 'student' : 'teacher')).toLowerCase();
      const roleInClass = rawType.includes('mentor') ? 'mentor' : (rawType.includes('student') ? 'student' : 'teacher');
      
      // Institutional Governance: Clean up redundant or conflicting role data
      // 1. Remove ANY existing record for this user in this specific class/section (prevents role collision)
      await supabase.from('class_roster').delete().eq('class_id', classId).eq('section', section).eq('user_id', user.id);

      // 2. If assigning a Mentor, remove the PREVIOUS mentor for this section (Single Supervisor Law)
      if (roleInClass === 'mentor') {
          await supabase.from('class_roster').delete().eq('class_id', classId).eq('section', section).eq('role_in_class', 'mentor');
      }

      // 3. Perform fresh assignment
      const { error } = await supabase.from('class_roster').insert({
          class_id: classId,
          user_id: user.id,
          role_in_class: roleInClass,
          section: section,
          subject: subject
      });
      if (error) throw error;
      
      logSystemActivity(mockAuthUser.school_id, `Assigned ${user.name} as ${roleInClass} to ${section}`, 'Link', '#4f46e5', mockAuthUser.id, 'INSTITUTION');
      showToast(`${user.name} assigned as ${roleInClass} successfully.`);

      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }, [mockAuthUser, fetchData, logSystemActivity, showToast]);

  const handleRemoveFromRoster = useCallback(async (rosterId: string) => {
    if (!mockAuthUser?.school_id) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('class_roster').delete().eq('id', rosterId);
      if (error) throw error;
      logSystemActivity(mockAuthUser.school_id, `Removed Member from Roster`, 'Link', '#ef4444', mockAuthUser.id, 'INSTITUTION');
      showToast("Member removed from class successfully.");
      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [mockAuthUser, fetchData, logSystemActivity, setLoading, showToast]);

  const handleSaveStudent = useCallback(async (studentForm: any, editingUserId: string | null) => {
    if (!mockAuthUser?.school_id) return;
    try {
      setLoading(true);
      if (editingUserId) {
        const { error } = await supabase
          .from('users')
          .update({ name: studentForm.name, email: studentForm.email || `${studentForm.name.toLowerCase().replace(/\s+/g, '.')}@student.com` })
          .eq('id', editingUserId);
        if (error) throw error;
        logSystemActivity(mockAuthUser.school_id, `Updated Student details: ${studentForm.name}`, 'Edit', '#f59e0b', mockAuthUser.id, 'INSTITUTION');
        showToast(`${studentForm.name} profile updated.`);
      } else {
        const { error } = await supabase
          .from('users')
          .insert({
            name: studentForm.name,
            email: studentForm.email || `${studentForm.name.toLowerCase().replace(/\s+/g, '.')}@student.com`,
            role: 'student',
            school_id: mockAuthUser.school_id,
            status: 'Active'
          });
        if (error) throw error;
        logSystemActivity(mockAuthUser.school_id, `Registered Student: ${studentForm.name}`, 'Plus', '#10b981', mockAuthUser.id, 'INSTITUTION');
        showToast(`${studentForm.name} registered successfully.`);
      }
      await fetchData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [mockAuthUser, fetchData, logSystemActivity, setLoading, showToast]);

  return {
    handleSaveStaff,
    handleSaveStudent,
    handleDeleteUser,
    handleSaveClass,
    handleDeleteClass,
    handleAssignToRoster,
    handleRemoveFromRoster
  };
};
