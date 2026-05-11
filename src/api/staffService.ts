import { supabase } from '@lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export const staffService = {
  /**
   * Fetch all staff members for an institute
   */
  async getStaff(instituteId: string): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('institute_id', instituteId)
      .order('profile(full_name)', { ascending: true });
    
    return { data, error };
  },

  /**
   * Update staff role or status
   */
  async updateStaffStatus(staffId: string, status: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from('staff')
      .update({ status })
      .eq('id', staffId);
    
    return { error };
  }
};

export const instituteService = {
  /**
   * Fetch institute settings and theme
   */
  async getInstituteSettings(instituteId: string): Promise<{ data: any | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from('institutes')
      .select('*')
      .eq('id', instituteId)
      .single();
    
    return { data, error };
  }
};
