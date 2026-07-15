import React from 'react'
import { View } from 'react-native'
import { Text } from '../ui/text'
import { formatPrice } from '../../lib/dateUtils'

interface Props {
  subtotal: number
  platformFee: number
  processingFee: number
  tax: number
  total: number
  currencyCode: string
  locale: string
  totalLabel?: string
}

export default function FeeBreakdown({
  subtotal,
  platformFee,
  processingFee,
  tax,
  total,
  currencyCode,
  locale,
  totalLabel = 'Total',
}: Props) {
  return (
    <View className="gap-1.5 border-t border-border pt-4">
      <View className="flex-row justify-between">
        <Text className="text-muted-foreground text-sm">Subtotal</Text>
        <Text className="text-foreground text-sm">{formatPrice(subtotal, currencyCode, locale)}</Text>
      </View>
      {platformFee > 0 && (
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">Platform fee</Text>
          <Text className="text-foreground text-sm">{formatPrice(platformFee, currencyCode, locale)}</Text>
        </View>
      )}
      {processingFee > 0 && (
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">Processing fee</Text>
          <Text className="text-foreground text-sm">{formatPrice(processingFee, currencyCode, locale)}</Text>
        </View>
      )}
      {tax > 0 && (
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground text-sm">Tax</Text>
          <Text className="text-foreground text-sm">{formatPrice(tax, currencyCode, locale)}</Text>
        </View>
      )}
      <View className="flex-row justify-between border-t border-border/40 pt-1.5">
        <Text className="text-foreground text-sm font-semibold">{totalLabel}</Text>
        <Text className="text-foreground text-sm font-semibold">{formatPrice(total, currencyCode, locale)}</Text>
      </View>
    </View>
  )
}
