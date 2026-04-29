import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { AppTheme, AppTypography } from '../theme';

interface ActionTileProps extends TouchableOpacityProps {
  label?: string;
  title?: string;
  subtitle?: string;
  icon: any;
  type?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
  toneClassName?: string;
  iconShellClassName?: string;
  textClassName?: string;
}

export const ActionTile: React.FC<ActionTileProps> = ({
  label,
  title,
  subtitle,
  icon: Icon,
  type = 'brand',
  toneClassName = '',
  iconShellClassName = '',
  textClassName = '',
  className = '',
  ...props
}) => {
  const getStyles = () => {
    switch (type) {
      case 'brand':
        return {
          container: 'bg-indigo-600 border-indigo-500 shadow-indigo-100/50',
          shell: 'bg-white/15 border-white/20',
          title: 'text-white',
          subtitle: 'text-indigo-100/60',
          iconColor: '#ffffff'
        };
      case 'success':
        return {
          container: 'bg-emerald-600 border-emerald-500 shadow-emerald-100/50',
          shell: 'bg-white/15 border-white/20',
          title: 'text-white',
          subtitle: 'text-emerald-100/60',
          iconColor: '#ffffff'
        };
      case 'neutral':
        return {
          container: 'bg-white border-gray-100 shadow-indigo-100/20',
          shell: 'bg-indigo-50 border-indigo-100',
          title: 'text-gray-900',
          subtitle: 'text-gray-400',
          iconColor: '#4f46e5'
        };
      case 'warning':
        return {
          container: 'bg-amber-500 border-amber-400 shadow-amber-100/50',
          shell: 'bg-white/15 border-white/20',
          title: 'text-white',
          subtitle: 'text-amber-100/60',
          iconColor: '#ffffff'
        };
      case 'danger':
        return {
          container: 'bg-rose-600 border-rose-500 shadow-rose-100/50',
          shell: 'bg-white/15 border-white/20',
          title: 'text-white',
          subtitle: 'text-rose-100/60',
          iconColor: '#ffffff'
        };
      default:
        return {
          container: toneClassName || 'bg-white border-gray-100',
          shell: iconShellClassName || 'bg-gray-50 border-gray-100',
          title: textClassName || 'text-gray-900',
          subtitle: 'text-gray-400',
          iconColor: '#4f46e5'
        };
    }
  };

  const styles = getStyles();

  // Handle icon as component or element
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && (Icon as any).$$typeof)) {
        return <Icon size={18} color={styles.iconColor} />;
    }
    return null;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      className={`flex-1 flex-col items-center justify-center py-5 px-3 rounded-[32px] border shadow-xl active:scale-[0.98] ${styles.container} ${className}`}
      {...props}
    >
      <View className={`w-11 h-11 rounded-2xl items-center justify-center mb-3 border ${styles.shell}`}>
        {renderIcon()}
      </View>
      
      <View className="items-center">
        <Text className={`text-[14px] font-black tracking-tighter font-inter-black ${styles.title}`} numberOfLines={1}>
            {title || label}
        </Text>
        {(subtitle) && (
            <Text className={`text-[9px] font-black uppercase tracking-widest mt-1 font-inter-black ${styles.subtitle}`} numberOfLines={1}>
                {subtitle}
            </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
