import { useEffect, useRef } from 'react';
import { getSupabaseClient } from './supabase';

interface UseBriefPollingProps {
  trendId: string;
  isPolling: boolean;
  onBriefReady: (briefUrl: string) => void;
  onError?: (error: Error) => void;
  pollInterval?: number; // in milliseconds
}

export function useBriefPolling({
  trendId,
  isPolling,
  onBriefReady,
  onError,
  pollInterval = 3000 // Default: check every 3 seconds
}: UseBriefPollingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkBriefStatus = async () => {
      try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          // For local development without Supabase, simulate brief generation
          setTimeout(() => {
            onBriefReady(`https://example.com/brief-${trendId}.pdf`);
          }, 5000);
          return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
          // For local development without Supabase, simulate brief generation
          setTimeout(() => {
            onBriefReady(`https://example.com/brief-${trendId}.pdf`);
          }, 5000);
          return;
        }

        const { data, error } = await supabase
          .from('trend_links')
          .select('url, label')
          .eq('trend_id', trendId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking brief status:', error);
          onError?.(new Error('Failed to check brief status'));
          return;
        }

        if (data && (data as any).url) {
          console.log('Brief is ready:', (data as any).url);
          onBriefReady((data as any).url);
        }
      } catch (error) {
        console.error('Error in checkBriefStatus:', error);
        onError?.(error as Error);
      }
    };

    if (isPolling) {
      // Start polling immediately
      checkBriefStatus();

      // Set up interval for subsequent checks
      intervalRef.current = setInterval(checkBriefStatus, pollInterval);
    } else {
      // Clear interval if not polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [trendId, isPolling, onBriefReady, onError, pollInterval]);
}