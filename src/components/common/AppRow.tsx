import React, { useRef, useState, useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  Platform,
} from 'react-native';
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

const ACTION_WIDTH = 72; // px revealed on swipe-left
const SWIPE_THRESHOLD = 36; // minimum dx to snap open


export interface SwipeAction {
  label: string;
  bgColor: string;      // e.g. 'bg-rose-500'
  icon?: React.ReactNode;
  onPress: () => void;
}

export interface AppRowProps {
  /** Main text — bold, 13px (can be a component for animations) */
  title: string | React.ReactNode;
  /** Detail below title — 11px muted */
  subtitle?: string;
  /** Far-right tiny meta label OR custom right element */
  meta?: string;
  /** Single letter shown in avatar bubble */
  avatarLetter?: string;
  /** Color for avatar bg, e.g. '#eef2ff' */
  avatarBg?: string;
  /** Color for avatar letter, e.g. '#4f46e5' */
  avatarColor?: string;
  /** Replaces avatar letter with a React node icon */
  avatarIcon?: React.ReactNode;
  /** @deprecated — no longer rendered */
  statusDot?: string;
  /** Inline pill tags shown after subtitle */
  pills?: React.ReactNode;
  /** Custom right element (chevron, button, etc.) */
  rightElement?: React.ReactNode;
  /** Tap handler for the entire row */
  onPress?: () => void;
  /** Swipe-left action revealed on swipe */
  swipeAction?: SwipeAction;
  /** Show bottom border separator */
  showBorder?: boolean;
  className?: string;
  /** Custom class for the title text */
  titleClassName?: string;
  /** Custom class for the inner content container */
  innerClassName?: string;
  /** Custom class for the subtitle text */
  subtitleClassName?: string;
  /** Props for the title Text component */
  titleProps?: any;
  /** Props for the subtitle Text component */
  subtitleProps?: any;
}

const RowContent = ({ 
  avatarLetter, avatarIcon, avatarBg, avatarColor, 
  title, subtitle, pills, meta, rightElement, titleClassName = '', subtitleClassName = '',
  titleProps = {}, subtitleProps = {}
}: any) => (
  <>
    {/* Avatar bubble */}
    {(avatarLetter || avatarIcon) && (
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3 shrink-0"
        style={{ backgroundColor: avatarBg }}
      >
        {avatarIcon ? (
          avatarIcon
        ) : (
          <Text
            className="text-[13px] font-black font-inter-black"
            style={{ color: avatarColor }}
          >
            {avatarLetter}
          </Text>
        )}
      </View>
    )}

    {/* Text content */}
    <View className="flex-1 mr-2">
      {typeof title === 'string' ? (
        <Text
          className={`text-[13px] font-black tracking-tight font-inter-black leading-tight ${titleClassName || 'text-gray-900'}`}
          numberOfLines={1}
          {...titleProps}
        >
          {title}
        </Text>
      ) : (
        title
      )}

      {(subtitle || pills) && (
        <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
          {subtitle && (
            <Text
              className={`text-[11px] font-medium font-inter-medium ${subtitleClassName || 'text-gray-400'}`}
              numberOfLines={1}
              {...subtitleProps}
            >
              {subtitle}
            </Text>
          )}
          {pills}
        </View>
      )}
    </View>

    {/* Right side - Flexible width for buttons/labels */}
    <View className="min-w-[32px] items-center justify-center ml-2">
      {meta && (
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-inter-black mb-1">
          {meta}
        </Text>
      )}
      {rightElement}
    </View>
  </>
);

export const AppRow: React.FC<AppRowProps> = ({
  title,
  subtitle,
  meta,
  avatarLetter,
  avatarBg = 'rgba(238, 242, 255, 0.6)',
  avatarColor = '#4f46e5',
  avatarIcon,
  statusDot = 'none',
  pills,
  rightElement,
  onPress,
  swipeAction,
  showBorder = true,
  className = '',
  titleClassName = '',
  innerClassName = '',
  subtitleClassName = '',
  titleProps,
  subtitleProps,
}) => {
  const translateX = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const closeSwipe = useCallback(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    setIsOpen(false);
  }, []);

  const panGesture = Gesture.Pan()
    .enabled(!!swipeAction)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0 && !isOpen) {
        translateX.value = Math.max(event.translationX, -ACTION_WIDTH);
      } else if (event.translationX > 0 && isOpen) {
        translateX.value = Math.min(-ACTION_WIDTH + event.translationX, 0);
      }
    })
    .onEnd((event) => {
      if (!isOpen && event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-ACTION_WIDTH, { damping: 20, stiffness: 200 });
        runOnJS(setIsOpen)(true);
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        runOnJS(setIsOpen)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleSwipeActionPress = () => {
    closeSwipe();
    swipeAction?.onPress();
  };

  return (
    <View
      className={`relative overflow-hidden ${showBorder ? 'border-b border-gray-100/50' : ''} ${className}`}
    >
      {/* Swipe Action Background (revealed on left swipe) */}
      {swipeAction && (
        <Pressable
          onPress={handleSwipeActionPress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
          })}
          className={`absolute right-0 top-0 bottom-0 w-[72px] items-center justify-center ${swipeAction.bgColor}`}
        >
          {swipeAction.icon}
          <Text className="text-white text-[9px] font-black uppercase tracking-widest mt-1 font-inter-black">
            {swipeAction.label}
          </Text>
        </Pressable>
      )}

      {/* Main Row — slides left on swipe */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          {onPress ? (
            <Pressable
              onPress={onPress}
              style={({ pressed }) => ({
                opacity: pressed ? 0.94 : 1,
                transform: [{ scale: (pressed && Platform.OS === 'ios') ? 0.985 : 1 }],
              })}
              className={`flex-row items-center px-4 py-2.5 ${innerClassName || 'bg-white'}`}
            >
            <RowContent 
              avatarLetter={avatarLetter}
              avatarIcon={avatarIcon}
              avatarBg={avatarBg}
              avatarColor={avatarColor}
              title={title}
              subtitle={subtitle}
              pills={pills}
              meta={meta}
              rightElement={rightElement}
              titleClassName={titleClassName}
              subtitleClassName={subtitleClassName}
              titleProps={titleProps}
              subtitleProps={subtitleProps}
            />
          </Pressable>
        ) : (
          <View className={`flex-row items-center px-4 py-2.5 ${innerClassName || 'bg-white'}`}>
            <RowContent 
              avatarLetter={avatarLetter}
              avatarIcon={avatarIcon}
              avatarBg={avatarBg}
              avatarColor={avatarColor}
              title={title}
              subtitle={subtitle}
              pills={pills}
              meta={meta}
              rightElement={rightElement}
              titleClassName={titleClassName}
              subtitleClassName={subtitleClassName}
              titleProps={titleProps}
              subtitleProps={subtitleProps}
            />
          </View>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
