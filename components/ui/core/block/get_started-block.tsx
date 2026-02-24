import { Onboarding, useOnboarding } from '@/components/ui/fragments/shadcn-ui/onboarding';

import { Redirect } from 'expo-router';

import { View } from 'react-native';
import { Input } from '../../fragments/shadcn-ui/input';

export const OnboardingPresets = {
  welcome: [
    {
      id: 'welcome',
      title: 'Sebelum Kita Mulai, Boleh Kenalan Dulu?',
      //   description: 'Kelola uangmu, bayar, dan terima dengan mudah.',
      content: (
        <>
          <Input
            className="w-full"
            textContentType="emailAddress"
            autoComplete="email"
            placeholder="Nama Lengkap"
          />
        </>
      ),
    },
    {
      id: 'features',
      title: 'Bayar & Kirim Cepat',
      description: 'Transaksi instan untuk belanja, tagihan, dan transfer.',
      content: (
        <View className="flex h-fit scale-[.55] content-center items-center justify-start overflow-hidden"></View>
      ),
    },
    {
      id: 'personalize',
      title: 'Atur Sesuai Kamu',
      description: 'Personalisasi fitur dan notifikasi sesuai kebutuhan.',
      content: (
        <View className="flex h-fit scale-[.50] content-center items-center justify-start overflow-hidden"></View>
      ),
    },
    {
      id: 'ready',
      title: 'Siap Digunakan',
      description: 'Mulai pakai DANA — aman, cepat, dan terpercaya.',
      content: (
        <View className="flex h-fit scale-[.55] content-center items-center justify-start overflow-hidden"></View>
      ),
    },
  ],
};

export default function GetStartedOnboarding() {
  const { hasCompletedOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  if (hasCompletedOnboarding) {
    return <Redirect href={'/'} />;
  }

  return (
    <>
      <Onboarding
        steps={OnboardingPresets.welcome}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        showSkip={true}
        edges={['bottom', 'left', 'right', 'top']}
        showProgress={true}
        swipeEnabled={true}
        primaryButtonText="Get Started"
        skipButtonText="Skip"
        withBackButton={true}
        nextButtonText="Next"
        backButtonText="Back"
      />
      {/* <View className="absolute z-10 h-full w-full bg-card" /> */}
    </>
  );
}
