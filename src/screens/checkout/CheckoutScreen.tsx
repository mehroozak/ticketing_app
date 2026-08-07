import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import FeeBreakdown from '../../components/orders/FeeBreakdown'
import { formatPrice } from '../../lib/dateUtils'
import { computeFee } from '../../lib/feeUtils'
import { END_POINTS } from '../../lib/endpoints'
import { secureApi } from '../../services/api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createOrder } from '../../store/slices/ordersSlice'
import {
  selectCurrencyCode,
  selectLocale,
  selectPlatformFee,
  selectProcessingFeeDefault,
  selectTaxPercent,
} from '../../store/slices/settingsSlice'
import type { ExploreStackScreenProps } from '../../navigation/types'

type Props = ExploreStackScreenProps<'Checkout'>

export default function CheckoutScreen({ navigation, route }: Props) {
  const { eventId, eventName, items } = route.params
  const dispatch = useAppDispatch()
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)
  const platformFee = useAppSelector(selectPlatformFee)
  const processingFeeDefault = useAppSelector(selectProcessingFeeDefault)
  const taxPercent = useAppSelector(selectTaxPercent)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null)
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const discountAmount = appliedVoucher?.discountAmount ?? 0
  const discountedSubtotal = subtotal - discountAmount
  const platformFeeAmount = computeFee(platformFee, subtotal)
  const processingFeeAmount = computeFee(processingFeeDefault, discountedSubtotal)
  const taxAmount = computeFee({ type: 'percent', value: taxPercent }, discountedSubtotal)
  const totalAmount = discountedSubtotal + platformFeeAmount + processingFeeAmount + taxAmount

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return
    setApplyingVoucher(true)
    try {
      const res = await secureApi.post<{ data: { discount_amount: string } }>(END_POINTS.VOUCHER_VALIDATE, {
        code: voucherCode,
        event: Number(eventId),
        items: items.map((i) => ({ ticket_tier: i.tierId, quantity: i.quantity })),
      })
      setAppliedVoucher({ code: voucherCode.toUpperCase(), discountAmount: parseFloat(res.data.data.discount_amount) })
    } finally {
      setApplyingVoucher(false)
    }
  }

  function handleRemoveVoucher() {
    setAppliedVoucher(null)
    setVoucherCode('')
  }

  async function handleConfirm() {
    setIsSubmitting(true)
    try {
      const order = await dispatch(
        createOrder({
          event: Number(eventId),
          items: items.map((i) => ({ ticket_tier: i.tierId, quantity: i.quantity })),
          voucher_code: appliedVoucher?.code,
        }),
      ).unwrap()
      navigation.replace('Confirmation', { orderId: String(order.id) })
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          Checkout
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-4 py-4 gap-6" className="flex-1">
        <Text className="text-muted-foreground text-sm">{eventName}</Text>

        <View className="gap-3">
          {items.map((item) => (
            <View key={item.tierId} className="flex-row items-center justify-between">
              <Text className="text-foreground text-sm">
                {item.tierName} · {item.quantity} × {formatPrice(item.unitPrice, currencyCode, locale)}
              </Text>
              <Text className="text-foreground text-sm font-medium">
                {formatPrice(item.unitPrice * item.quantity, currencyCode, locale)}
              </Text>
            </View>
          ))}
        </View>

        {appliedVoucher ? (
          <View className="flex-row items-center justify-between bg-brand/10 rounded-lg px-3 py-2.5">
            <Text className="text-foreground text-sm font-medium">Voucher "{appliedVoucher.code}" applied</Text>
            <Pressable onPress={handleRemoveVoucher} hitSlop={8}>
              <Text className="text-muted-foreground text-xs uppercase tracking-wide">Remove</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Input
              placeholder="Voucher code"
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
              className="flex-1"
            />
            <Button
              variant="outline"
              onPress={handleApplyVoucher}
              disabled={applyingVoucher || !voucherCode.trim()}
            >
              <Text>{applyingVoucher ? 'Applying…' : 'Apply'}</Text>
            </Button>
          </View>
        )}

        <FeeBreakdown
          subtotal={subtotal}
          discount={discountAmount}
          platformFee={platformFeeAmount}
          processingFee={processingFeeAmount}
          tax={taxAmount}
          total={totalAmount}
          currencyCode={currencyCode}
          locale={locale}
        />
      </ScrollView>

      <View className="border-t border-border px-4 py-3">
        <Button onPress={handleConfirm} disabled={isSubmitting}>
          <Text>{isSubmitting ? 'Placing order…' : `Confirm — ${formatPrice(totalAmount, currencyCode, locale)}`}</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
