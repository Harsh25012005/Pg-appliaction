import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  room: string;
  joinedOn: string;
  profilePic?: string;
}

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const authToken = await AsyncStorage.getItem('authToken');
        
        if (userData && authToken) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login: async (userData: User) => {
      setUser(userData);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', 'mock-token-' + Date.now());
    },
    updateUser: async (updatedUser: Partial<User>) => {
      if (!user) return;
      
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    },
    logout: async () => {
      setUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
    }
  };
});