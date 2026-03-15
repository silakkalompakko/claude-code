import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../utils/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: Colors.primary,   text: Colors.white },
  secondary: { bg: Colors.white,     text: Colors.text,          border: Colors.border },
  ghost:     { bg: 'transparent',    text: Colors.textSecondary },
  danger:    { bg: Colors.danger,    text: Colors.white },
  success:   { bg: Colors.success,   text: Colors.white },
};

const sizeStyles: Record<Size, { py: number; px: number; fontSize: number; iconSize: number }> = {
  sm: { py: 7,  px: 12, fontSize: 13, iconSize: 14 },
  md: { py: 11, px: 16, fontSize: 15, iconSize: 16 },
  lg: { py: 14, px: 20, fontSize: 16, iconSize: 18 },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
}) => {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          paddingVertical: ss.py,
          paddingHorizontal: ss.px,
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border ?? 'transparent',
          opacity: isDisabled ? 0.55 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
          <Text style={{ color: vs.text, fontSize: ss.fontSize, fontWeight: '600' }}>
            {children as string}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
