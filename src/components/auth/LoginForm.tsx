import * as React from 'react'
import { View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { publicApi, type ApiEnvelope } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { AuthResponse } from '../../types/auth'
import type { AuthStackParamList } from '../../navigation/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Text } from '../ui/text'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>()
  const dispatch = useAppDispatch()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { data } = await publicApi.post<ApiEnvelope<AuthResponse>>(END_POINTS.LOGIN, values)
      dispatch(
        setCredentials({
          user: data.data.user,
          access: data.data.access,
          refresh: data.data.refresh,
          organizations: data.data.organizations,
        }),
      )
    } catch {
      // publicApi's response interceptor already toasts the error
    }
  }

  return (
    <View className="w-full gap-8 rounded-2xl border border-border p-6">
      <View className="gap-2 border-b border-border pb-6">
        <Text variant="h2">Login</Text>
        <Text variant="muted">Enter your email and password to access your account.</Text>
      </View>

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

        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Password</Text>
            {/* Not wired yet — no ForgotPassword screen exists in AuthStackParamList */}
            <Text className="text-sm font-medium text-brand">Forgot password?</Text>
          </View>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="current-password"
                editable={!isSubmitting}
                invalid={!!errors.password}
              />
            )}
          />
          {errors.password && <Text className="text-sm text-destructive">{errors.password.message}</Text>}
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text>{isSubmitting ? 'Logging in…' : 'Login'}</Text>
        </Button>

        <View className="relative flex-row items-center py-1">
          <View className="absolute inset-0 flex-row items-center">
            <View className="w-full border-t border-border" />
          </View>
          <Text className="mx-auto bg-background px-2 text-xs uppercase text-muted-foreground">or</Text>
        </View>

        {/* Placeholders — native Google/Facebook SDKs aren't installed yet */}
        <Button variant="outline" disabled>
          <Text>Continue with Google</Text>
        </Button>
        <Button variant="outline" disabled>
          <Text>Continue with Facebook</Text>
        </Button>
      </View>

      <Text className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Text className="font-medium text-brand" onPress={() => navigation.navigate('Signup')}>
          Sign up
        </Text>
      </Text>
    </View>
  )
}
