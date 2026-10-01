import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft, Download } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from '../../../components/ui/safe-area-view'
import { Icon } from '../../../components/ui/icon'
import { Text } from '../../../components/ui/text'
import { Button } from '../../../components/ui/button'
import OrderItemsList from '../../../components/orders/OrderItemsList'
import { downloadOrderTicketPdf } from '../../../lib/downloadTicket'
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
  const [downloading, setDownloading] = useState(false)

  // Same drawer-header stacking pattern as EventCheckinScreen — hide it only while focused.
  useEffect(() => {
    const parent = navigation.getParent()
    parent?.setOptions({ headerShown: false })
    return () => parent?.setOptions({ headerShown: true })
  }, [navigation])

  useEffect(() => {
    dispatch(fetchOrderDetail(Number(orderId)))
  }, [dispatch, orderId])

  async function handleDownload() {
    if (!order) return
    setDownloading(true)
    try {
      await downloadOrderTicketPdf(order.id)
    } catch {
      Toast.show({ type: 'error', text1: 'Could not download ticket. Please try again.' })
    } finally {
      setDownloading(false)
    }
  }

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

          <Button variant="outline" onPress={handleDownload} disabled={downloading} className="self-start">
            {downloading ? <ActivityIndicator size="small" /> : <Icon as={Download} size={18} />}
            <Text>{downloading ? 'Downloading…' : 'Download Ticket'}</Text>
          </Button>

          <OrderItemsList items={order.items} eventId={order.event} currencyCode={currencyCode} locale={locale} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
