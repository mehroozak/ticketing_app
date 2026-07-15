import React, { useEffect } from 'react'
import { ActivityIndicator, Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from '../../../components/ui/safe-area-view'
import { Icon } from '../../../components/ui/icon'
import { Text } from '../../../components/ui/text'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchOrderDetail, selectOrderDetail, selectOrderDetailStatus } from '../../../store/slices/ordersSlice'
import { selectCurrencyCode, selectLocale } from '../../../store/slices/settingsSlice'
import { formatPrice } from '../../../lib/dateUtils'
import { buildQrPayload } from '../../../lib/qrPayload'
import type { OrdersStackScreenProps } from '../../../navigation/types'
import type { TicketStatus } from '../../../types/orders'

type Props = OrdersStackScreenProps<'OrderDetail'>

const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  valid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  used: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params
  const dispatch = useAppDispatch()
  const order = useAppSelector(selectOrderDetail(Number(orderId)))
  const status = useAppSelector(selectOrderDetailStatus)
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)
  const { width } = useWindowDimensions()
  const qrSize = Math.min(width - 96, 300)

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

          {order.items.map((item) => (
            <View key={item.id} className="gap-3">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {item.tier_name} · {item.quantity} × {formatPrice(item.unit_price, currencyCode, locale)}
              </Text>
              <View className="gap-4">
                {item.tickets.map((ticket, idx) => (
                  <View
                    key={ticket.id}
                    className="items-center gap-3 rounded-2xl border border-border bg-card p-6"
                  >
                    <QRCode value={buildQrPayload(ticket.qr_code, order.event)} size={qrSize} />
                    <Text className="text-foreground text-sm font-medium">Ticket {idx + 1}</Text>
                    <View className={`px-2.5 py-1 rounded-full ${TICKET_STATUS_STYLES[ticket.status]}`}>
                      <Text className="text-xs font-medium">{ticket.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View className="gap-1.5 border-t border-border pt-4">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground text-sm">Subtotal</Text>
              <Text className="text-foreground text-sm">{formatPrice(order.subtotal, currencyCode, locale)}</Text>
            </View>
            {platformFee > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-sm">Platform fee</Text>
                <Text className="text-foreground text-sm">
                  {formatPrice(order.platform_fee_amount, currencyCode, locale)}
                </Text>
              </View>
            )}
            {processingFee > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-sm">Processing fee</Text>
                <Text className="text-foreground text-sm">
                  {formatPrice(order.processing_fee_amount, currencyCode, locale)}
                </Text>
              </View>
            )}
            {tax > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-sm">Tax</Text>
                <Text className="text-foreground text-sm">{formatPrice(order.tax_amount, currencyCode, locale)}</Text>
              </View>
            )}
            <View className="flex-row justify-between border-t border-border/40 pt-1.5">
              <Text className="text-foreground text-sm font-semibold">Total Paid</Text>
              <Text className="text-foreground text-sm font-semibold">
                {formatPrice(order.total_amount, currencyCode, locale)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
