import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { ComplaintStatus, ComplaintUrgency } from '@/types';

interface StatusBadgeProps {
  status: ComplaintStatus | ComplaintUrgency;
  style?: ViewStyle;
  variant?: 'default' | 'minimal';
}

export const StatusBadge = ({ status, style, variant = 'default' }: StatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending':
      case 'High':
        return colors.status.error;
      case 'In Progress':
      case 'Medium':
        return colors.status.warning;
      case 'Resolved':
      case 'Low':
        return colors.status.success;
      default:
        return colors.status.info;
    }
  };

  const getStatusConfig = () => {
    const color = getStatusColor();
    return {
      backgroundColor: variant === 'minimal' ? `${color}20` : color,
      textColor: variant === 'minimal' ? color : colors.text.primary,
    };
  };

  const config = getStatusConfig();

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: config.backgroundColor },
      variant === 'minimal' && styles.minimalBadge,
      style
    ]}>
      <Text style={[styles.text, { color: config.textColor }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  minimalBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});