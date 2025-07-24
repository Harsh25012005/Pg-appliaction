import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { AIChat } from '@/components/AIChat';
import { useRouter } from 'expo-router';

export default function AIAssistantScreen() {
  const router = useRouter();
  
  const handleClose = () => {
    router.back();
  };
  
  const handleQuickReplyPress = (action: string) => {
    router.back();
    
    setTimeout(() => {
      switch (action) {
        case 'NAVIGATE_TO_MEALS':
          router.push('/(tabs)/meals');
          break;
        case 'NAVIGATE_TO_COMPLAINTS':
          router.push('/(tabs)/complaints');
          break;
        case 'NAVIGATE_TO_RENT':
          router.push('/(tabs)/rent');
          break;
        case 'NAVIGATE_TO_ANNOUNCEMENTS':
          router.push('/(tabs)/announcements');
          break;
        default:
          break;
      }
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <AIChat onClose={handleClose} onQuickReplyPress={handleQuickReplyPress} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.surface,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});