import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Complaint, ComplaintType, ComplaintUrgency } from '@/types';
import { supabase } from '../utils/supabase';
import { useUser } from './user-store';

export const [ComplaintProvider, useComplaint] = createContextHook(() => {
  const { user } = useUser();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);

    // Fetch complaints from Supabase for the logged-in tenant
    const fetchComplaints = async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('tenant_id', user.id)
        .order('date', { ascending: false });
      if (error) {
        console.error('Failed to fetch complaints:', error);
        setComplaints([]);
      } else {
        setComplaints(data || []);
      }
      setIsLoading(false);
    };

    fetchComplaints();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('complaints-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints', filter: `tenant_id=eq.${user.id}` },
        (payload) => {
          // Refetch complaints on any change
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Add complaint to Supabase
  const addComplaint = async (
    complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'tenant_id'>
  ) => {
    const now = new Date().toISOString();
    // If complaint.images or complaint.image is missing, set to null
    const safeComplaint = {
      ...complaint,
      images: complaint.hasOwnProperty('images') ? complaint.images : null,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      tenant_id: user?.id,
    };
    const { data, error } = await supabase
      .from('complaints')
      .insert([safeComplaint])
      .select()
      .single();
    if (error) {
      console.error('Failed to add complaint:', error);
      throw error;
    }
    // The real-time listener will update the list
    return data;
  };

  return {
    complaints,
    pendingComplaints: complaints.filter((c) => c.status?.toLowerCase() === 'pending'),
    inProgressComplaints: complaints.filter((c) => c.status?.toLowerCase() === 'in progress'),
    resolvedComplaints: complaints.filter((c) => c.status?.toLowerCase() === 'resolved'),
    isLoading,
    addComplaint,
  };
});