import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import PublicEventCard from '../../components/explore/PublicEventCard'
import OrganizerStats from '../../components/explore/OrganizerStats'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { ExploreStackScreenProps } from '../../navigation/types'
import type { PublicEvent, PublicOrganizerDetail } from '../../types/events'

type Props = ExploreStackScreenProps<'OrganizerProfile'>

export default function OrganizerProfileScreen({ navigation, route }: Props) {
  const { slug } = route.params
  const [organizer, setOrganizer] = useState<PublicOrganizerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const getOrganizer = useCallback(async () => {
    try {
      const res = await publicApi.get<{ data: PublicOrganizerDetail }>(END_POINTS.PUBLIC_ORGANIZER_DETAIL(slug))
      setOrganizer(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    getOrganizer()
  }, [getOrganizer])

  const handleEventPress = (event: PublicEvent) => {
    navigation.navigate('EventDetail', { id: String(event.id) })
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          {organizer?.organization_name ?? 'Organizer'}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : !organizer ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-foreground text-base font-semibold">Couldn't load this organizer</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-4 pb-6 gap-6" className="flex-1">
          <View className="flex-row items-center gap-4 mt-4">
            {organizer.logo ? (
              <Image source={{ uri: organizer.logo }} className="size-20 rounded-2xl" resizeMode="cover" />
            ) : (
              <View className="size-20 rounded-2xl bg-muted" />
            )}
            <View className="flex-1">
              {organizer.city ? (
                <Text className="text-muted-foreground text-xs uppercase tracking-widest">{organizer.city}</Text>
              ) : null}
              {organizer.description ? (
                <Text className="text-muted-foreground text-sm mt-1" numberOfLines={3}>
                  {organizer.description}
                </Text>
              ) : null}
            </View>
          </View>

          <OrganizerStats
            eventsHosted={organizer.events_hosted}
            totalTicketsSold={organizer.total_tickets_sold}
            organizingSince={organizer.organizing_since}
          />

          {organizer.upcoming_events.length > 0 && (
            <View className="gap-3">
              <Text variant="h3">Upcoming Events</Text>
              {organizer.upcoming_events.map((event) => (
                <PublicEventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />
              ))}
            </View>
          )}

          {organizer.previous_events.length > 0 && (
            <View className="gap-3">
              <Text variant="h3">Previous Events</Text>
              {organizer.previous_events.map((event) => (
                <PublicEventCard key={event.id} event={event} onPress={() => handleEventPress(event)} isPast />
              ))}
            </View>
          )}

          {organizer.refund_policy && (
            <View className="gap-3">
              <Text variant="h3">Refund Policy</Text>
              <Text className="text-muted-foreground text-sm leading-relaxed">
                {organizer.refund_policy.policy_text}
              </Text>
              {(organizer.refund_policy.contact_email || organizer.refund_policy.contact_phone) && (
                <View className="gap-1">
                  {organizer.refund_policy.contact_email ? (
                    <Text className="text-muted-foreground text-sm">{organizer.refund_policy.contact_email}</Text>
                  ) : null}
                  {organizer.refund_policy.contact_phone ? (
                    <Text className="text-muted-foreground text-sm">{organizer.refund_policy.contact_phone}</Text>
                  ) : null}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
