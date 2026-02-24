import { Alert, AlertDescription, AlertTitle } from './alert';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Info, X, AlertTriangle, type LucideIcon } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
  index: number;
  totalToasts: number;
}

const MAX_TOASTS = 3;
const TOAST_OFFSET = 8;
const TOAST_SCALE_FACTOR = 0.05;

const SPRING_CONFIG = {
  damping: 25,
  stiffness: 350,
  mass: 0.4,
};

const ENTER_TIMING = {
  duration: 400,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

const EXIT_TIMING = {
  duration: 300,
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

const VARIANT_ICONS: Record<ToastVariant, LucideIcon> = {
  default: Info,
  success: Check,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const VARIANT_TO_ALERT: Record<ToastVariant, 'default' | 'destructive'> = {
  default: 'default',
  success: 'default',
  error: 'destructive',
  warning: 'default',
  info: 'default',
};

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  onDismiss,
  index,
  totalToasts,
  action,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  // Entrance animation
  useEffect(() => {
    translateY.value = withSpring(0, SPRING_CONFIG);
    opacity.value = withTiming(1, ENTER_TIMING);
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  const getIcon = (): LucideIcon => VARIANT_ICONS[variant];
  const getAlertVariant = (): 'default' | 'destructive' => VARIANT_TO_ALERT[variant];

  const getIconClassName = (): string => {
    switch (variant) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-orange-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActionButtonClasses = (): string => {
    switch (variant) {
      case 'error':
        return 'bg-destructive';
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-primary';
    }
  };

  // Smooth exit animation
  const dismiss = useCallback(() => {
    const onDismissAction = () => {
      'worklet';
      runOnJS(onDismiss)(id);
    };

    opacity.value = withTiming(0, EXIT_TIMING);
    scale.value = withTiming(0.85, EXIT_TIMING);
    translateY.value = withTiming(-40, EXIT_TIMING, (finished) => {
      if (finished) {
        onDismissAction();
      }
    });
  }, [id, onDismiss, opacity, scale, translateY]);

  // Swipe gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      const swipeProgress = Math.abs(event.translationX) / 300;
      opacity.value = Math.max(0.3, 1 - swipeProgress * 0.7);
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      if (Math.abs(translationX) > 80 || Math.abs(velocityX) > 600) {
        const onDismissAction = () => {
          'worklet';
          runOnJS(onDismiss)(id);
        };

        const direction = translationX > 0 ? 400 : -400;
        translateX.value = withTiming(direction, EXIT_TIMING);
        opacity.value = withTiming(0, EXIT_TIMING, (finished) => {
          if (finished) {
            onDismissAction();
          }
        });
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        opacity.value = withTiming(1, { duration: 200 });
      }
    });

  // Stacking calculation
  const stackOffset = index * TOAST_OFFSET;
  const stackScale = 1 - index * TOAST_SCALE_FACTOR;
  const stackOpacity = index === 0 ? 1 : 0.8;

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value * stackOpacity,
      transform: [
        { translateY: translateY.value + stackOffset },
        { translateX: translateX.value },
        { scale: scale.value * stackScale },
      ],
    };
  });

  const statusBarHeight = Platform.OS === 'ios' ? 59 : 20;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="absolute left-4 right-4"
        style={[
          animatedContainerStyle,
          {
            top: statusBarHeight,
            zIndex: 1000 - index,
          },
        ]}>
        <Alert
          icon={getIcon()}
          variant={getAlertVariant()}
          iconClassName={getIconClassName()}
          className="shadow-lg shadow-black/20">
          <View className="flex-1 flex-row items-start justify-between">
            <View className="flex-1 pr-2">
              {title && <AlertTitle>{title}</AlertTitle>}
              {description && <AlertDescription>{description}</AlertDescription>}
            </View>

            <View className="flex-row items-center gap-2">
              {action && (
                <TouchableOpacity
                  onPress={() => {
                    action.onPress();
                    dismiss();
                  }}
                  className={cn(
                    'rounded-lg px-3 py-1.5 active:opacity-70',
                    getActionButtonClasses()
                  )}>
                  <AlertTitle className="mb-0 text-xs text-primary-foreground">
                    {action.label}
                  </AlertTitle>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={dismiss}
                className="rounded-lg p-1 active:opacity-70"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={16} className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
          </View>
        </Alert>
      </Animated.View>
    </GestureDetector>
  );
}

interface ToastContextType {
  toast: (toast: Omit<ToastData, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = MAX_TOASTS }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  // Fix: Use number instead of NodeJS.Timeout for React Native
  const timersRef = React.useRef<Map<string, number>>(new Map());

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastData, 'id'>) => {
      const id = generateId();
      const newToast: ToastData = {
        ...toastData,
        id,
        duration: toastData.duration ?? 4000,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto dismiss
      if (newToast.duration && newToast.duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, newToast.duration);

        timersRef.current.set(id, timer as unknown as number);
      }
    },
    [maxToasts, dismissToast]
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const createVariantToast = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      addToast({
        title,
        description,
        variant,
      });
    },
    [addToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, description) => createVariantToast('success', title, description),
    error: (title, description) => createVariantToast('error', title, description),
    warning: (title, description) => createVariantToast('warning', title, description),
    info: (title, description) => createVariantToast('info', title, description),
    dismiss: dismissToast,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <GestureHandlerRootView className="flex-1">
        {children}
        <View className="pointer-events-box-none absolute left-0 right-0 top-4 z-[1000]">
          {toasts.map((toast, index) => (
            <Toast
              key={toast.id}
              {...toast}
              index={index}
              totalToasts={toasts.length}
              onDismiss={dismissToast}
            />
          ))}
        </View>
      </GestureHandlerRootView>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}