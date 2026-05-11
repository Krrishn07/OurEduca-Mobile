import { supabase } from '@lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface AcademicClass {
  id: string;
  name: string;
  section: string;
  grade_level: string;
  stream?: string;
  room_number?: string;
  teacher_id?: string;
  institute_id: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credit_hours?: number;
  institute_id: string;
}

export const academicService = {
  /**
   * Fetch all classes for a specific institute
   */
  async getClasses(instituteId: string): Promise<{ data: AcademicClass[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('institute_id', instituteId)
      .order('grade_level', { ascending: true });
    
    return { data, error };
  },

  /**
   * Fetch a single class by ID
   */
  async getClassById(classId: string): Promise<{ data: AcademicClass | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();
    
    return { data, error };
  },

  /**
   * Fetch all subjects for an institute
   */
  async getSubjects(instituteId: string): Promise<{ data: Subject[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('institute_id', instituteId)
      .order('name', { ascending: true });
    
    return { data, error };
  },

  /**
   * Fetch subjects assigned to a specific teacher
   */
  async getTeacherSubjects(teacherId: string): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('subject_teachers')
      .select(`
        id,
        subject:subjects(*),
        class:classes(*)
      `)
      .eq('teacher_id', teacherId);
    
    return { data, error };
  }
};
