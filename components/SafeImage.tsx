import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  fallbackIcon?: React.ReactNode;
  fallbackStyle?: any;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  uri,
  style,
  fallbackIcon,
  fallbackStyle,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no URI provided or has error, show fallback
  if (!uri || hasError) {
    return (
      <LinearGradient
        colors={colors.accent.gradient}
        style={[style, fallbackStyle]}
      >
        {fallbackIcon || <User size={40} color={colors.text.primary} />}
      </LinearGradient>
    );
  }

  return (
    <Image
      {...props}
      source={{ uri }}
      style={style}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
      onLoad={() => {
        setIsLoading(false);
      }}
      onLoadStart={() => {
        setIsLoading(true);
        setHasError(false);
      }}
    />
  );
};