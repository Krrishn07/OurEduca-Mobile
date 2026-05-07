import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useMockAuth } from './MockAuthContext';

export interface SystemStatus {
  health: 'Optimal' | 'Degraded' | 'Offline';
  latency: number;
}

interface SystemStatusContextType {
  systemStatus: SystemStatus;
  isLiveSessionActive: boolean;
  setIsLiveSessionActive: (active: boolean) => void;
  activeSessionData: any;
  setActiveSessionData: (data: any) => void;
  checkSystemHealth: () => Promise<void>;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export const SystemStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentSchool, currentUser } = useMockAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ health: 'Optimal', latency: 0 });
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState<any>(null);
  const sessionEndedAt = useRef<number>(0);

  const checkSystemHealth = useCallback(async () => {
    const start = Date.now();
    try {
        const { error } = await supabase.from('schools').select('id', { count: 'exact', head: true }).limit(1);
        const end = Date.now();
        setSystemStatus({
            health: error ? 'Degraded' : 'Optimal',
            latency: end - start
        });
    } catch (err: any) {
        console.warn('[HEALTH_CHECK_FAILED]', err);
        const isNetworkError = err?.message?.toLowerCase().includes('fetch') || 
                               err?.message?.toLowerCase().includes('network') ||
                               !err;
        setSystemStatus({
            health: isNetworkError ? 'Offline' : 'Degraded',
            latency: Date.now() - start
        });
    }
  }, []);

  // Periodic Heartbeat
  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(() => {
        checkSystemHealth();
    }, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  // Session Recovery Logic
  useEffect(() => {
    if (Date.now() - sessionEndedAt.current < 10000) return;

    const recoverSession = async () => {
        if (!currentUser?.id || isLiveSessionActive) return;
        
        try {
            const { data, error } = await supabase
                .from('live_streams')
                .select('*')
                .eq('created_by', currentUser.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                setIsLiveSessionActive(true);
                setActiveSessionData(data);
                console.log(`[SESSION_RECOVERY] Restored institutional stream: ${data.id}`);
            }
        } catch (err) {
            console.error('[SESSION_RECOVERY_FAILED]', err);
        }
    };

    recoverSession();
  }, [currentUser?.id, isLiveSessionActive]);

  const handleSetIsLiveSessionActive = useCallback((active: boolean) => {
    setIsLiveSessionActive(active);
  }, []);

  const handleSetActiveSessionData = useCallback((data: any) => {
    setActiveSessionData(data);
  }, []);

  const value = React.useMemo(() => ({
    systemStatus,
    isLiveSessionActive,
    setIsLiveSessionActive: handleSetIsLiveSessionActive,
    activeSessionData,
    setActiveSessionData: handleSetActiveSessionData,
    checkSystemHealth
  }), [systemStatus, isLiveSessionActive, activeSessionData, handleSetIsLiveSessionActive, handleSetActiveSessionData, checkSystemHealth]);


  return (
    <SystemStatusContext.Provider value={value}>
      {children}
    </SystemStatusContext.Provider>
  );
};

export const useSystemStatus = () => {
  const context = useContext(SystemStatusContext);
  if (context === undefined) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
};
