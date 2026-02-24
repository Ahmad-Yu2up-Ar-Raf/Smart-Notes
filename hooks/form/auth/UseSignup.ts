import { useSignUp as useClerkSignUp } from '@clerk/clerk-expo';
import { useToast } from '@/components/ui/fragments/shadcn-ui/toast';
import { router } from 'expo-router';
import { useFormValidation, validationRules } from '@/lib/validations/auth-validation';
import * as React from 'react';
import { TextInput } from 'react-native';

interface SignUpFormData extends Record<string, string> {
  email: string;
  password: string;
}

export function useSignUp() {
  const { signUp, isLoaded } = useClerkSignUp();
  const { success, error: showError } = useToast();

  const emailRef = React.useRef<TextInput>(null!);
  const passwordRef = React.useRef<TextInput>(null!);

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
  } = useFormValidation<SignUpFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      if (!isLoaded) return;

      try {
        await signUp.create({
          emailAddress: values.email,
          password: values.password,
        });

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

        success('Verification Sent', 'Please check your email for the verification code.');
        router.push(`/(auth)/sign-up/verify-email?email=${values.email}`);
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
          showError('Sign Up Failed', err.message);
          return;
        }
        console.error(JSON.stringify(err, null, 2));
        showError('Error', 'An unexpected error occurred. Please try again.');
      }
    },
  });

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
