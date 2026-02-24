import * as React from 'react';

import AuthLayout from '../../layout/auth-layout';
import {
  GroupedInput,
  GroupedInputItem,
} from '@/components/ui/fragments/custom-ui/form/input-form';
import { useForgotPassword } from '@/hooks/form/auth/Useforgotpassword ';

export function ForgotPasswordForm() {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    emailRef,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForgotPassword();

  return (
    <AuthLayout
      onPress={handleSubmit}
      textButton="Submit"
      signInGoogleButton={false}
      loading={isSubmitting}
      title=" lupa password Anda?"
      description=" Masukkan email Anda untuk menerima instruksi reset password">
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
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />
      </GroupedInput>
    </AuthLayout>
  );
}
