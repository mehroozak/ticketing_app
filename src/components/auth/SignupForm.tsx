import * as React from 'react'
import { View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { selectLookupsByType } from '../../store/slices/lookupsSlice'
import { publicApi, type ApiEnvelope } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { useSocialAuth } from '../../hooks/useSocialAuth'
import type { AuthResponse } from '../../types/auth'
import type { AuthStackParamList } from '../../navigation/types'
import { Button } from '../ui/button'
import { DatePicker } from '../ui/date-picker'
import { Input } from '../ui/input'
import { PhoneInput } from '../ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Text } from '../ui/text'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

const signupSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password cannot be entirely numeric'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || isValidPhoneNumber(val), { message: 'Enter a valid phone number' }),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    date_of_birth: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Signup'>>()
  const dispatch = useAppDispatch()
  const { triggerGoogle, triggerFacebook, isGoogleLoading, isFacebookLoading } = useSocialAuth()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      gender: undefined,
      date_of_birth: '',
      country: '',
      state: '',
      city: '',
    },
  })

  const allCountries = useAppSelector(selectLookupsByType('country')).filter((c) => c.is_active)
  const allStates = useAppSelector(selectLookupsByType('state')).filter((s) => s.is_active)
  const allCities = useAppSelector(selectLookupsByType('city')).filter((c) => c.is_active)

  const watchedCountry = watch('country')

  const selectedCountryLookup = React.useMemo(
    () => allCountries.find((c) => c.display_name === watchedCountry) ?? null,
    [allCountries, watchedCountry],
  )
  const filteredStates = React.useMemo(
    () => (selectedCountryLookup ? allStates.filter((s) => s.parent === selectedCountryLookup.id) : []),
    [allStates, selectedCountryLookup],
  )
  const filteredCities = React.useMemo(
    () => (selectedCountryLookup ? allCities.filter((c) => c.parent === selectedCountryLookup.id) : []),
    [allCities, selectedCountryLookup],
  )

  const isFirstRender = React.useRef(true)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setValue('state', '')
    setValue('city', '')
  }, [watchedCountry, setValue])

  const onSubmit = async (values: SignupFormValues) => {
    try {
      // confirm_password is required by RegistrationSerializer (no `required=False`) — must be sent through
      const cleanPayload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== '' && v !== undefined),
      )
      const { data } = await publicApi.post<ApiEnvelope<AuthResponse>>(END_POINTS.REGISTER, cleanPayload)
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
        <Text variant="h2">Create account</Text>
        <Text variant="muted">Add your details to get started.</Text>
      </View>

      <View className="gap-5">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">First name</Text>
          <Controller
            control={control}
            name="first_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="First name"
                autoComplete="given-name"
                editable={!isSubmitting}
                invalid={!!errors.first_name}
              />
            )}
          />
          {errors.first_name && <Text className="text-sm text-destructive">{errors.first_name.message}</Text>}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Last name</Text>
          <Controller
            control={control}
            name="last_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Last name"
                autoComplete="family-name"
                editable={!isSubmitting}
                invalid={!!errors.last_name}
              />
            )}
          />
          {errors.last_name && <Text className="text-sm text-destructive">{errors.last_name.message}</Text>}
        </View>

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
          <Text className="text-sm font-medium text-foreground">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Min. 8 characters"
                secureTextEntry
                autoComplete="new-password"
                editable={!isSubmitting}
                invalid={!!errors.password}
              />
            )}
          />
          {errors.password && <Text className="text-sm text-destructive">{errors.password.message}</Text>}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Confirm password</Text>
          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Repeat your password"
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

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">
            Phone <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <PhoneInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                disabled={isSubmitting}
                invalid={!!errors.phone}
              />
            )}
          />
          {errors.phone && <Text className="text-sm text-destructive">{errors.phone.message}</Text>}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">
            Gender <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <Select
                value={value ? { value, label: GENDER_OPTIONS.find((g) => g.value === value)?.label ?? '' } : undefined}
                onValueChange={(option) => onChange(option?.value)}
                disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value} label={g.label} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">
            Date of birth <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { value, onChange } }) => (
              <DatePicker value={value} onChange={onChange} disabled={isSubmitting} />
            )}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">
            Country <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="country"
            render={({ field: { value, onChange } }) => (
              <Select
                value={value ? { value, label: value } : undefined}
                onValueChange={(option) => onChange(option?.value)}
                disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {allCountries.map((c) => (
                    <SelectItem key={c.id} value={c.display_name ?? c.value} label={c.display_name ?? c.value} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">
            State <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="state"
            render={({ field: { value, onChange } }) => (
              <Select
                value={value ? { value, label: value } : undefined}
                onValueChange={(option) => onChange(option?.value)}
                disabled={isSubmitting || !selectedCountryLookup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStates.map((s) => (
                    <SelectItem key={s.id} value={s.display_name ?? s.value} label={s.display_name ?? s.value} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">
            City <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange } }) => (
              <Select
                value={value ? { value, label: value } : undefined}
                onValueChange={(option) => onChange(option?.value)}
                disabled={isSubmitting || !selectedCountryLookup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCities.map((c) => (
                    <SelectItem key={c.id} value={c.display_name ?? c.value} label={c.display_name ?? c.value} />
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text>{isSubmitting ? 'Creating account…' : 'Create account'}</Text>
        </Button>

        <View className="relative flex-row items-center py-1">
          <View className="absolute inset-0 flex-row items-center">
            <View className="w-full border-t border-border" />
          </View>
          <Text className="mx-auto bg-background px-2 text-xs uppercase text-muted-foreground">or</Text>
        </View>

        <Button variant="outline" onPress={triggerGoogle} disabled={isGoogleLoading}>
          <Text>{isGoogleLoading ? 'Signing in…' : 'Continue with Google'}</Text>
        </Button>
        <Button variant="outline" onPress={triggerFacebook} disabled={isFacebookLoading}>
          <Text>{isFacebookLoading ? 'Signing in…' : 'Continue with Facebook'}</Text>
        </Button>
      </View>

      <Text className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Text className="font-medium text-brand" onPress={() => navigation.navigate('Login')}>
          Login
        </Text>
      </Text>
    </View>
  )
}
