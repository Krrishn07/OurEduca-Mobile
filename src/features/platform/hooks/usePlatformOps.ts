import { supabase } from '../../../../lib/supabase';
import { useCallback } from 'react';

/**
 * Hook to manage platform-level administrative operations.
 * Handles institute verification, logo uploads, and billing status updates.
 */
export const usePlatformOps = (
  mockAuthUser: any,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  fetchInstitutes: () => Promise<void>,
  logSystemActivity: any,
  setIsLoadingInstitutes: (loading: boolean) => void,
  setSelectedInst: (inst: any) => void,
  updateRegistrationStatus?: (id: string, status: 'NEW' | 'REVIEWED' | 'CONTACTED' | 'ONBOARDED') => Promise<void>
) => {

  const handleVerifyInstitute = useCallback(async (id: string) => {
    if (id === 'refresh') {
      await fetchInstitutes();
      showToast("Global Registry Synchronized");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('schools')
        .update({ status: 'ACTIVE' })
        .eq('id', id);
      
      if (error) throw error;
      showToast('Institute verified successfully');
      fetchInstitutes();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }, [fetchInstitutes, showToast]);

  const handleUpdateInstituteLogo = useCallback(async (instId: string, file: any) => {
    try {
      setIsLoadingInstitutes(true);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${instId}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: fileName,
        type: file.type || 'image/jpeg'
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(filePath, formData, {
          contentType: file.type || 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('schools')
        .update({ logo_url: publicUrl })
        .eq('id', instId);

      if (updateError) throw updateError;

      showToast("Logo updated successfully!");
      
      const { data: updatedInst } = await supabase
        .from('schools')
        .select('*')
        .eq('id', instId)
        .single();
      
      if (updatedInst) setSelectedInst(updatedInst);
      fetchInstitutes();
    } catch (err: any) {
      console.error('handleUpdateInstituteLogo error:', err);
      showToast(`Upload Failed: ${err.message || 'Check storage permissions'}`, 'error');
    } finally {
      setIsLoadingInstitutes(false);
    }
  }, [setIsLoadingInstitutes, setSelectedInst, fetchInstitutes, showToast]);

  const handleInstituteAction = useCallback(async (type: string, inst: any) => {
    try {
      let newStatus: string | null = null;
      let message = "";

      switch (type) {
        case 'SUSPEND':
          newStatus = 'SUSPENDED';
          message = `Organization "${inst.name}" has been suspended.`;
          break;
        case 'VERIFY':
          onOpenReview(inst);
          return;
        case 'REACTIVATE':
          newStatus = 'PENDING';
          message = `Organization "${inst.name}" has been queued for re-verification.`;
          break;
        case 'RESET_PASSWORD':
          showToast(`Auth reset instructions sent to ${inst.email}.`);
          return;
        default:
          return;
      }

      if (newStatus) {
        const { error } = await supabase
          .from('schools')
          .update({ status: newStatus })
          .eq('id', inst.id);
        
        if (error) throw error;
        showToast(message);
        await logSystemActivity(inst.id, `${type} Action: ${message}`, 'Shield', '#4f46e5', mockAuthUser?.id, 'SECURITY');
        fetchInstitutes();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }, [mockAuthUser?.id, fetchInstitutes, logSystemActivity, showToast]);

  const handleAddInstitute = useCallback(async (instForm: any) => {
    if (!instForm.name || !instForm.hmEmail) {
      showToast("Required: Node Name and Administrative Email.", "error");
      return;
    }
    setIsLoadingInstitutes(true);
    try {
      const { data: newInst, error: instError } = await supabase.from('schools').insert({
        name: instForm.name,
        plan: instForm.plan,
        status: instForm.status || 'ACTIVE',
        email: instForm.hmEmail,
        phone: instForm.hmPhone
      }).select().single();

      if (instError) throw instError;

      // Auto-mark the source inquiry as ONBOARDED if it came from an inquiry
      if (instForm.inquiryId && updateRegistrationStatus) {
        try {
          await updateRegistrationStatus(instForm.inquiryId, 'ONBOARDED');
        } catch (err) {
          console.warn('Could not update inquiry status:', err);
        }
      }

      // Log activity
      await logSystemActivity(null, `Provisioned new institute node: ${instForm.name}`, 'Zap', '#4f46e5', mockAuthUser?.id, 'INSTITUTION');

      showToast("Institutional Node Provisioned Successfully!");
      await fetchInstitutes();
    } catch (err: any) {
      showToast(`Provisioning failed: ${err.message}`, 'error');
    } finally {
      setIsLoadingInstitutes(false);
    }
  }, [fetchInstitutes, logSystemActivity, setIsLoadingInstitutes, showToast, updateRegistrationStatus]);

  const handleUpdateInstituteStatus = useCallback(async (schoolId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ billing_status: status })
        .eq('id', schoolId);

      if (error) throw error;
      showToast(`Subscription status updated to ${status}`);
      await fetchInstitutes();
    } catch (err: any) {
      showToast(`Update Failed: ${err.message}`, 'error');
    }
  }, [fetchInstitutes, showToast]);

  return {
    handleVerifyInstitute,
    handleUpdateInstituteLogo,
    handleInstituteAction,
    handleAddInstitute,
    handleUpdateInstituteStatus
  };
};

