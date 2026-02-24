import { cn } from '@/lib/utils';
import { Text } from '../../shadcn-ui/text';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  TextInput,
  TextInputKeyPressEventData,
  TextInputProps,
  View,
} from 'react-native';
import { Input } from '../../shadcn-ui/input';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface InputOTPProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  /** Number of OTP digits */
  length?: number;
  /** Current OTP value */
  value?: string;
  /** Called when OTP value changes */
  onChangeText?: (value: string) => void;
  /** Called when OTP is fully entered (all digits) */
  onComplete?: (value: string) => void;
  /** Error message displayed below slots */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className for the outer container */
  containerClassName?: string;
  /** Additional className merged into each slot */
  slotClassName?: string;
  /** Additional className merged into the error text */
  errorClassName?: string;
  /** Show dots instead of digits */
  masked?: boolean;
  /** Node rendered between each slot */
  separator?: React.ReactNode;
  /** Show blinking cursor in the active empty slot */
  showCursor?: boolean;
}

export interface InputOTPRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const InputOTP = forwardRef<InputOTPRef, InputOTPProps>(
  (
    {
      length = 6,
      value = '',
      onChangeText,
      onComplete,
      error,
      disabled = false,
      containerClassName,
      slotClassName,
      errorClassName,
      masked = false,
      separator,
      showCursor = true,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Clamp value to max length
    const normalizedValue = value.slice(0, length);

    // Active slot = first empty slot, or last slot when full
    const currentActiveIndex = Math.min(normalizedValue.length, length - 1);

    // ── Imperative API ─────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => onChangeText?.(''),
      getValue: () => normalizedValue,
    }));

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleChangeText = useCallback(
      (text: string) => {
        const cleanText = text.replace(/[^0-9]/g, '');
        const limitedText = cleanText.slice(0, length);

        onChangeText?.(limitedText);

        if (limitedText.length === length) {
          onComplete?.(limitedText);
        }
      },
      [length, onChangeText, onComplete]
    );

    const handleKeyPress = useCallback(
      (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        if (e.nativeEvent.key === 'Backspace' && normalizedValue.length > 0) {
          onChangeText?.(normalizedValue.slice(0, -1));
        }
      },
      [normalizedValue, onChangeText]
    );

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleSlotPress = useCallback(() => {
      if (!disabled) inputRef.current?.focus();
    }, [disabled]);

    // ── Slots ──────────────────────────────────────────────────────────────
    const slots = Array.from({ length }, (_, index) => {
      const hasValue = index < normalizedValue.length;
      const isActive = isFocused && index === currentActiveIndex;
      const displayValue = hasValue ? (masked ? '•' : normalizedValue[index]) : '';

      return (
        <React.Fragment key={index}>
          {/* Individual OTP slot */}
          <Pressable
            onPress={handleSlotPress}
            disabled={disabled}
            className={cn(
              // base
              'size-12 items-center justify-center rounded-lg border',
              // border colour: error → active → default
              error ? 'border-destructive' : isActive ? 'border-ring' : 'border-border',
              // bg + disabled state
              disabled ? 'bg-muted/20 opacity-60' : 'bg-card',
              // consumer override
              slotClassName
            )}>
            {/* Displayed digit or mask */}
            <Text
              className={cn(
                'text-lg font-semibold',
                error ? 'text-destructive' : hasValue ? 'text-foreground' : 'text-muted-foreground'
              )}>
              {displayValue}
            </Text>

            {/* Cursor – only on the active empty slot */}
            {showCursor && isActive && !hasValue && (
              <View
                className={cn(
                  'absolute h-5 w-0.5 bg-primary',
                  isFocused ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
          </Pressable>

          {/* Optional separator */}
          {separator && index < length - 1 && <View className="mx-1">{separator}</View>}
        </React.Fragment>
      );
    });

    // ── Render ─────────────────────────────────────────────────────────────
    return (
      <View className={containerClassName}>
        {/*
          Hidden TextInput – lives off-screen so the native keyboard can still
          appear and route keystrokes here.  w-px h-px keeps it focusable while
          opacity-0 + absolute removes it from the visible layout.
        */}
        <Input
          ref={inputRef}
          value={normalizedValue}
          onChangeText={handleChangeText}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={length}
          editable={!disabled}
          selectionColor="transparent"
          className="absolute left-0 top-0 h-px w-px opacity-0"
          {...textInputProps}
        />

        {/* Slot row */}
        <View className={cn('flex-row items-center justify-center', separator ? 'gap-0' : 'gap-2')}>
          {slots}
        </View>

        {/* Inline error */}
        {error && (
          <Text className={cn('mt-2 text-center text-sm text-destructive', errorClassName)}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

InputOTP.displayName = 'InputOTP';

// ─── Preset: with dash separator ─────────────────────────────────────────────
// Note: useColor was previously called inside JSX here (Rules-of-Hooks violation).
// The separator is now a pure className-based <Text> – no hook needed.

export const InputOTPWithSeparator = forwardRef<InputOTPRef, Omit<InputOTPProps, 'separator'>>(
  (props, ref) => (
    <InputOTP
      ref={ref}
      separator={<Text className="text-lg text-muted-foreground">–</Text>}
      {...props}
    />
  )
);

InputOTPWithSeparator.displayName = 'InputOTPWithSeparator';
