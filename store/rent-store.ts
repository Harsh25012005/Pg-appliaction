import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Rent } from '@/types';

export const [RentProvider, useRent] = createContextHook(() => {
  const [rentHistory, setRentHistory] = useState<Rent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRentData = async () => {
      try {
        const data = await AsyncStorage.getItem('rentHistory');
        if (data) {
          setRentHistory(JSON.parse(data));
        } else {
          // Mock rent data
          const mockRentHistory: Rent[] = [
            {
              id: '1',
              month: 'July 2025',
              amount: 3000,
              dueDate: '2025-07-05',
              status: 'pending',
            },
            {
              id: '2',
              month: 'June 2025',
              amount: 3000,
              dueDate: '2025-06-05',
              status: 'paid',
              paidOn: '2025-06-03',
              receipt: 'https://example.com/receipt-june.pdf',
            },
            {
              id: '3',
              month: 'May 2025',
              amount: 3000,
              dueDate: '2025-05-05',
              status: 'paid',
              paidOn: '2025-05-04',
              receipt: 'https://example.com/receipt-may.pdf',
            },
          ];
          setRentHistory(mockRentHistory);
          await AsyncStorage.setItem('rentHistory', JSON.stringify(mockRentHistory));
        }
      } catch (error) {
        console.error('Failed to load rent data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRentData();
  }, []);

  const payRent = async (rentId: string) => {
    const updatedHistory = rentHistory.map(rent => {
      if (rent.id === rentId) {
        return {
          ...rent,
          status: 'paid' as const,
          paidOn: new Date().toISOString().split('T')[0],
          receipt: `https://example.com/receipt-${rent.month.toLowerCase().replace(' ', '-')}.pdf`,
        };
      }
      return rent;
    });

    setRentHistory(updatedHistory);
    await AsyncStorage.setItem('rentHistory', JSON.stringify(updatedHistory));
    return true;
  };

  return {
    rentHistory,
    currentRent: rentHistory.find(rent => rent.status === 'pending'),
    isLoading,
    payRent,
  };
});