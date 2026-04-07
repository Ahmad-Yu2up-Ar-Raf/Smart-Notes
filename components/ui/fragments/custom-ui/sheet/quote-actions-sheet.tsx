import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { cn } from '@/lib/utils';
import { Quote } from '@/type/quotes-type';
import { useLiked } from '@/components/provider/LikedProvider';
import { Button } from '../../shadcn-ui/button';
import { Text } from '../../shadcn-ui/text';
import { Separator } from '../../shadcn-ui/separator';
import { Heart } from 'lucide-react-native';
import { Icon } from '../../shadcn-ui/icon';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

export interface QuoteActionsSheetProps {
  isOpen: boolean;
  quote: Quote;
  onClose: () => void;
}

/**
 * ✅ ANIMATED BOTTOM DRAWER: Quote save/unsave actions
 *
 * Features:
 * - Smooth Reanimated animations ✨
 * - Gesture-based pan/swipe to dismiss 👆
 * - Backdrop tap to dismiss
 * - Optimistic UI for instant feedback ⚡
 * - No duplicates (handled by liked-storage) 🛡️
 */
export function QuoteActionsSheet({ isOpen, quote, onClose }: QuoteActionsSheetProps) {
  const { addItem, removeItem, hasItem, isPending } = useLiked();
  const { colorScheme } = useColorScheme();

  const currentTheme = colorScheme ?? 'light';
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isLiked = hasItem(quote.id);

  // ✅ Animated values for drawer position
  const translateY = useSharedValue(isOpen ? 0 : screenHeight);
  const backdropOpacity = useSharedValue(isOpen ? 1 : 0);

  // ✅ Memoize theme colors
  const themeColors = useMemo(
    () => ({
      background: THEME[currentTheme].background,
      card: THEME[currentTheme].card,
      primary: THEME[currentTheme].primary,
      destructive: THEME[currentTheme].destructive,
      mutedForeground: THEME[currentTheme].mutedForeground,
      foreground: THEME[currentTheme].foreground,
    }),
    [currentTheme]
  );

  const SHEET_HEIGHT = screenHeight * 0.5;
  const DRAG_THRESHOLD = 50; // pixels to trigger close

  // ✅ Handle close with animation
  const handleClose = useCallback(() => {
    translateY.value = withSpring(screenHeight, {
      damping: 20,
      mass: 1,
      stiffness: 100,
    });
    backdropOpacity.value = withSpring(0, {
      damping: 20,
      mass: 1,
      stiffness: 100,
    });
    setTimeout(() => onClose(), 300);
  }, [screenHeight, onClose, translateY, backdropOpacity]);

  // ✅ Handle open with animation
  React.useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(screenHeight - SHEET_HEIGHT, {
        damping: 20,
        mass: 1,
        stiffness: 100,
      });
      backdropOpacity.value = withSpring(1, {
        damping: 20,
        mass: 1,
        stiffness: 100,
      });
    } else {
      handleClose();
    }
  }, [isOpen, screenHeight, SHEET_HEIGHT, translateY, backdropOpacity, handleClose]);

  /**
   * ✅ PAN GESTURE: Swipe down to close
   * Smooth drag with spring animation
   */
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Allow dragging only if moving down (positive y)
      if (event.velocityY > 0) {
        translateY.value = screenHeight - SHEET_HEIGHT + event.translationY;
      }
    })
    .onEnd((event) => {
      // Close if swiped down past threshold or velocity is high
      if (event.translationY > DRAG_THRESHOLD || event.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        // Spring back to open position
        translateY.value = withSpring(screenHeight - SHEET_HEIGHT, {
          damping: 20,
          mass: 1,
          stiffness: 100,
        });
      }
    });

  /**
   * ✅ ANIMATED STYLES
   */
  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  /**
   * ✅ HANDLE SAVE/UNSAVE
   * Optimistic update with background sync
   */
  const handleToggleLike = useCallback(async () => {
    try {
      if (isLiked) {
        await removeItem(quote.id);
      } else {
        await addItem(quote, 1);
      }
      setTimeout(() => handleClose(), 300);
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  }, [isLiked, quote, addItem, removeItem, handleClose]);

  /**
   * ✅ HANDLE BACKDROP PRESS
   */
  const handleBackdropPress = useCallback(() => {
    handleClose();
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* ✅ ANIMATED BACKDROP */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
          backdropAnimatedStyle,
        ]}>
        <Pressable
          onPress={handleBackdropPress}
          style={StyleSheet.absoluteFill}
          pointerEvents="auto"
        />
      </Animated.View>

      {/* ✅ ANIMATED DRAWER SHEET */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: SHEET_HEIGHT,
            backgroundColor: themeColors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 24,
            zIndex: 1000,
          },
          sheetAnimatedStyle,
        ]}
        pointerEvents="auto">
        {/* ✅ GESTURE DETECTOR FOR PAN */}
        <GestureDetector gesture={panGesture}>
          <View style={{ flex: 1 }}>
            {/* ✅ DRAG INDICATOR HANDLE */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: themeColors.mutedForeground,
                borderRadius: 2,
                opacity: 0.3,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            {/* ✅ SCROLLABLE CONTENT */}
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              {/* ✅ QUOTE PREVIEW */}
              <View style={{ marginBottom: 24, gap: 8 }}>
                <Text className="text-center font-poppins_semibold text-sm text-muted-foreground">
                  Quote
                </Text>
                <Text
                  numberOfLines={3}
                  className="text-center font-poppins_regular text-base text-foreground">
                  "{quote.quote}"
                </Text>
                <Text className="text-center text-xs text-muted-foreground">─ {quote.author}</Text>
              </View>

              <Separator style={{ marginVertical: 16 }} />

              {/* ✅ SAVE/UNSAVE BUTTON */}
              <Button
                disabled={isPending}
                variant={isLiked ? 'destructive' : 'default'}
                size="lg"
                className="mb-3 flex-row gap-2"
                onPress={handleToggleLike}>
                {!isPending && (
                  <Icon
                    as={Heart}
                    className={cn(
                      'size-5',
                      isLiked ? 'text-destructive-foreground' : 'text-primary-foreground'
                    )}
                  />
                )}
                <Text
                  className={cn(
                    'font-cinzel_black text-lg',
                    isLiked ? 'text-destructive-foreground' : 'text-primary-foreground'
                  )}>
                  {isPending ? 'Processing...' : isLiked ? 'Remove from Liked' : 'Save to Liked'}
                </Text>
              </Button>

              {/* ✅ CLOSE BUTTON */}
              <Button variant="outline" size="lg" onPress={handleClose}>
                <Text className="font-cinzel_black text-lg text-foreground">Cancel</Text>
              </Button>

              {/* ✅ INFO TEXT */}
              {isLiked && (
                <Text className="mt-3 text-center text-xs text-muted-foreground">
                  ❤️ Already saved to your liked quotes
                </Text>
              )}
            </View>
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}
