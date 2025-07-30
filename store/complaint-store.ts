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
    // Map 'title' to 'issue' for DB, remove 'title' from insert
    const {
      title,
      images,
      urgency,
      type,
      description,
      ...rest
    } = complaint;
    // 'date' is required (NOT NULL in DB) and should be just the date
    const date = now.split('T')[0];
    const safeComplaint = {
      issue: title, // Map title to issue
      description: description ?? '',
      type: type ?? '',
      urgency: urgency ?? '',
      images: Array.isArray(images) ? images : images ? [images] : null,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      date: date,
      tenant: user?.name || '', // Fix: set tenant (NOT NULL in DB)
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

  // Normalize status for robust tab filtering
  const normalizeStatus = (status?: string) => {
    if (!status) return '';
    const s = status.trim().toLowerCase().replace(/\s+/g, '-');
    if (s === 'in-progress' || s === 'in progress') return 'in-progress';
    if (s === 'pending') return 'pending';
    if (s === 'resolved') return 'resolved';
    return s;
  };

  return {
    complaints,
    pendingComplaints: complaints.filter((c) => normalizeStatus(c.status) === 'pending'),
    inProgressComplaints: complaints.filter((c) => normalizeStatus(c.status) === 'in-progress'),
    resolvedComplaints: complaints.filter((c) => normalizeStatus(c.status) === 'resolved'),
    isLoading,
    addComplaint,
  };
});