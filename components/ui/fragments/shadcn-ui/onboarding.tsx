import { Button } from './button';
import { Text } from './text';
import { cn } from '@/lib/utils';

import React, { useRef, useState } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { THEME } from '@/lib/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LogoApp from '../svg/logo-app';

const { width: screenWidth } = Dimensions.get('window');

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  image?: string;
  content?: React.ReactNode;
  backgroundColor?: string;
}

export interface OnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  showProgress?: boolean;
  swipeEnabled?: boolean;
  primaryButtonText?: string;
  skipButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
  withBackButton?: boolean;
  variant?: 'background' | 'default';
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  children?: React.ReactNode;
}

// Enhanced Onboarding Step Component for complex layouts

export function Onboarding({
  steps,
  onComplete,
  variant = 'default',
  onSkip,
  showSkip = true,
  showProgress = true,
  swipeEnabled = true,
  primaryButtonText = 'Get Started',
  skipButtonText = 'Skip',
  withBackButton = false,
  nextButtonText = 'Next',
  backButtonText = 'Back',
  edges = ['left', 'right'],
  style,
  children,
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateX = useSharedValue(0);
  const backgroundColor = THEME.light.card;
  const primaryColor = THEME.light.primary;
  const mutedColor = THEME.light.mutedForeground;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * screenWidth,
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({
        x: prevStep * screenWidth,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  // Modern gesture handling with Gesture API
  const panGesture = Gesture.Pan()
    .enabled(swipeEnabled)
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const shouldSwipe = Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 500;

      if (shouldSwipe) {
        if (translationX > 0 && !isFirstStep) {
          // Swipe right - go back
          runOnJS(handleBack)();
        } else if (translationX < 0 && !isLastStep) {
          // Swipe left - go next
          runOnJS(handleNext)();
        }
      }

      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderProgressDots = () => {
    if (!showProgress) return null;

    return (
      <>
        <View style={styles.progressContainer} className="relative z-20">
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentStep ? primaryColor : '#9c9c9c',
                  opacity: index === currentStep ? 1 : 0.3,
                  width: index === currentStep ? 30 : 8,
                },
              ]}
            />
          ))}
        </View>
      </>
    );
  };

  const renderStep = (step: OnboardingStep, index: number) => {
    const isActive = index === currentStep;

    return (
      <Animated.View
        key={step.id}
        style={[styles.stepContainer, { opacity: isActive ? 1 : 0.8 }]}
        className={'flex h-full flex-col content-center items-center justify-center'}>
        {variant === 'background' ? (
          <ImageBackground
            source={{
              uri:
                step.image || 'https://images.pexels.com/photos/3205568/pexels-photo-3205568.jpeg',
            }}
            resizeMode="cover"
            className="flex-1 items-center justify-center px-5"
            style={{
              paddingBottom: insets.bottom > 0 ? insets.bottom + 140 : 12,
            }}>
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.0)', // top fully transparent
                'rgba(0,0,0,0.7)', // middle slightly dark
                'rgba(0,0,0,2)', // bottom darker
              ]}
              locations={[0, 0.5, 1]}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />

            <View className="mb-0 h-full w-full justify-end gap-2 pr-12 text-left">
              <Text
                variant="h1"
                className="m-0 border-0 pb-2 text-left tracking-tighter text-white">
                {step.title}
              </Text>
              <Text
                variant="p"
                className="m-0 line-clamp-2 text-lg leading-6 text-muted-foreground">
                {step.description}
              </Text>
            </View>
          </ImageBackground>
        ) : (
          <View className="h-full w-full content-start items-start justify-start gap-5 px-5 pt-28">
            <View className="mb-0 h-fit w-full gap-2 pr-16 text-left">
              {/* <View
                className="size-fit"
                style={{
                  elevation: 100, // For Android shadow
                }}>
                <LogoApp
                  className="relative m-auto size-full overflow-visible shadow-lg shadow-black drop-shadow-sm"
                  style={{
                    elevation: 100, // For Android shadow
                  }}
                />
              </View> */}
              <Text variant="h1" className="m-0 border-0 pb-2 text-left text-3xl tracking-tighter">
                {step.title}
              </Text>
              {step.description && (
                <Text
                  variant="p"
                  className="m-0 line-clamp-2 text-lg leading-6 text-muted-foreground">
                  {step.description}
                </Text>
              )}
            </View>
            <View className="flex h-fit w-full content-center items-center justify-center overflow-hidden">
              {step.content}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };
  const insets = useSafeAreaInsets();

  // ✅ useAnimatedKeyboard: hook reanimated yang track tinggi keyboard secara real-time
  // Jauh lebih smooth dibanding Keyboard.addListener karena berjalan di UI thread langsung
  const keyboard = useAnimatedKeyboard();

  // Offset saat keyboard TIDAK aktif → pakai safe area inset agar tidak mepet bawah
  const bottomWhenClosed = insets.bottom > 0 ? insets.bottom : 12;
  // Offset saat keyboard AKTIF → cukup padding kecil (8px) karena safe area
  // sudah "tertelan" oleh keyboard — tanpa ini terjadi double-spacing yang terlalu lebar
  const bottomWhenOpen = 8;

  const animatedButtonStyle = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboard.height.value > 0;
    return {
      bottom: isKeyboardOpen
        ? keyboard.height.value + bottomWhenOpen // keyboard aktif: tipis saja
        : bottomWhenClosed, // keyboard tutup: pakai safe area
    };
  });
  return (
    <SafeAreaView edges={edges} className="relative" style={[styles.container, style]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={swipeEnabled}
            onMomentumScrollEnd={(event) => {
              const newStep = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentStep(newStep);
            }}>
            {steps.map((step, index) => renderStep(step, index))}
          </ScrollView>
        </Animated.View>
      </GestureDetector>

      {/* Progress Dots */}

      {/* Skip Button */}
      {showSkip && !isLastStep && (
        <View style={styles.skipContainer}>
          <Button
            variant="ghost"
            size={'sm'}
            className="rounded-full bg-black/50 px-4 dark:bg-accent/50 dark:text-white"
            onPress={handleSkip}>
            <Text className="text-sm text-white">{skipButtonText}</Text>
          </Button>
        </View>
      )}
      <View className="absolute left-4 top-[60px] flex-row items-center gap-7">
        <Text className="text-center font-cinzel_semibold text-2xl tracking-tighter text-white">
          Saraya
        </Text>
      </View>
      {/* Navigation Buttons */}
      <Animated.View
        className={cn('absolute left-0 right-0 px-5 pb-4')}
        style={[
          {
            bottom: insets.bottom > 0 ? insets.bottom : 12,
          },
          animatedButtonStyle,
        ]}>
        {renderProgressDots()}
        {withBackButton ? (
          <View className="w-full flex-row gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                size={'lg'}
                onPress={handleBack}
                className={cn('h-fit w-full py-3', 'flex-1')}>
                <Text>{backButtonText}</Text>
              </Button>
            )}

            <Button
              variant="default"
              size={'lg'}
              onPress={handleNext}
              className={cn('h-fit w-full py-3', isFirstStep ? 'flex-1' : 'flex-[2]')}>
              <Text className="text-lg font-bold">
                {isLastStep ? primaryButtonText : nextButtonText}
              </Text>
            </Button>
          </View>
        ) : (
          <Button variant="default" size={'lg'} className="h-fit w-full py-3" onPress={handleNext}>
            <Text className="text-lg font-bold">
              {isLastStep ? primaryButtonText : nextButtonText}
            </Text>
          </Button>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxWidth: 800,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    minHeight: 700,
  },

  customContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    zIndex: 1,
  },
  buttonContainer: {
    width: '100%',

    flexDirection: 'row',
    paddingHorizontal: 24,

    gap: 12,
  },
  fullWidthButton: {
    flex: 1,
  },
});

// Onboarding Hook for managing state
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  const completeOnboarding = async () => {
    try {
      // In a real app, you'd save this to AsyncStorage or similar
      setHasCompletedOnboarding(true);
      console.log('Onboarding completed and saved');
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    setCurrentOnboardingStep(0);
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  return {
    hasCompletedOnboarding,
    currentOnboardingStep,
    setCurrentOnboardingStep,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
  };
}
