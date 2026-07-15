import React from 'react'
import { Pressable, View } from 'react-native'
import { Ticket } from 'lucide-react-native'
import { Card, CardContent } from '../ui/card'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'
import { useAppSelector } from '../../store/hooks'
import { selectCurrencyCode, selectLocale } from '../../store/slices/settingsSlice'
import { displayDateTime, formatPrice } from '../../lib/dateUtils'
import type { Order, OrderStatus } from '../../types/orders'

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface OrderCardProps {
  order: Order
  onPress: () => void
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)

  return (
    <Pressable onPress={onPress}>
      <Card className="py-0">
        <CardContent className="px-4 py-4 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-foreground text-base font-semibold flex-shrink" numberOfLines={1}>
              {order.event_name}
            </Text>
            <View className={`px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLES[order.order_status]}`}>
              <Text className="text-xs font-medium">{order.order_status}</Text>
            </View>
          </View>

          <Text className="text-muted-foreground text-sm">
            {order.event_date ? displayDateTime(order.event_date) : 'Date TBA'} · Order #{order.id}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center gap-1">
              <Icon as={Ticket} size={14} className="text-muted-foreground" />
              <Text className="text-muted-foreground text-sm">
                {order.ticket_count} ticket{order.ticket_count !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text className="text-foreground text-sm font-medium">
              {formatPrice(order.total_amount, currencyCode, locale)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}
