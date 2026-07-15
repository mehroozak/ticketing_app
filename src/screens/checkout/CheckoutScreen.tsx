import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import { Button } from '../../components/ui/button'
import FeeBreakdown from '../../components/orders/FeeBreakdown'
import { formatPrice } from '../../lib/dateUtils'
import { computeFee } from '../../lib/feeUtils'
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

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const platformFeeAmount = computeFee(platformFee, subtotal)
  const processingFeeAmount = computeFee(processingFeeDefault, subtotal)
  const taxAmount = computeFee({ type: 'percent', value: taxPercent }, subtotal)
  const totalAmount = subtotal + platformFeeAmount + processingFeeAmount + taxAmount

  async function handleConfirm() {
    setIsSubmitting(true)
    try {
      const order = await dispatch(
        createOrder({
          event: Number(eventId),
          items: items.map((i) => ({ ticket_tier: i.tierId, quantity: i.quantity })),
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

        <FeeBreakdown
          subtotal={subtotal}
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
