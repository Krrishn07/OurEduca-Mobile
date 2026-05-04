import React, { useRef, useCallback } from 'react';
import { Animated, PanResponder, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icons } from '../../../../components/Icons';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  canDelete: boolean;
}

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 40;

export const SwipeableRow: React.FC<SwipeableRowProps> = ({ children, onDelete, canDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  
  // Store canDelete in a ref so PanResponder always reads the latest value
  const canDeleteRef = useRef(canDelete);
  canDeleteRef.current = canDelete;

  // Store onDelete in a ref so PanResponder always reads the latest callback
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const panResponder = useRef(
    PanResponder.create({
      // Must return true to begin tracking the gesture
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes (left direction) when deletion is allowed
        if (!canDeleteRef.current) return false;
        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
        const isLeftSwipe = gestureState.dx < -5;
        return isHorizontalSwipe && isLeftSwipe;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Capture the responder more aggressively for clear horizontal swipes
        if (!canDeleteRef.current) return false;
        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
        const isLeftSwipe = gestureState.dx < -10;
        return isHorizontalSwipe && isLeftSwipe;
      },
      onPanResponderGrant: () => {
        // When gesture starts, set offset to current position value
        translateX.setOffset(isOpen.current ? -ACTION_WIDTH : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Clamp movement: allow left swipe up to ACTION_WIDTH, minimal right overshoot
        const currentOffset = isOpen.current ? -ACTION_WIDTH : 0;
        const newValue = currentOffset + gestureState.dx;
        const clamped = Math.min(0, Math.max(-ACTION_WIDTH, newValue));
        translateX.setOffset(0);
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        
        if (isOpen.current) {
          // If already open, check if swiping right to close
          if (gestureState.dx > SWIPE_THRESHOLD) {
            closeRow();
          } else {
            openRow();
          }
        } else {
          // If closed, check if swiped far enough left to open
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            openRow();
          } else {
            closeRow();
          }
        }
      },
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        closeRow();
      },
    })
  ).current;

  const openRow = useCallback(() => {
    isOpen.current = true;
    Animated.spring(translateX, {
      toValue: -ACTION_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [translateX]);

  const closeRow = useCallback(() => {
    isOpen.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [translateX]);

  const handleDelete = useCallback(() => {
    onDeleteRef.current();
    closeRow();
  }, [closeRow]);

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
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
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
