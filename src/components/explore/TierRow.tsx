import React from 'react'
import { Pressable, View } from 'react-native'
import { Minus, Plus } from 'lucide-react-native'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'
import { formatPrice } from '../../lib/dateUtils'
import type { TicketTier } from '../../types/events'

type SaleStatus = 'active' | 'upcoming' | 'ended'

function getSaleStatus(tier: TicketTier): SaleStatus {
  const now = new Date()
  if (tier.sale_start && new Date(tier.sale_start) > now) return 'upcoming'
  if (tier.sale_end && new Date(tier.sale_end) < now) return 'ended'
  return 'active'
}

interface Props {
  tier: TicketTier
  quantity: number
  isAuthenticated: boolean
  currencyCode: string
  locale: string
  onChange: (delta: number) => void
  onLoginPress: () => void
}

export default function TierRow({
  tier,
  quantity,
  isAuthenticated,
  currencyCode,
  locale,
  onChange,
  onLoginPress,
}: Props) {
  const saleStatus = getSaleStatus(tier)
  const soldOut = tier.quantity === 0
  const canBuy = !soldOut && saleStatus === 'active'

  return (
    <View className="flex-row items-center gap-4 rounded-xl border border-border/50 p-5">
      <View className="flex-1 min-w-0">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="font-semibold tracking-wide">{tier.name}</Text>
          {soldOut && (
            <View className="rounded border border-destructive/30 px-1.5 py-0.5">
              <Text className="text-destructive text-xs uppercase tracking-widest">Sold Out</Text>
            </View>
          )}
          {!soldOut && saleStatus === 'upcoming' && (
            <View className="rounded border border-border px-1.5 py-0.5">
              <Text className="text-muted-foreground text-xs uppercase tracking-widest">Coming Soon</Text>
            </View>
          )}
          {!soldOut && saleStatus === 'ended' && (
            <View className="rounded border border-border px-1.5 py-0.5">
              <Text className="text-muted-foreground text-xs uppercase tracking-widest">Sale Ended</Text>
            </View>
          )}
        </View>
        {!!tier.description && (
          <Text className="text-muted-foreground text-sm mt-1">{tier.description}</Text>
        )}
        <Text className="text-brand text-lg font-bold mt-2">
          {formatPrice(tier.price, currencyCode, locale)}
        </Text>
      </View>

      <View className="shrink-0">
        {!isAuthenticated ? (
          <Button variant="outline" size="sm" disabled={!canBuy} onPress={onLoginPress}>
            <Text>Buy Ticket</Text>
          </Button>
        ) : (
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => onChange(-1)}
              disabled={quantity === 0}
              className={`size-8 rounded-full border border-border items-center justify-center ${quantity === 0 ? 'opacity-30' : ''}`}
            >
              <Icon as={Minus} size={14} />
            </Pressable>
            <Text className="w-5 text-center font-semibold">{quantity}</Text>
            <Pressable
              onPress={() => onChange(1)}
              disabled={quantity >= tier.max_per_person || !canBuy}
              className={`size-8 rounded-full border border-border items-center justify-center ${quantity >= tier.max_per_person || !canBuy ? 'opacity-30' : ''}`}
            >
              <Icon as={Plus} size={14} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}
