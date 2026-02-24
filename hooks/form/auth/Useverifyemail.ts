import { useSignUp } from '@clerk/clerk-expo';
import { useToast } from '@/components/ui/fragments/shadcn-ui/toast';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

const RESEND_CODE_INTERVAL_SECONDS = 30;

export function useVerifyEmail() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { success, error: showError } = useToast();

  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);

  // 🔥 Auto-submit when 6 digits entered
  React.useEffect(() => {
    if (code.length === 6 && !isSubmitting) {
      onSubmit();
    }
  }, [code]);

  const validateCode = (): boolean => {
    if (!code) {
      setError('Verification code is required');
      return false;
    }

    if (code.length !== 6) {
      setError('Code must be 6 digits');
      return false;
    }

    if (!/^[0-9]{6}$/.test(code)) {
      setError('Code must be 6 digits');
      return false;
    }

    setError('');
    return true;
  };

  async function onSubmit() {
    if (!validateCode()) {
      showError('Validation Error', 'Please enter a valid verification code.');
      return;
    }

    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        success('Email Verified', 'Your account has been created successfully.');
        return;
      }

      console.error(JSON.stringify(signUpAttempt, null, 2));
      showError('Verification Failed', 'Unable to verify your email. Please try again.');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showError('Verification Failed', err.message);
      } else {
        console.error(JSON.stringify(err, null, 2));
        showError('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResendCode() {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      restartCountdown();
      success('Code Resent', 'A new verification code has been sent to your email.');
      setCode(''); // Clear current code
      setError(''); // Clear any errors
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showError('Resend Failed', err.message);
      } else {
        console.error(JSON.stringify(err, null, 2));
        showError('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return {
    code,
    error,
    email,
    isSubmitting,
    countdown,
    handleCodeChange,
    onSubmit,
    onResendCode,
  };
}

// Countdown hook for resend button
function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => {
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}
