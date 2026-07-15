import * as React from 'react'
import { View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/slices/authSlice'
import { Button } from '../ui/button'
import { DatePicker } from '../ui/date-picker'
import { Input } from '../ui/input'
import { PhoneInput } from '../ui/phone-input'
import { Textarea } from '../ui/textarea'
import { Text } from '../ui/text'
import type { EnquiryType } from '../../types/enquiries'

// DatePicker's maximumDate defaults to today — event dates here are almost
// always in the future, so a far-future cap is required (same bug class as
// EventFilters' start/end date range, see feedback_display_datetime memory).
const FAR_FUTURE_DATE = new Date(new Date().getFullYear() + 5, 0, 1)

const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneNumber(val), { message: 'Enter a valid phone number' }),
  message: z.string().min(1, 'Message is required'),
  artist_name: z.string().optional(),
  event_date: z.string().optional(),
  budget: z.string().optional(),
  order_number: z.string().optional(),
})

type EnquiryFormValues = z.infer<typeof enquirySchema>

interface Props {
  enquiryType: EnquiryType
  messagePlaceholder?: string
}

export default function EnquiryForm({ enquiryType, messagePlaceholder }: Props) {
  const user = useAppSelector(selectUser)
  const [submitted, setSubmitted] = React.useState(false)

  const showArtistName = enquiryType === 'artist'
  const showEventFields = enquiryType === 'artist' || enquiryType === 'event_management'
  const showOrderNumber = enquiryType === 'contact_support'

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: user ? `${user.first_name} ${user.last_name}`.trim() : '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      message: '',
      artist_name: '',
      event_date: '',
      budget: '',
      order_number: '',
    },
  })

  const onSubmit = async (values: EnquiryFormValues) => {
    setSubmitted(false)
    try {
      await publicApi.post(END_POINTS.ENQUIRIES, {
        enquiry_type: enquiryType,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message,
        artist_name: showArtistName ? values.artist_name || undefined : undefined,
        event_date: showEventFields ? values.event_date || undefined : undefined,
        budget: showEventFields ? values.budget || undefined : undefined,
        order_number: showOrderNumber ? values.order_number || undefined : undefined,
      })
      setSubmitted(true)
      reset({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: '',
        artist_name: '',
        event_date: '',
        budget: '',
        order_number: '',
      })
    } catch {
      // publicApi's response interceptor already toasts the error
    }
  }

  return (
    <View className="w-full gap-6">
      {submitted && (
        <View className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 dark:border-green-700 dark:bg-green-950">
          <Text className="text-sm text-green-700 dark:text-green-400">
            Thanks — we've received your enquiry and will be in touch soon.
          </Text>
        </View>
      )}

      <View className="gap-5">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Your name"
                editable={!isSubmitting}
                invalid={!!errors.name}
              />
            )}
          />
          {errors.name && <Text className="text-sm text-destructive">{errors.name.message}</Text>}
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
                editable={!isSubmitting}
                invalid={!!errors.email}
              />
            )}
          />
          {errors.email && <Text className="text-sm text-destructive">{errors.email.message}</Text>}
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

        {showArtistName && (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">
              Artist <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
            </Text>
            <Controller
              control={control}
              name="artist_name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Which artist are you enquiring about?"
                  editable={!isSubmitting}
                />
              )}
            />
          </View>
        )}

        {showEventFields && (
          <>
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Event date <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
              </Text>
              <Controller
                control={control}
                name="event_date"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    disabled={isSubmitting}
                    maximumDate={FAR_FUTURE_DATE}
                  />
                )}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">
                Budget <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
              </Text>
              <Controller
                control={control}
                name="budget"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. PKR 200,000"
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>
          </>
        )}

        {showOrderNumber && (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">
              Order number <Text className="text-sm font-normal text-muted-foreground">(optional)</Text>
            </Text>
            <Controller
              control={control}
              name="order_number"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="If this is about an existing order"
                  editable={!isSubmitting}
                />
              )}
            />
          </View>
        )}

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Message</Text>
          <Controller
            control={control}
            name="message"
            render={({ field: { value, onChange, onBlur } }) => (
              <Textarea
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={messagePlaceholder ?? 'Tell us more…'}
                editable={!isSubmitting}
              />
            )}
          />
          {errors.message && <Text className="text-sm text-destructive">{errors.message.message}</Text>}
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text>{isSubmitting ? 'Sending…' : 'Send enquiry'}</Text>
        </Button>
      </View>
    </View>
  )
}
