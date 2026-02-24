import { useSignIn } from '@clerk/clerk-expo';
import { useToast } from '@/components/ui/fragments/shadcn-ui/toast';
import { useFormValidation, validationRules } from '@/lib/validations/auth-validation';
import * as React from 'react';
import { TextInput } from 'react-native';

interface ResetPasswordFormData extends Record<string, string> {
  password: string;
  code: string;
}

export function useResetPassword() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { success, error: showError } = useToast();

  const passwordRef = React.useRef<TextInput | null>(null);
  const codeRef = React.useRef<TextInput | null>(null);

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
  } = useFormValidation<ResetPasswordFormData>({
    initialValues: {
      password: '',
      code: '',
    },
    onSubmit: async (values) => {
      if (!isLoaded) return;

      try {
        const result = await signIn?.attemptFirstFactor({
          strategy: 'reset_password_email_code',
          code: values.code,
          password: values.password,
        });

        if (result?.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          success('Password Reset', 'Your password has been successfully reset.');
          return;
        }

        showError('Reset Failed', 'Unable to reset password. Please try again.');
      } catch (err) {
        if (err instanceof Error) {
          const isPasswordMessage = err.message.toLowerCase().includes('password');

          if (isPasswordMessage) {
            setFieldError('password', err.message);
          } else {
            setFieldError('code', err.message);
          }
          showError('Reset Failed', err.message);
          return;
        }
        console.error(JSON.stringify(err, null, 2));
        showError('Error', 'An unexpected error occurred. Please try again.');
      }
    },
  });

  React.useEffect(() => {
    registerField({ name: 'password', rules: validationRules.password, ref: passwordRef });
    registerField({ name: 'code', rules: validationRules.code, ref: codeRef });
  }, [registerField]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    passwordRef,
    codeRef,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
