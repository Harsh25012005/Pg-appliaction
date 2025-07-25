import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
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
        
        // Both user data and auth token must exist for valid session
        if (userData && authToken) {
          try {
            const parsedUser = JSON.parse(userData);
            
            // Validate user data structure
            if (parsedUser && parsedUser.id && parsedUser.name) {
              setUser(parsedUser);
              setIsAuthenticated(true);
            } else {
              throw new Error('Invalid user data');
            }
          } catch (parseError) {
            throw parseError;
          }
        } else {
          // Clear any partial data
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        // Clear corrupted data
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
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
    login: async (email: string, password: string) => {
      setIsLoading(true);
      
      try {
        // Validate inputs
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        // Check for missing Supabase config
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // Query tenants table for user with matching email only
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .single();

        // Handle Supabase errors
        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('No account found with this email address. Please check your email or sign up for a new account.');
          }
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }

        // Check if user data exists
        if (!data) {
          throw new Error('No account found with this email address. Please check your email or sign up for a new account.');
        }

        // Verify password (plain text comparison - consider hashing in production)
        if (data.password !== password) {
          throw new Error('Incorrect password. Please check your password and try again.');
        }

        // Build user object
        const userData = {
          id: String(data.id),
          name: data.name || 'Unknown User',
          room: String(data.room_id || 'N/A'),
          joinedOn: data.join_date || new Date().toISOString(),
          profilePic: data.avatar || undefined,
        };

        // Store in AsyncStorage first
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('authToken', `tenant-${data.id}-${Date.now()}`);
        
        // Then set authentication state
        setUser(userData);
        setIsAuthenticated(true);
        
        return userData;

      } catch (error: any) {
        // Clear any existing auth data
        setIsAuthenticated(false);
        setUser(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
        
        // Re-throw the error to be handled by the UI
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    updateUser: async (updatedUser: Partial<User>) => {
      if (!user) return;
      
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    },
    logout: async () => {
      try {
        // Clear state first
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear storage
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('authToken');
      } catch (error) {
        // Still clear state even if storage fails
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };
});