import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';

const { height } = Dimensions.get('window');

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: number[];
  style?: ViewStyle;
  onClose?: () => void;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, snapPoints = [0.5, 0.9], style, onClose }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const lastGestureDy = useRef(0);
    const currentValue = useRef(0);
    const snapPointsPixels = snapPoints.map(point => height * point);
    const [activeSnapPoint, setActiveSnapPoint] = useState(0);

    // Listen to animated value changes
    React.useEffect(() => {
      const listener = animatedValue.addListener(({ value }) => {
        currentValue.current = value;
      });
      
      return () => {
        animatedValue.removeListener(listener);
      };
    }, [animatedValue]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          const currentSnapHeight = snapPointsPixels[activeSnapPoint];
          const newValue = (height - currentSnapHeight) + gestureState.dy;
          if (newValue >= height - currentSnapHeight && newValue <= height) {
            animatedValue.setValue(newValue);
          }
          lastGestureDy.current = gestureState.dy;
        },
        onPanResponderRelease: () => {
          const currentPosition = currentValue.current;
          
          if (lastGestureDy.current > 100) {
            // Swipe down - go to lower snap point or close
            if (activeSnapPoint === 0) {
              close();
            } else {
              const newSnapPoint = activeSnapPoint - 1;
              snapToPoint(newSnapPoint);
            }
          } else if (lastGestureDy.current < -100) {
            // Swipe up - go to higher snap point
            if (activeSnapPoint < snapPointsPixels.length - 1) {
              const newSnapPoint = activeSnapPoint + 1;
              snapToPoint(newSnapPoint);
            }
          } else {
            // Find closest snap point
            let closestPoint = 0;
            let minDistance = Math.abs((height - snapPointsPixels[0]) - currentPosition);
            
            for (let i = 1; i < snapPointsPixels.length; i++) {
              const distance = Math.abs((height - snapPointsPixels[i]) - currentPosition);
              if (distance < minDistance) {
                minDistance = distance;
                closestPoint = i;
              }
            }
            
            snapToPoint(closestPoint);
          }
          
          lastGestureDy.current = 0;
        },
      })
    ).current;

    const snapToPoint = (index: number) => {
      setActiveSnapPoint(index);
      const targetHeight = snapPointsPixels[index];
      Animated.spring(animatedValue, {
        toValue: height - targetHeight,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    };

    const open = () => {
      setIsOpen(true);
      snapToPoint(0);
    };

    const close = () => {
      Animated.timing(animatedValue, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false);
        if (onClose) onClose();
      });
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    if (!isOpen) return null;

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              style,
              {
                transform: [{ translateY: animatedValue }],
              },
            ]}
          >
            <View {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    maxHeight: height * 0.95,
    flex: 1,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.text.muted,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
});