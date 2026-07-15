import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native'
import { Calendar, ChevronLeft, Clock, MapPin } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import TierRow from '../../components/explore/TierRow'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { displayDate, displayTime, formatPrice } from '../../lib/dateUtils'
import { computeFee } from '../../lib/feeUtils'
import { useAppSelector } from '../../store/hooks'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import {
  selectCurrencyCode,
  selectLocale,
  selectPlatformFee,
  selectProcessingFeeDefault,
  selectTaxPercent,
} from '../../store/slices/settingsSlice'
import type { CheckoutItem, ExploreStackScreenProps } from '../../navigation/types'
import type { PublicEventDetail } from '../../types/events'

type Props = ExploreStackScreenProps<'EventDetail'>

export default function EventDetailScreen({ navigation, route }: Props) {
  const { id } = route.params
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currencyCode = useAppSelector(selectCurrencyCode)
  const locale = useAppSelector(selectLocale)
  const platformFee = useAppSelector(selectPlatformFee)
  const processingFeeDefault = useAppSelector(selectProcessingFeeDefault)
  const taxPercent = useAppSelector(selectTaxPercent)

  const [event, setEvent] = useState<PublicEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const getEvent = useCallback(async () => {
    try {
      const res = await publicApi.get<{ data: PublicEventDetail }>(END_POINTS.PUBLIC_EVENT_DETAIL(id))
      setEvent(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    getEvent()
  }, [getEvent])

  function changeQuantity(tierId: number, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[tierId] ?? 0
      const next = Math.min(Math.max(current + delta, 0), max)
      return { ...prev, [tierId]: next }
    })
  }

  function handleLoginPress() {
    navigation.navigate('Portal')
  }

  const tiers = event?.ticket_tiers ?? []
  const totalQty = Object.values(quantities).reduce((s, q) => s + q, 0)
  const subtotal = tiers.reduce((s, t) => s + (quantities[t.id] ?? 0) * parseFloat(t.price), 0)
  const platformFeeAmount = computeFee(platformFee, subtotal)
  const processingFeeAmount = computeFee(processingFeeDefault, subtotal)
  const taxAmount = computeFee({ type: 'percent', value: taxPercent }, subtotal)
  const totalAmount = subtotal + platformFeeAmount + processingFeeAmount + taxAmount

  function handleCheckout() {
    if (!event) return
    const items: CheckoutItem[] = tiers
      .filter((t) => (quantities[t.id] ?? 0) > 0)
      .map((t) => ({
        tierId: t.id,
        tierName: t.name,
        unitPrice: parseFloat(t.price),
        quantity: quantities[t.id],
      }))
    navigation.navigate('Checkout', { eventId: String(event.id), eventName: event.name, items })
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          {event?.name ?? 'Event'}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : !event ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-foreground text-base font-semibold">Couldn't load this event</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerClassName="pb-6" className="flex-1">
            {event.banners[0] && (
              <Image source={{ uri: event.banners[0] }} className="w-full aspect-[16/9]" resizeMode="cover" />
            )}

            <View className="px-4 gap-4 mt-4">
              <View>
                <Text className="text-muted-foreground text-xs uppercase tracking-widest">
                  {event.organization_name}
                </Text>
                <Text variant="h2" className="mt-1">
                  {event.name}
                </Text>
              </View>

              {event.categories.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5">
                  {event.categories.map((cat) => (
                    <View key={cat.id} className="rounded-full bg-muted px-2.5 py-1">
                      <Text className="text-muted-foreground text-xs uppercase tracking-widest">
                        {cat.display_name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="gap-2">
                {event.start_datetime && (
                  <>
                    <View className="flex-row items-center gap-2">
                      <Icon as={Calendar} size={16} className="text-muted-foreground" />
                      <Text className="text-foreground text-sm">
                        {displayDate(event.start_datetime)}
                        {event.end_datetime ? ` – ${displayDate(event.end_datetime)}` : ''}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Icon as={Clock} size={16} className="text-muted-foreground" />
                      <Text className="text-foreground text-sm">{displayTime(event.start_datetime)}</Text>
                    </View>
                  </>
                )}
                {(event.venue_name || event.city) && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={MapPin} size={16} className="text-muted-foreground" />
                    <Text className="text-foreground text-sm">
                      {[event.venue_name, event.city?.display_name].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                )}
              </View>

              {!!event.description && (
                <Text className="text-foreground text-sm leading-relaxed">{event.description}</Text>
              )}

              <View className="gap-3 mt-2">
                <Text variant="h4">Tickets</Text>
                {tiers.length === 0 ? (
                  <Text className="text-muted-foreground text-sm">No tickets available yet.</Text>
                ) : (
                  tiers.map((tier) => (
                    <TierRow
                      key={tier.id}
                      tier={tier}
                      quantity={quantities[tier.id] ?? 0}
                      isAuthenticated={isAuthenticated}
                      currencyCode={currencyCode}
                      locale={locale}
                      onChange={(delta) => changeQuantity(tier.id, delta, tier.max_per_person)}
                      onLoginPress={handleLoginPress}
                    />
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          {isAuthenticated && totalQty > 0 && (
            <View className="flex-row items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
              <View>
                <Text className="text-muted-foreground text-xs uppercase tracking-widest">Total</Text>
                <Text className="text-foreground text-xl font-bold">
                  {formatPrice(totalAmount, currencyCode, locale)}
                </Text>
              </View>
              <Pressable onPress={handleCheckout} className="rounded-md bg-brand px-8 py-3">
                <Text className="text-background text-sm font-semibold uppercase tracking-widest">
                  {`Checkout — ${totalQty} ${totalQty === 1 ? 'ticket' : 'tickets'}`}
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  )
}
