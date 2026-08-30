import React, { useEffect } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { Mail } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import { Button } from '../../components/ui/button'
import FeeBreakdown from '../../components/orders/FeeBreakdown'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearOrders, fetchOrderDetail, selectOrderDetail } from '../../store/slices/ordersSlice'
import { selectCurrencyCode, selectLocale } from '../../store/slices/settingsSlice'
import type { ExploreStackScreenProps } from '../../navigation/types'

type Props = ExploreStackScreenProps<'Confirmation'>

// No ticket display here — the IPN can take a few minutes to settle, and tickets only
// exist once it does. Point the customer at My Tickets instead of gating this screen on
// payment status.
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

  const discount = order ? parseFloat(order.discount_amount) : 0
  const platformFee = order ? parseFloat(order.platform_fee_amount) : 0
  const processingFee = order ? parseFloat(order.processing_fee_amount) : 0
  const tax = order ? parseFloat(order.tax_amount) : 0
  const subtotal = order ? parseFloat(order.subtotal) : 0
  const total = order ? parseFloat(order.total_amount) : 0

  function handleMyTickets() {
    dispatch(clearOrders())
    navigation.navigate('Portal')
  }

  function handleDone() {
    if (!order) return
    dispatch(clearOrders())
    navigation.navigate('EventDetail', { id: String(order.event), resetCart: true })
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
            <View className="items-center gap-3 py-4">
              <Icon as={Mail} size={48} className="text-brand" />
              <Text variant="h2" className="text-center">
                Payment received
              </Text>
              <Text className="text-muted-foreground text-sm text-center">
                {order.event_name} · Order #{order.id}
              </Text>
              <Text className="text-muted-foreground text-sm text-center">
                Your tickets are on their way to your email. You can also find them under My
                Tickets once they're issued.
              </Text>
            </View>

            <FeeBreakdown
              subtotal={subtotal}
              discount={discount}
              platformFee={platformFee}
              processingFee={processingFee}
              tax={tax}
              total={total}
              currencyCode={currencyCode}
              locale={locale}
              totalLabel="Total Paid"
            />
          </ScrollView>

          <View className="border-t border-border px-4 py-3 flex-row gap-3">
            <Button variant="outline" onPress={handleMyTickets} className="flex-1">
              <Text>My Tickets</Text>
            </Button>
            <Button onPress={handleDone} className="flex-1">
              <Text>Done</Text>
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}
