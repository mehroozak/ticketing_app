import React, { useEffect } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { CircleCheck } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import { Button } from '../../components/ui/button'
import FeeBreakdown from '../../components/orders/FeeBreakdown'
import OrderItemsList from '../../components/orders/OrderItemsList'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchOrderDetail, selectOrderDetail } from '../../store/slices/ordersSlice'
import { selectCurrencyCode, selectLocale } from '../../store/slices/settingsSlice'
import type { ExploreStackScreenProps } from '../../navigation/types'

type Props = ExploreStackScreenProps<'Confirmation'>

export default function ConfirmationScreen({ navigation, route }: Props) {
  const { orderId } = route.params
  const dispatch = useAppDispatch()
  const order = useAppSelector(selectOrderDetail(Number(orderId)))
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)

  // createOrder already caches the detail on success — only re-fetch if we
  // landed here without it (e.g. a stale/cold navigation).
  useEffect(() => {
    if (!order) dispatch(fetchOrderDetail(Number(orderId)))
  }, [dispatch, orderId, order])

  const platformFee = order ? parseFloat(order.platform_fee_amount) : 0
  const processingFee = order ? parseFloat(order.processing_fee_amount) : 0
  const tax = order ? parseFloat(order.tax_amount) : 0
  const subtotal = order ? parseFloat(order.subtotal) : 0
  const total = order ? parseFloat(order.total_amount) : 0

  function handleDone() {
    navigation.popToTop()
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {!order ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <ScrollView contentContainerClassName="px-4 py-6 gap-6" className="flex-1">
            <View className="items-center gap-2 py-4">
              <Icon as={CircleCheck} size={48} className="text-brand" />
              <Text variant="h2" className="text-center">
                Booking Confirmed
              </Text>
              <Text className="text-muted-foreground text-sm text-center">
                {order.event_name} · Order #{order.id}
              </Text>
            </View>

            <OrderItemsList items={order.items} eventId={order.event} currencyCode={currencyCode} locale={locale} />

            <FeeBreakdown
              subtotal={subtotal}
              platformFee={platformFee}
              processingFee={processingFee}
              tax={tax}
              total={total}
              currencyCode={currencyCode}
              locale={locale}
              totalLabel="Total Paid"
            />
          </ScrollView>

          <View className="border-t border-border px-4 py-3">
            <Button onPress={handleDone}>
              <Text>Done</Text>
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}
