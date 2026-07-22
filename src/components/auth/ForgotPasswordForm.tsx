import * as React from 'react'
import { useState } from 'react'
import { View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { AuthStackParamList } from '../../navigation/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Text } from '../ui/text'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>>()
  const [submitted, setSubmitted] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await publicApi.post(END_POINTS.FORGOT_PASSWORD, values)
      setSubmitted(true)
    } catch {
      // publicApi's response interceptor already toasts the error
    }
  }

  return (
    <View className="w-full gap-8 rounded-2xl border border-border p-6">
      <View className="gap-2 border-b border-border pb-6">
        <Text variant="h2">Forgot password?</Text>
        <Text variant="muted">Enter your email and we'll send you a link to reset your password.</Text>
      </View>

      {submitted ? (
        <View className="gap-1.5 rounded-xl border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-950">
          <Text className="text-sm text-green-700 dark:text-green-400">
            If an account exists with that email, we've sent a password reset link. Check your inbox.
          </Text>
        </View>
      ) : (
        <View className="gap-5">
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isSubmitting}
                  invalid={!!errors.email}
                />
              )}
            />
            {errors.email && <Text className="text-sm text-destructive">{errors.email.message}</Text>}
          </View>

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text>{isSubmitting ? 'Sending…' : 'Send reset link'}</Text>
          </Button>
        </View>
      )}

      <Text className="text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Text className="font-medium text-brand" onPress={() => navigation.navigate('Login')}>
          Log in
        </Text>
      </Text>
    </View>
  )
}
