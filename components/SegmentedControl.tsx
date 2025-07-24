import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export const SegmentedControl = ({
  options,
  selectedIndex,
  onChange,
  style,
}: SegmentedControlProps) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            selectedIndex === index && styles.selectedOption,
            index === 0 && styles.firstOption,
            index === options.length - 1 && styles.lastOption,
          ]}
          onPress={() => onChange(index)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.optionText,
              selectedIndex === index && styles.selectedOptionText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.elevated,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  firstOption: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastOption: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  optionText: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  selectedOptionText: {
    color: colors.text.primary,
    fontWeight: '600' as const,
  },
});