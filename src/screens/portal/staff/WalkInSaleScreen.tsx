import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft, Minus, Plus } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SafeAreaView } from '../../../components/ui/safe-area-view'
import { Icon } from '../../../components/ui/icon'
import { Text } from '../../../components/ui/text'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import FeeBreakdown from '../../../components/orders/FeeBreakdown'
import OrderItemsList from '../../../components/orders/OrderItemsList'
import { formatPrice } from '../../../lib/dateUtils'
import { computeFee } from '../../../lib/feeUtils'
import { END_POINTS } from '../../../lib/endpoints'
import { secureApi, type ApiEnvelope } from '../../../services/api'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createWalkInOrder } from '../../../store/slices/ordersSlice'
import {
  selectCurrencyCode,
  selectLocale,
  selectPlatformFee,
  selectProcessingFeeDefault,
  selectTaxPercent,
} from '../../../store/slices/settingsSlice'
import type { StaffStackScreenProps } from '../../../navigation/types'
import type { StaffTicketTier } from '../../../types/events'
import type { PaymentMethod, WalkInOrderDetail } from '../../../types/orders'

type Props = StaffStackScreenProps<'WalkInSale'>

const DOOR_PAYMENT_METHODS: Exclude<PaymentMethod, 'online'>[] = ['cash', 'card_pos']
const PAYMENT_METHOD_LABELS: Record<Exclude<PaymentMethod, 'online'>, string> = {
  cash: 'Cash',
  card_pos: 'Card',
}

const buyerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
})
type BuyerFormValues = z.infer<typeof buyerSchema>

function isSellable(tier: StaffTicketTier): boolean {
  if (!tier.is_active || tier.quantity === 0) return false
  const now = new Date()
  if (tier.sale_start && new Date(tier.sale_start) > now) return false
  if (tier.sale_end && new Date(tier.sale_end) < now) return false
  return true
}

