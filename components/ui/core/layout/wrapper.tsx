// components/ui/core/layout/wrapper.tsx
//
// CHANGELOG:
//   + scrollViewStyle — terima Animated.StyleProp untuk keyboard-aware padding
//     dibutuhkan oleh chat-block yang harus animasi paddingBottom ikut keyboard
//   + contentContainerStyle — terima non-animated inline style tambahan

import { cn } from '@/lib/utils';
import Animated, {
  type AnimatedRef,
  type AnimatedScrollViewProps,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type StyleProp, type ViewStyle } from 'react-native';

type WrapperProps = {
  children: React.ReactNode;
  className?: string;
  scrollRef?: AnimatedRef<Animated.ScrollView>;
  onScroll?: AnimatedScrollViewProps['onScroll'];
  containerClassName?: string;
  /** Default: ['bottom'] — header sudah handle top insets sendiri */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /**
   * Animated style untuk Animated.ScrollView itu sendiri (bukan contentContainer)
   * Dipakai oleh chat-block untuk animasi paddingBottom mengikuti keyboard
   */
  scrollViewStyle?: AnimatedStyle<StyleProp<ViewStyle>>;
  /**
   * Non-animated inline style tambahan untuk contentContainer
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function Wrapper({
  children,
  scrollRef,
  onScroll,
  className,
  containerClassName,
  edges = ['bottom', 'right', 'left', 'top'], // default hanya bottom, karena header sudah handle top insets
  scrollViewStyle,
  contentContainerStyle,
}: WrapperProps) {
  return (
    <SafeAreaView edges={edges} className={cn('flex flex-1 px-7', containerClassName)}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerClassName={cn('flex-col pt-0  bg-background gap-3 relative', className)}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        // ✅ NEW: animated style untuk ScrollView container (bukan contentContainer)
        // Dipakai saat parent butuh animasi height/padding mengikuti keyboard
        style={scrollViewStyle}>
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
