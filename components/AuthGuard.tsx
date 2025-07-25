import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/store/user-store';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <Text style={{ color: colors.text.secondary }}>Redirecting to login...</Text>
      </View>
    );
  }

  return <>{children}</>;
}