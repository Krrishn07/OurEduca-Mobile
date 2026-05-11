import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { 
  Gesture, 
  GestureDetector 
} from 'react-native-gesture-handler';
import { Icons } from '@components/common/Icons';
import { triggerHaptic } from '@utils/haptics';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  canDelete: boolean;
}

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 40;

export const SwipeableRow: React.FC<SwipeableRowProps> = ({ children, onDelete, canDelete }) => {
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);
  
  const openRow = useCallback(() => {
    isOpen.value = true;
    triggerHaptic();
    translateX.value = withSpring(-ACTION_WIDTH, { damping: 20, stiffness: 200 });
  }, []);

  const closeRow = useCallback(() => {
    isOpen.value = false;
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, []);

  const panGesture = Gesture.Pan()
    .enabled(canDelete)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      const currentOffset = isOpen.value ? -ACTION_WIDTH : 0;
      const newValue = currentOffset + event.translationX;
      translateX.value = Math.min(0, Math.max(-ACTION_WIDTH, newValue));
    })
    .onEnd((event) => {
      if (isOpen.value) {
        if (event.translationX > SWIPE_THRESHOLD) {
          runOnJS(closeRow)();
        } else {
          runOnJS(openRow)();
        }
      } else {
        if (event.translationX < -SWIPE_THRESHOLD) {
          runOnJS(openRow)();
        } else {
          runOnJS(closeRow)();
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleDelete = useCallback(() => {
    triggerHaptic();
    onDelete();
    closeRow();
  }, [onDelete, closeRow]);

  // If deletion isn't available, just render children directly (no gesture overhead)
  if (!canDelete) {
    return <View>{children}</View>;
  }

  return (
    <View style={styles.container}>
      {/* Delete action sitting behind the content */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteAction}
          activeOpacity={0.8}
        >
          <Icons.Trash size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Swipeable content layer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.content,
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
  },
});
