import React from 'react'
import { View, useWindowDimensions } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Text } from '../ui/text'
import { formatPrice } from '../../lib/dateUtils'
import { buildQrPayload } from '../../lib/qrPayload'
import type { OrderItem, TicketStatus } from '../../types/orders'

const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  valid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  used: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface Props {
  items: OrderItem[]
  eventId: number
  currencyCode: string
  locale: string
}

export default function OrderItemsList({ items, eventId, currencyCode, locale }: Props) {
  const { width } = useWindowDimensions()
  const qrSize = Math.min(width - 96, 300)

  return (
    <>
      {items.map((item) => (
        <View key={item.id} className="gap-3">
          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            {item.tier_name} · {item.quantity} × {formatPrice(item.unit_price, currencyCode, locale)}
          </Text>
          <View className="gap-4">
            {item.tickets.map((ticket, idx) => (
              <View key={ticket.id} className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
                <QRCode value={buildQrPayload(ticket.qr_code, eventId)} size={qrSize} />
                <Text className="text-foreground text-sm font-medium">Ticket {idx + 1}</Text>
                <View className={`px-2.5 py-1 rounded-full ${TICKET_STATUS_STYLES[ticket.status]}`}>
                  <Text className="text-xs font-medium">{ticket.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  )
}
