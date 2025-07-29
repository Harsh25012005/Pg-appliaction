import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useUser } from '@/store/user-store';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  room_id: number;
  bed_no?: number;
  join_date: string;
  rent?: number;
  status?: string;
  payment_status?: string;
  avatar?: string;
  address?: string;
  emergency_contact?: string;
  id_proof?: string;
  deposit?: number;
  payment_mode?: string;
  pg_name?: string;
}

export const useProfile = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setError('No user ID found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Profile not found. Please contact support.');
        }
        throw fetchError;
      }

      // Validate the data structure
      if (!data || !data.id) {
        throw new Error('Invalid profile data received');
      }

      setProfileData(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch profile data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user?.id) {
      throw new Error('No user ID found');
    }

    try {
      // Filter out null/undefined values and validate data
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error('No valid updates provided');
      }

      const { data, error: updateError } = await supabase
        .from('tenants')
        .update(cleanUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setProfileData(data);
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update profile');
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchProfile();

    // Set up real-time subscription with error handling
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          try {
            if (payload.eventType === 'UPDATE' && payload.new) {
              // Validate the payload data
              const newData = payload.new as ProfileData;
              if (newData.id && newData.id === user.id) {
                setProfileData(newData);
              }
            }
          } catch (err) {
            // Silently handle real-time update errors
            // The user can still refresh manually
          }
        }
      )
      .subscribe((status) => {
        // Handle different subscription states
        switch (status) {
          case 'SUBSCRIBED':
            // Successfully subscribed to real-time updates
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            // Real-time subscription failed, but app still works
            // User can refresh manually
            break;
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        // Ignore unsubscribe errors
      }
    };
  }, [user?.id]);

  return {
    profileData,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};