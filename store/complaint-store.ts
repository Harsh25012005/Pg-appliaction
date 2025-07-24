import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Complaint, ComplaintType, ComplaintUrgency } from '@/types';

export const [ComplaintProvider, useComplaint] = createContextHook(() => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await AsyncStorage.getItem('complaints');
        if (data) {
          setComplaints(JSON.parse(data));
        } else {
          // Mock complaint data
          const mockComplaints: Complaint[] = [
            {
              id: '1',
              title: 'Leaking tap in bathroom',
              description: 'The bathroom tap has been leaking for 2 days now. Water is being wasted.',
              type: 'Plumbing',
              urgency: 'Medium',
              status: 'Pending',
              createdAt: '2025-07-20T10:30:00Z',
              updatedAt: '2025-07-20T10:30:00Z',
            },
            {
              id: '2',
              title: 'WiFi not working',
              description: 'WiFi has been down since yesterday evening. Unable to work.',
              type: 'WiFi',
              urgency: 'High',
              status: 'In Progress',
              createdAt: '2025-07-19T18:45:00Z',
              updatedAt: '2025-07-20T09:15:00Z',
              response: 'ISP has been contacted. They will send a technician today.',
            },
            {
              id: '3',
              title: 'Broken chair',
              description: 'One leg of the chair in my room is broken.',
              type: 'Furniture',
              urgency: 'Low',
              status: 'Resolved',
              createdAt: '2025-07-15T14:20:00Z',
              updatedAt: '2025-07-17T11:30:00Z',
              response: 'Chair has been replaced.',
            },
          ];
          setComplaints(mockComplaints);
          await AsyncStorage.setItem('complaints', JSON.stringify(mockComplaints));
        }
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const addComplaint = async (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      id: Date.now().toString(),
      ...complaint,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    const updatedComplaints = [newComplaint, ...complaints];
    setComplaints(updatedComplaints);
    await AsyncStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    return newComplaint;
  };

  return {
    complaints,
    pendingComplaints: complaints.filter(c => c.status === 'Pending'),
    inProgressComplaints: complaints.filter(c => c.status === 'In Progress'),
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved'),
    isLoading,
    addComplaint,
  };
});