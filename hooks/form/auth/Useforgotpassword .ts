import { useSignIn } from '@clerk/clerk-expo';
import { useToast } from '@/components/ui/fragments/shadcn-ui/toast';
import { router, useLocalSearchParams } from 'expo-router';

import { useFormValidation, validationRules } from '@/lib/validations/auth-validation';
import * as React from 'react';
import { TextInput } from 'react-native';

interface ForgotPasswordFormData extends Record<string, string> {
  email: string;
}

export function useForgotPassword() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const { signIn, isLoaded } = useSignIn();
  const { success, error: showError } = useToast();

  const emailRef = React.useRef<TextInput | null>(null);

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    registerField,
    setFieldError,
  } = useFormValidation<ForgotPasswordFormData>({
    initialValues: {
      email: emailParam,
    },
    onSubmit: async (values) => {
      if (!isLoaded) return;

      try {
        await signIn.create({
          strategy: 'reset_password_email_code',
          identifier: values.email,
        });

        success('Code Sent', 'Please check your email for the reset code.');
        router.push(`/(auth)/reset-password?email=${values.email}`);
      } catch (err) {
        if (err instanceof Error) {
          setFieldError('email', err.message);
          showError('Reset Failed', err.message);
          return;
        }
        console.error(JSON.stringify(err, null, 2));
        showError('Error', 'An unexpected error occurred. Please try again.');
      }
    },
  });

  React.useEffect(() => {
    registerField({ name: 'email', rules: validationRules.email, ref: emailRef });
  }, [registerField]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    emailRef,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
