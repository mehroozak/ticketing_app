import * as React from 'react'
import { View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectUser, updateUser } from '../../store/slices/authSlice'
import { selectLookupsByType } from '../../store/slices/lookupsSlice'
import { secureApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { User } from '../../types/auth'
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

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
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

type ProfileFormValues = z.infer<typeof profileSchema>

interface UpdateMeResponse {
  message: string
  user: User
}

export default function ProfileForm() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      phone: user?.phone ?? '',
      gender: (user?.gender || undefined) as ProfileFormValues['gender'],
      date_of_birth: user?.date_of_birth ?? '',
      country: user?.country ?? '',
      state: user?.state ?? '',
      city: user?.city ?? '',
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

  const onSubmit = async (values: ProfileFormValues) => {
    setSaveSuccess(false)
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== '' && v !== undefined),
    )
    try {
      const { data } = await secureApi.patch<UpdateMeResponse>(END_POINTS.ME, payload)
      dispatch(updateUser(data.user))
      setSaveSuccess(true)
    } catch {
      // secureApi's response interceptor already toasts the error
    }
  }

  return (
    <View className="w-full gap-6">
      {saveSuccess && (
        <View className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 dark:border-green-700 dark:bg-green-950">
          <Text className="text-sm text-green-700 dark:text-green-400">Profile updated successfully.</Text>
        </View>
      )}

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
          <Text>{isSubmitting ? 'Saving…' : 'Save changes'}</Text>
        </Button>
      </View>
    </View>
  )
}
