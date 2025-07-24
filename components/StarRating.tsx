import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = 24,
  onRatingChange,
  style,
  disabled = false,
}: StarRatingProps) => {
  const handlePress = (selectedRating: number) => {
    if (disabled || !onRatingChange) return;
    onRatingChange(selectedRating);
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starFilled = index < rating;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index + 1)}
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.7}
            style={styles.starContainer}
          >
            <Star
              size={size}
              color={starFilled ? colors.status.warning : colors.text.muted}
              fill={starFilled ? colors.status.warning : 'none'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
  },
});