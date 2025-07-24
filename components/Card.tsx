import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  variant?: 'default' | 'glass' | 'gradient';
}

export const Card = ({ children, style, elevated = false, variant = 'default' }: CardProps) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'glass':
        return styles.glassCard;
      case 'gradient':
        return styles.gradientCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[
      styles.card, 
      getCardStyle(),
      elevated ? styles.elevated : null,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 6,
  },
  defaultCard: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  gradientCard: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  elevated: {
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
});