export default function WalkInSaleScreen({ navigation, route }: Props) {
  const { eventId, eventName } = route.params
  const dispatch = useAppDispatch()
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)
  const platformFee = useAppSelector(selectPlatformFee)
  const processingFeeDefault = useAppSelector(selectProcessingFeeDefault)
  const taxPercent = useAppSelector(selectTaxPercent)

  const [tiers, setTiers] = useState<StaffTicketTier[]>([])
  const [loadingTiers, setLoadingTiers] = useState(true)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  // Remembered across "Sell Another" for the rest of this screen's lifetime.
  const [paymentMethod, setPaymentMethod] = useState<Exclude<PaymentMethod, 'online'>>('cash')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<WalkInOrderDetail | null>(null)

  const {
    control,
    handleSubmit,
    reset: resetBuyerForm,
    formState: { errors },
  } = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: { email: '', phone: '' },
  })

  useEffect(() => {
    async function fetchTiers() {
      setLoadingTiers(true)
      try {
        const res = await secureApi.get<ApiEnvelope<StaffTicketTier[]>>(END_POINTS.EVENT_TIERS(eventId))
        setTiers(res.data.data)
      } finally {
        setLoadingTiers(false)
      }
    }
    fetchTiers()
  }, [eventId])

  function changeQty(tierId: number, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[tierId] ?? 0
      const next = Math.min(Math.max(current + delta, 0), max)
      return { ...prev, [tierId]: next }
    })
  }

  const totalQty = Object.values(quantities).reduce((s, q) => s + q, 0)
  const subtotal = tiers.reduce((s, t) => s + (quantities[t.id] ?? 0) * parseFloat(t.price), 0)
  const platformFeeAmount = computeFee(platformFee, subtotal)
  const processingFeeAmount = computeFee(processingFeeDefault, subtotal)
  const taxAmount = computeFee({ type: 'percent', value: taxPercent }, subtotal)
  const totalAmount = subtotal + platformFeeAmount + processingFeeAmount + taxAmount
  const canSubmit = totalQty > 0

  async function onSubmit(values: BuyerFormValues) {
    const items = tiers
      .filter((t) => (quantities[t.id] ?? 0) > 0)
      .map((t) => ({ ticket_tier: t.id, quantity: quantities[t.id] }))

    setIsSubmitting(true)
    try {
      const order = await dispatch(
        createWalkInOrder({
          eventId,
          items,
          customer_email: values.email.trim(),
          customer_phone: values.phone?.trim() || undefined,
          payment_method: paymentMethod,
        }),
      ).unwrap()
      setCompletedOrder(order)
    } catch {
      // secureApi's response interceptor already toasts the error
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSellAnother() {
    setCompletedOrder(null)
    setQuantities({})
    resetBuyerForm({ email: '', phone: '' })
  }

  if (completedOrder) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 py-6 gap-6" className="flex-1">
          <View className="items-center gap-2 py-4">
            <Text variant="h2" className="text-center">
              Sale Complete
            </Text>
            <Text className="text-muted-foreground text-sm text-center">
              {eventName} · Order #{completedOrder.id}
            </Text>
            <Text className="text-muted-foreground text-xs text-center">
              Emailed to {completedOrder.customer_email}
            </Text>
          </View>

          <OrderItemsList
            items={completedOrder.items}
            eventId={completedOrder.event}
            currencyCode={currencyCode}
            locale={locale}
          />

          <FeeBreakdown
            subtotal={parseFloat(completedOrder.subtotal)}
            discount={parseFloat(completedOrder.discount_amount)}
            platformFee={parseFloat(completedOrder.platform_fee_amount)}
            processingFee={parseFloat(completedOrder.processing_fee_amount)}
            tax={parseFloat(completedOrder.tax_amount)}
            total={parseFloat(completedOrder.total_amount)}
            currencyCode={currencyCode}
            locale={locale}
          />
        </ScrollView>

        <View className="border-t border-border px-4 py-3 gap-2">
          <Button onPress={handleSellAnother}>
            <Text>Sell Another</Text>
          </Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            <Text>Done</Text>
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          Sell Walk-In Ticket
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-4 py-4 gap-6" className="flex-1">
        <Text className="text-muted-foreground text-sm">{eventName}</Text>

        <View className="gap-3">
          {loadingTiers ? (
            <Text className="text-muted-foreground text-sm">Loading ticket tiers…</Text>
          ) : tiers.length === 0 ? (
            <Text className="text-muted-foreground text-sm">No ticket tiers set up for this event yet.</Text>
          ) : (
            tiers.map((tier) => {
              const qty = quantities[tier.id] ?? 0
              const sellable = isSellable(tier)
              return (
                <View
                  key={tier.id}
                  className="flex-row items-center justify-between rounded-xl border border-border/50 px-4 py-3"
                >
                  <View className="flex-1 min-w-0">
                    <Text className="font-medium text-sm">
                      {tier.name}
                      {!sellable && (
                        <Text className="text-muted-foreground text-xs uppercase tracking-wide">
                          {'  '}
                          {tier.quantity === 0 ? 'Sold Out' : 'Not On Sale'}
                        </Text>
                      )}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {formatPrice(tier.price, currencyCode, locale)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() => changeQty(tier.id, -1, tier.max_per_person)}
                      disabled={qty === 0}
                      className={`size-8 rounded-full border border-border items-center justify-center ${qty === 0 ? 'opacity-30' : ''}`}
                    >
                      <Icon as={Minus} size={14} />
                    </Pressable>
                    <Text className="w-5 text-center font-semibold">{qty}</Text>
                    <Pressable
                      onPress={() => changeQty(tier.id, 1, tier.max_per_person)}
                      disabled={!sellable || qty >= tier.max_per_person}
                      className={`size-8 rounded-full border border-border items-center justify-center ${!sellable || qty >= tier.max_per_person ? 'opacity-30' : ''}`}
                    >
                      <Icon as={Plus} size={14} />
                    </Pressable>
                  </View>
                </View>
              )
            })
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Buyer Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="buyer@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
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
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="+27…"
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Payment Method</Text>
          <View className="flex-row gap-2">
            {DOOR_PAYMENT_METHODS.map((method) => (
              <Pressable
                key={method}
                onPress={() => setPaymentMethod(method)}
                className={`flex-1 h-10 rounded-md items-center justify-center border ${
                  paymentMethod === method ? 'bg-brand border-brand' : 'border-border'
                }`}
              >
                <Text className={paymentMethod === method ? 'text-background font-medium' : 'text-muted-foreground'}>
                  {PAYMENT_METHOD_LABELS[method]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {totalQty > 0 && (
          <FeeBreakdown
            subtotal={subtotal}
            platformFee={platformFeeAmount}
            processingFee={processingFeeAmount}
            tax={taxAmount}
            total={totalAmount}
            currencyCode={currencyCode}
            locale={locale}
          />
        )}
      </ScrollView>

      <View className="border-t border-border px-4 py-3">
        <Button onPress={handleSubmit(onSubmit)} disabled={!canSubmit || isSubmitting}>
          <Text>
            {isSubmitting
              ? 'Completing Sale…'
              : canSubmit
                ? `Complete Sale — ${formatPrice(totalAmount, currencyCode, locale)}`
                : 'Select tickets to sell'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
