import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Announcement, AnnouncementType } from '@/types';
import { useUser } from './user-store';

export const [AnnouncementProvider, useAnnouncement] = createContextHook(() => {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await AsyncStorage.getItem('announcements');
        if (data) {
          setAnnouncements(JSON.parse(data));
        } else {
          // Mock announcement data
          const mockAnnouncements: Announcement[] = [
            {
              id: '1',
              title: 'Rent Increase Notice',
              content: 'Please note that the rent will increase by 5% from next month due to rising maintenance costs.',
              type: 'Rent',
              isEmergency: false,
              createdAt: '2025-07-15T09:00:00Z',
              readBy: [],
            },
            {
              id: '2',
              title: 'Water Supply Disruption',
              content: 'Due to maintenance work, there will be no water supply from 10 AM to 2 PM tomorrow. Please store water accordingly.',
              type: 'Maintenance',
              isEmergency: true,
              createdAt: '2025-07-21T14:30:00Z',
              readBy: [],
            },
            {
              id: '3',
              title: 'New Menu Items',
              content: 'We have added new items to our menu based on your feedback. Check out the new options starting next week!',
              type: 'Meals',
              isEmergency: false,
              createdAt: '2025-07-18T11:15:00Z',
              readBy: [],
            },
            {
              id: '4',
              title: 'WiFi Password Change',
              content: 'The WiFi password has been changed to "PG2025Secure". Please update your devices.',
              type: 'General',
              isEmergency: false,
              createdAt: '2025-07-17T16:45:00Z',
              readBy: [],
            },
          ];
          setAnnouncements(mockAnnouncements);
          await AsyncStorage.setItem('announcements', JSON.stringify(mockAnnouncements));
        }
      } catch (error) {
        console.error('Failed to load announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const markAsRead = async (announcementId: string) => {
    if (!user) return;
    
    const updatedAnnouncements = announcements.map(announcement => {
      if (announcement.id === announcementId && !announcement.readBy.includes(user.id)) {
        return {
          ...announcement,
          readBy: [...announcement.readBy, user.id],
        };
      }
      return announcement;
    });

    setAnnouncements(updatedAnnouncements);
    await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
  };

  const getUnreadCount = () => {
    if (!user) return 0;
    return announcements.filter(a => !a.readBy.includes(user.id)).length;
  };

  const getFilteredAnnouncements = (type?: AnnouncementType) => {
    if (!type) return announcements;
    return announcements.filter(a => a.type === type);
  };

  return {
    announcements,
    isLoading,
    markAsRead,
    getUnreadCount,
    getFilteredAnnouncements,
    emergencyAnnouncements: announcements.filter(a => a.isEmergency),
  };
});