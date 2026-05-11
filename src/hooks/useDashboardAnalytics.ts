import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';

export const useDashboardAnalytics = (schoolId: string | null) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [students, teachers, classes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
          supabase.from('users').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher'),
          supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', schoolId)
        ]);

        setStats({
          totalStudents: students.count || 0,
          totalTeachers: teachers.count || 0,
          activeClasses: classes.count || 0,
          pendingApprovals: 0 // Will implement later
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [schoolId]);

  return { stats, isLoading };
};
