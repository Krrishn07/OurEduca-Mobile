import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ACTION_WIDTH = 72; // px revealed on swipe-left
const SWIPE_THRESHOLD = 36; // minimum dx to snap open


export interface SwipeAction {
  label: string;
  bgColor: string;      // e.g. 'bg-rose-500'
  icon?: React.ReactNode;
  onPress: () => void;
}

export interface AppRowProps {
  /** Main text — bold, 13px */
  title: string;
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
}

const RowContent = ({ 
  avatarLetter, avatarIcon, avatarBg, avatarColor, 
  title, subtitle, pills, meta, rightElement 
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
      <Text
        className="text-[13px] font-black text-gray-900 tracking-tight font-inter-black leading-tight"
        numberOfLines={1}
      >
        {title}
      </Text>

      {(subtitle || pills) && (
        <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
          {subtitle && (
            <Text
              className="text-[11px] font-medium text-gray-400 font-inter-medium"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
          {pills}
        </View>
      )}
    </View>

    {/* Right side */}
    <View className="items-end">
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
  avatarBg = '#eef2ff',
  avatarColor = '#4f46e5',
  avatarIcon,
  statusDot = 'none',
  pills,
  rightElement,
  onPress,
  swipeAction,
  showBorder = true,
  className = '',
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!swipeAction,
      onMoveShouldSetPanResponder: (_, g) =>
        !!swipeAction && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),

      onPanResponderMove: (_, g) => {
        if (g.dx < 0 && !isOpen) {
          translateX.setValue(Math.max(g.dx, -ACTION_WIDTH));
        } else if (g.dx > 0 && isOpen) {
          translateX.setValue(Math.min(-ACTION_WIDTH + g.dx, 0));
        }
      },

      onPanResponderRelease: (_, g) => {
        if (!isOpen && g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(false);
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
    setIsOpen(false);
  };

  const handleSwipeActionPress = () => {
    closeSwipe();
    swipeAction?.onPress();
  };

  return (
    <View
      className={`relative overflow-hidden ${showBorder ? 'border-b border-gray-50' : ''} ${className}`}
    >
      {/* Swipe Action Background (revealed on left swipe) */}
      {swipeAction && (
        <TouchableOpacity
          onPress={handleSwipeActionPress}
          activeOpacity={0.85}
          className={`absolute right-0 top-0 bottom-0 w-[72px] items-center justify-center ${swipeAction.bgColor}`}
        >
          {swipeAction.icon}
          <Text className="text-white text-[9px] font-black uppercase tracking-widest mt-1 font-inter-black">
            {swipeAction.label}
          </Text>
        </TouchableOpacity>
      )}

      {/* Main Row — slides left on swipe */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {onPress ? (
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-3 bg-white"
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
            />
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center px-4 py-3 bg-white">
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
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
};
