import * as React from 'react';

import AuthLayout from '../../layout/auth-layout';
import { useResetPassword } from '@/hooks/form/auth/Useresetpassword';
import {
  GroupedInput,
  GroupedInputItem,
} from '@/components/ui/fragments/custom-ui/form/input-form';

export function ResetPasswordForm() {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    passwordRef,
    codeRef,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useResetPassword();
  return (
    <AuthLayout
      onPress={handleSubmit}
      textButton="Reset"
      signInGoogleButton={false}
      title="Reset Password Anda"
      loading={isSubmitting}
      className="mb-4"
      description=" Masukkan password baru Anda dan kode verifikasi yang telah kami kirim ke email Anda">
      <GroupedInput>
        <GroupedInputItem
          disabled={isSubmitting}
          ref={passwordRef}
          label="New Password"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => codeRef.current?.focus()}
        />
        <GroupedInputItem
          disabled={isSubmitting}
          ref={codeRef}
          label="Verification Code"
          placeholder="123456"
          value={formData.code}
          onChangeText={handleChange('code')}
          onBlur={handleBlur('code')}
          error={touched.code ? errors.code : undefined}
          keyboardType="numeric"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          returnKeyType="send"
          maxLength={6}
          onSubmitEditing={handleSubmit}
        />
      </GroupedInput>
    </AuthLayout>
  );
}
