import { useSignIn as useClerkSignIn } from '@clerk/clerk-expo';
import { useToast } from '@/components/ui/fragments/shadcn-ui/toast';
import { router } from 'expo-router';
import { useFormValidation, validationRules } from '@/lib/validations/auth-validation';
import * as React from 'react';
import { TextInput } from 'react-native';

interface SignInFormData extends Record<string, string> {
  email: string;
  password: string;
}

export function useSignIn() {
  const { signIn, setActive, isLoaded } = useClerkSignIn();
  const { success, error: showError } = useToast();

  const emailRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);

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
  } = useFormValidation<SignInFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      if (!isLoaded) return;

      try {
        const signInAttempt = await signIn.create({
          identifier: values.email,
          password: values.password,
        });

        // ✅ Handle successful sign-in (no 2FA)
        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
          success('Welcome back!', 'You have successfully signed in.');
          return;
        }

        // ✅ Handle 2FA requirement
        if (signInAttempt.status === 'needs_second_factor') {
          // Store signIn object in a way that verify-2fa screen can access it
          // For now, we'll just show an error
          showError(
            '2FA Required',
            'Two-factor authentication is required. Please contact support to disable 2FA.'
          );

          // TODO: If you want to support 2FA, uncomment this and create verify-2fa screen:
          // const emailCodeFactor = signInAttempt.supportedSecondFactors.find(
          //   (factor) => factor.strategy === 'email_code'
          // );
          // if (emailCodeFactor) {
          //   await signInAttempt.prepareSecondFactor({
          //     strategy: 'email_code',
          //     emailAddressId: emailCodeFactor.emailAddressId,
          //   });
          //   router.push('/(auth)/verify-2fa');
          // }
          return;
        }

        // ✅ Handle first-time sign-in (needs identifier verification)
        if (signInAttempt.status === 'needs_first_factor') {
          showError('Verification Required', 'Please verify your email address first.');
          return;
        }

        // Unexpected status
        console.error('Unexpected sign-in status:', JSON.stringify(signInAttempt, null, 2));
        showError('Sign In Error', 'An unexpected error occurred. Please try again.');
      } catch (err) {
        if (err instanceof Error) {
          const isEmailMessage =
            err.message.toLowerCase().includes('identifier') ||
            err.message.toLowerCase().includes('email');

          if (isEmailMessage) {
            setFieldError('email', err.message);
          } else {
            setFieldError('password', err.message);
          }
          showError('Sign In Failed', err.message);
          return;
        }
        console.error(JSON.stringify(err, null, 2));
        showError('Error', 'An unexpected error occurred. Please try again.');
      }
    },
  });

  // Register fields with validation rules
  React.useEffect(() => {
    registerField({ name: 'email', rules: validationRules.email, ref: emailRef });
    registerField({ name: 'password', rules: validationRules.password, ref: passwordRef });
  }, [registerField]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    emailRef,
    passwordRef,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
