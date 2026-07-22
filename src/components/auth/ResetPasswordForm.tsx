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
import type { RootStackParamList } from '../../navigation/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Text } from '../ui/text'

const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface Props {
  uid: string
  token: string
}

export default function ResetPasswordForm({ uid, token }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [submitted, setSubmitted] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setRootError(null)
    try {
      await publicApi.post(END_POINTS.RESET_PASSWORD, { ...values, uid, token })
      setSubmitted(true)
    } catch (err: unknown) {
      setRootError((err as { message?: string })?.message ?? 'Could not reset your password. Please try again.')
    }
  }

  return (
    <View className="w-full gap-8 rounded-2xl border border-border p-6">
      <View className="gap-2 border-b border-border pb-6">
        <Text variant="h2">Reset password</Text>
        <Text variant="muted">Choose a new password for your account.</Text>
      </View>

      {submitted ? (
        <View className="gap-4">
          <View className="gap-1.5 rounded-xl border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-950">
            <Text className="text-sm text-green-700 dark:text-green-400">
              Your password has been reset successfully.
            </Text>
          </View>
          <Button onPress={() => navigation.navigate('Main', { screen: 'Portal' })}>
            <Text>Log in</Text>
          </Button>
        </View>
      ) : (
        <View className="gap-5">
          {rootError && (
            <View className="gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <Text className="text-sm text-destructive">{rootError}</Text>
            </View>
          )}

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">New password</Text>
            <Controller
              control={control}
              name="new_password"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter your new password"
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!isSubmitting}
                  invalid={!!errors.new_password}
                />
              )}
            />
            {errors.new_password && (
              <Text className="text-sm text-destructive">{errors.new_password.message}</Text>
            )}
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Confirm new password</Text>
            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Re-enter your new password"
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!isSubmitting}
                  invalid={!!errors.confirm_password}
                />
              )}
            />
            {errors.confirm_password && (
              <Text className="text-sm text-destructive">{errors.confirm_password.message}</Text>
            )}
          </View>

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text>{isSubmitting ? 'Resetting…' : 'Reset password'}</Text>
          </Button>
        </View>
      )}
    </View>
  )
}
