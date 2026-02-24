import { cn } from '@/lib/utils';
import { Text } from '../../shadcn-ui/text';
import React, { forwardRef, ReactElement, useState, useEffect } from 'react';
import {
  Pressable,
  TextInput as TextInputB,
  TextInputProps,
  View,
  TextStyle,
  ViewStyle,
  Keyboard,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Input } from '../../shadcn-ui/input';
import { Textarea } from '../../shadcn-ui/textarea';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

// ============================================
// GroupedInput Component
// ============================================
export interface GroupedInputProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  title?: string;
  titleStyle?: TextStyle;
}

export const GroupedInput = ({
  children,
  containerStyle,
  title,
  titleStyle,
}: GroupedInputProps) => {
  const childrenArray = React.Children.toArray(children);

  const errors = childrenArray
    .filter(
      (child): child is ReactElement<any> =>
        React.isValidElement(child) && !!(child.props as any).error
    )
    .map((child) => child.props.error);

  return (
    <View style={containerStyle}>
      {!!title && (
        <Text variant="large" className="mb-2 ml-2" style={titleStyle}>
          {title}
        </Text>
      )}

      <View className="gap-4">
        {childrenArray.map((child, index) => (
          <View key={index} className="justify-center">
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================
// GroupedInputItem Component with Smooth Animation
// ============================================
export interface GroupedInputItemProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  rightComponent?: React.ReactNode | (() => React.ReactNode);
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  disabled?: boolean;
  type?: 'input' | 'textarea';
  rows?: number;
  showError?: boolean;
}

export const GroupedInputItem = forwardRef<TextInputB, GroupedInputItemProps>(
  (
    {
      showError = true,
      label,
      error,
      rightComponent,
      inputStyle,
      labelStyle,
      errorStyle,
      disabled,
      type = 'input',
      rows = 3,
      onFocus,
      onBlur,
      placeholder,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const { colorScheme } = useColorScheme();

    const currentTheme = colorScheme ?? 'light';

    const primary = '#03a1fc';
    const mutedForeground = THEME[currentTheme].mutedForeground;
    const destructive = THEME[currentTheme].destructive;
    const background = THEME[currentTheme].card;

    const isTextarea = type === 'textarea';

    // Kondisi untuk floating label
    const shouldFloat = isFocused || (value && value.toString().length > 0);

    // Shared values untuk animasi
    const animationProgress = useSharedValue(0);

    // Update animasi saat shouldFloat berubah
    useEffect(() => {
      animationProgress.value = withSpring(shouldFloat ? 1 : 0, {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
      });
    }, [shouldFloat]);

    // Animated style untuk label
    const animatedLabelStyle = useAnimatedStyle(() => {
      // Interpolate translateY: dari tengah (10) ke atas (-10)
      const translateY = interpolate(animationProgress.value, [0, 1], [10, -10]);

      // Interpolate scale: dari normal (1) ke kecil (0.75)
      const scale = interpolate(animationProgress.value, [0, 1], [1, 0.75]);

      // Interpolate color
      let labelColor;
      if (error) {
        // Kalau error, tetap merah
        labelColor = destructive;
      } else {
        // Interpolate dari muted ke primary saat focus
        labelColor = interpolateColor(animationProgress.value, [0, 1], [mutedForeground, primary]);
      }

      return {
        transform: [{ translateY }, { scale }],
        color: labelColor,
      };
    });

    const toggleKeyboard = () => {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      } else {
        ref && 'current' in ref && ref.current?.focus();
      }
    };
    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
      toggleKeyboard();
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const renderRightComponent = () => {
      if (!rightComponent) return null;
      return typeof rightComponent === 'function' ? rightComponent() : rightComponent;
    };

    return (
      <Pressable
        onPress={() => ref && 'current' in ref && ref.current?.focus()}
        disabled={disabled}
        className={cn(disabled ? 'opacity-60' : 'opacity-100')}>
        <View className="flex flex-col gap-1.5">
          {isTextarea ? (
            <>
              {(label || rightComponent) && (
                <View className="mb-2 flex-row items-center gap-2">
                  <View className="flex-1 flex-row items-center gap-2" pointerEvents="none">
                    {label && (
                      <Text
                        variant="small"
                        className={cn(error ? 'text-destructive' : 'text-muted-foreground')}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {label}
                      </Text>
                    )}
                  </View>
                  {renderRightComponent()}
                </View>
              )}

              <Textarea
                ref={ref}
                placeholder={placeholder}
                editable={!disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={value}
                className={cn(
                  'border-0',
                  error && 'border-destructive text-destructive placeholder:text-destructive'
                )}
                {...props}
              />
            </>
          ) : (
            <View
              className={cn(
                'relative flex-row items-center rounded-xl border',
                // PRIORITY: Error > Focus > Default
                error
                  ? 'border-destructive' // Error tetap merah meski focused
                  : isFocused
                    ? 'border-blue-500' // Focus biru kalau gak error
                    : 'border-border' // Default
              )}>
              <View className="relative flex-1">
                {/* Animated Floating Label */}
                {label && (
                  <Animated.Text
                    style={[
                      {
                        position: 'absolute',
                        left: 12,
                        paddingHorizontal: 4,
                        backgroundColor: background,
                        zIndex: 1,
                        fontSize: 15,
                        fontWeight: '400',
                      },
                      animatedLabelStyle,
                    ]}>
                    {label}
                  </Animated.Text>
                )}

                <Input
                  ref={ref}
                  editable={!disabled}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={value}
                  className={cn(
                    'border-0 bg-transparent',
                    error && 'text-destructive',
                    label && 'pt-3' 
                  )}
                  {...props}
                />
              </View>

              {renderRightComponent()}
            </View>
          )}

          {error && showError && <Text className="mt-1 text-sm text-destructive">* {error}</Text>}
        </View>
      </Pressable>
    );
  }
);

// ============================================
// SET DISPLAYNAME
// ============================================
GroupedInputItem.displayName = 'GroupedInputItem';
