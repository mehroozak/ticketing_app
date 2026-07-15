import React, { useEffect } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from '../../../components/ui/safe-area-view'
import { Icon } from '../../../components/ui/icon'
import { Text } from '../../../components/ui/text'
import FeeBreakdown from '../../../components/orders/FeeBreakdown'
import OrderItemsList from '../../../components/orders/OrderItemsList'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchOrderDetail, selectOrderDetail, selectOrderDetailStatus } from '../../../store/slices/ordersSlice'
import { selectCurrencyCode, selectLocale } from '../../../store/slices/settingsSlice'
import type { OrdersStackScreenProps } from '../../../navigation/types'

type Props = OrdersStackScreenProps<'OrderDetail'>

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params
  const dispatch = useAppDispatch()
  const order = useAppSelector(selectOrderDetail(Number(orderId)))
  const status = useAppSelector(selectOrderDetailStatus)
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)

  // Same drawer-header stacking pattern as EventCheckinScreen — hide it only while focused.
  useEffect(() => {
    const parent = navigation.getParent()
    parent?.setOptions({ headerShown: false })
    return () => parent?.setOptions({ headerShown: true })
  }, [navigation])

  useEffect(() => {
    dispatch(fetchOrderDetail(Number(orderId)))
  }, [dispatch, orderId])

  const platformFee = order ? parseFloat(order.platform_fee_amount) : 0
  const processingFee = order ? parseFloat(order.processing_fee_amount) : 0
  const tax = order ? parseFloat(order.tax_amount) : 0
  const subtotal = order ? parseFloat(order.subtotal) : 0
  const total = order ? parseFloat(order.total_amount) : 0

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          {order?.event_name ?? 'Order'}
        </Text>
      </View>

      {status === 'loading' && !order ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : !order ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-foreground text-base font-semibold">Couldn't load this order</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-4 py-4 gap-6">
          <Text className="text-muted-foreground text-sm">
            Order #{order.id} · {order.order_status}
          </Text>

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
      )}
    </SafeAreaView>
  )
}
