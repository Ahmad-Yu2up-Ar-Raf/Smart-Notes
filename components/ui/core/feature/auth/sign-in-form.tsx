import { Button } from '@/components/ui/fragments/shadcn-ui/button';

import { Label } from '@/components/ui/fragments/shadcn-ui/label';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { Checkbox } from '@/components/ui/fragments/shadcn-ui/checkbox';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import * as React from 'react';
import { Platform, type TextInput, View } from 'react-native';

import AuthLayout from '../../layout/auth-layout';
import {
  GroupedInput,
  GroupedInputItem,
} from '@/components/ui/fragments/custom-ui/form/input-form';
import { useSignIn } from '@/hooks/form/auth/UseSignin';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { cn } from '@/lib/utils';
import { Eye, EyeOffIcon } from 'lucide-react-native';

export function SignInForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    emailRef,
    passwordRef,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useSignIn();

  const [state, setState] = React.useState({
    termsChecked: true,
    terms2Checked: true,
    toggleChecked: false,
    toggle2Checked: false,
  });

  function toggleCheckedState(key: keyof typeof state) {
    return () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setState((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };
  }
  return (
    <AuthLayout
      onPress={handleSubmit}
      loading={isSubmitting}
      title="Selamat Datang!"
      description="Masuk untuk melanjutkan"
      formType="login">
      <GroupedInput>
        <GroupedInputItem
          disabled={isSubmitting}
          ref={emailRef}
          label="Email"
          placeholder="m@example.com"
          value={formData.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <GroupedInputItem
          disabled={isSubmitting}
          ref={passwordRef}
          label="Password"
          placeholder="••••••"
          value={formData.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          secureTextEntry={!showPassword}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          rightComponent={
            <Button
              disabled={isSubmitting}
              variant="ghost"
              className="absolute right-0 bg-none"
              onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <Icon
                  className={cn(
                    errors.password && touched.password
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  )}
                  as={Eye}
                  size={22}
                />
              ) : (
                <Icon
                  className={cn(
                    errors.password && touched.password
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  )}
                  as={EyeOffIcon}
                  size={22}
                />
              )}
            </Button>
          }
        />
      </GroupedInput>
      <View className="m-0 mt-2 h-fit w-full flex-row items-center justify-between px-1">
        <View className="flex flex-row items-center gap-3">
          <Checkbox
            id="terms"
            checked={state.termsChecked}
            onCheckedChange={toggleCheckedState('termsChecked')}
          />
          <Label
            onPress={Platform.select({ native: toggleCheckedState('termsChecked') })}
            htmlFor="terms"
            className="text-muted-foreground">
            Ingat Saya
          </Label>
        </View>
        <Link asChild href={`/(auth)/forgot-password?email=${formData.email}`}>
          <Button variant="link" size="sm" className="ml-auto h-fit px-1 py-0 web:h-fit sm:h-4">
            <Text className="text-sm font-normal leading-4">Lupa password?</Text>
          </Button>
        </Link>
      </View>
    </AuthLayout>
  );
}
