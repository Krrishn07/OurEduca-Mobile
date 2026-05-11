import { supabase } from '@lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface StudentProfile {
  id: string;
  user_id: string;
  admission_number: string;
  roll_number?: string;
  class_id: string;
  parent_id?: string;
  date_of_birth?: string;
  blood_group?: string;
  address?: string;
  joined_date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const studentService = {
  /**
   * Fetch all students in a specific class
   */
  async getStudentsByClass(classId: string): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('class_id', classId)
      .order('roll_number', { ascending: true });
    
    return { data, error };
  },

  /**
   * Fetch a single student's full profile
   */
  async getStudentDetail(studentId: string): Promise<{ data: any | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles(*),
        class:classes(*),
        parent:parents(profile:profiles(*))
      `)
      .eq('id', studentId)
      .single();
    
    return { data, error };
  },

  /**
   * Search students by name or admission number
   */
  async searchStudents(instituteId: string, query: string): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        admission_number,
        profile:profiles!inner(full_name)
      `)
      .eq('institute_id', instituteId)
      .or(`admission_number.ilike.%${query}%,full_name.ilike.%${query}%`, { foreignTable: 'profiles' })
      .limit(20);
    
    return { data, error };
  }
};
