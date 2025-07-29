import { supabase } from '../utils/supabase';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { useUser } from './user-store';
import { Rent } from '@/types';

export const [RentProvider, useRent] = createContextHook(() => {
  const { user } = useUser();
  const [rentHistory, setRentHistory] = useState<Rent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rent/payment history from Supabase
  const fetchRentData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('tenant_id', user.id)
      .order('payment_date', { ascending: false });
    if (error) {
      setRentHistory([]);
    } else {
      setRentHistory(
        (data || []).map((row: any) => ({
          id: row.id.toString(),
          month: new Date(row.payment_date).toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
          amount: Number(row.amount),
          dueDate: row.payment_date,
          status: row.status === 'paid' ? 'paid' : 'pending',
          paidOn: row.status === 'paid' ? row.payment_date : null,
          receipt: row.receipt_url ?? null,
        }))
      );
    }
    setIsLoading(false);
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;
    fetchRentData();
    const channel = supabase
      .channel('payment-transactions-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_transactions', filter: `tenant_id=eq.${user.id}` },
        () => fetchRentData()
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, fetchRentData]);

  // Pay rent (mark as paid)
  const payRent = useCallback(async (rentId: string) => {
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status: 'paid', payment_date: new Date().toISOString() })
      .eq('id', rentId)
      .eq('tenant_id', user?.id);
    if (!error) fetchRentData();
    return !error;
  }, [user?.id, fetchRentData]);

  return {
    rentHistory,
    currentRent: rentHistory.find(rent => rent.status === 'pending'),
    isLoading,
    payRent,
  };
});