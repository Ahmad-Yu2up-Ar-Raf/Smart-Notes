import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import { ToastProvider } from '../ui/fragments/shadcn-ui/toast';
type componentProps = {
  children: React.ReactNode;
};

export default function Provider({ children }: componentProps) {
  const { colorScheme } = useColorScheme();
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <GestureHandlerRootView>
          <ToastProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            {children}
          </ToastProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ClerkProvider>
  );
}
