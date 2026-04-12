import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';

import { ScrollView, View } from 'react-native';
import LogoApp from '../../fragments/svg/logo-app';
import { Button } from '../../fragments/shadcn-ui/button';
import { Text } from '../../fragments/shadcn-ui/text';
import ReactangleSVG from '../../fragments/svg/reactangle';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';

import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';

type WelcomeBlockProps = {
  children?: React.ReactNode;
  title?: string;
  description?: string;

  className?: string;

  formType?: 'login' | 'register' | undefined;
};
const WelcomeBlock = ({
  className,

  title = `FogyNotion`,

  description = `Organize your thoughts and ideas with SmartNotes!`,
  ...props
}: WelcomeBlockProps) => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primaryForeground;

  return (
    <>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        className="relative h-full items-center justify-center">
        <View
          className={cn('absolute -right-4 h-fit w-full scale-[1.12]')}
          style={{
            top: insets.top > 0 ? insets.top - 50 : 12,
          }}>
          <ReactangleSVG className="relative size-full" />
        </View>
        <Card className="m-auto flex h-full w-full max-w-sm content-center justify-center gap-7 border-0 bg-transparent p-2 shadow-none sm:border-border">
          <CardHeader className="relative flex w-full flex-col content-center items-center justify-center gap-8 overflow-visible p-0">
            <View
              className="flex scale-[1.2] content-center items-center justify-center overflow-visible rounded-full"
              style={{
                elevation: 100, // For Android shadow
              }}>
              <LogoApp
                className="relative m-auto size-full overflow-visible shadow-lg drop-shadow-sm"
                style={{
                  elevation: 100, // For Android shadow
                }}
              />
            </View>

            <CardTitle className="pb-2 text-center font-poppins_bold text-4xl tracking-tighter">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <CardDescription className="text-center text-base leading-relaxed tracking-widest text-muted-foreground">
              {description}
            </CardDescription>
          </CardContent>

          {/* <CardFooter className="relative mb-0 flex w-full flex-col gap-7 overflow-hidden p-0">
          <Button className="w-full">
            <Text>Mulai Sekarang</Text>
          </Button>
        </CardFooter> */}
        </Card>
        <View
          className="absolute left-0 right-0 px-5 pb-4"
          style={{
            bottom: insets.bottom > 0 ? insets.bottom + 4 : 12,
          }}>
          <Button onPress={() => router.push('/(auth)/sign-in')} variant="default" size={'lg'}>
            <Text className="font-poppins_semibold text-lg text-primary-foreground">Start</Text>
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
};

export default WelcomeBlock;
