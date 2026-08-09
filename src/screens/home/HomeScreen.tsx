import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, RefreshControl, ScrollView, View } from 'react-native'
import { Calendar } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Text } from '../../components/ui/text'
import { Icon } from '../../components/ui/icon'
import EventRow from '../../components/home/EventRow'
import HappeningTodayCarousel from '../../components/home/HappeningTodayCarousel'
import AgentSheet from '../../components/home/AgentSheet'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { displayDateHeading } from '../../lib/dateUtils'
import type { BottomTabScreenProps_ } from '../../navigation/types'
import type { PublicEvent, UpcomingEventGroup } from '../../types/events'

export default function HomeScreen({ navigation }: BottomTabScreenProps_<'Home'>) {
  const [groups, setGroups] = useState<UpcomingEventGroup[]>([])
  const [todayEvents, setTodayEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)

  const getUpcoming = useCallback(async () => {
    try {
      const [upcomingRes, happeningRes] = await Promise.all([
        publicApi.get<{ data: UpcomingEventGroup[] }>(END_POINTS.PUBLIC_EVENTS_UPCOMING),
        publicApi.get<{ data: PublicEvent[] }>(END_POINTS.PUBLIC_EVENTS_HAPPENING),
      ])
      setGroups(upcomingRes.data.data)
      setTodayEvents(happeningRes.data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getUpcoming()
  }, [getUpcoming])

  const handlePress = (event: PublicEvent) => {
    navigation.navigate('Explore', { screen: 'EventDetail', params: { id: String(event.id) } })
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="overflow-hidden">
          <Image
            source={require('../../../assets/hero-crowd.jpg')}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/55" />
          <View className="px-4 py-10 gap-1">
            <Text className="text-2xl font-bold uppercase tracking-widest text-white" numberOfLines={1}>
              Your <Text className="text-2xl font-bold uppercase tracking-widest text-brand">Pass</Text>
            </Text>
            <Text className="text-4xl font-bold uppercase tracking-wide text-white" numberOfLines={1}>
              Your <Text className="text-4xl font-bold uppercase tracking-wide text-brand">Vibe</Text>
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-28 gap-6"
          refreshControl={<RefreshControl refreshing={loading} onRefresh={getUpcoming} />}
        >
          {loading && groups.length === 0 && todayEvents.length === 0 ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : groups.length === 0 && todayEvents.length === 0 ? (
            <View className="items-center justify-center py-16 px-6">
              <Text className="text-foreground text-base font-semibold">No upcoming events</Text>
              <Text className="text-muted-foreground text-sm mt-1 text-center">Check back soon.</Text>
            </View>
          ) : (
            <>
              {todayEvents.length > 0 && (
                <View className="gap-3">
                  <View className="flex-row items-center gap-2 px-4">
                    <Icon as={Calendar} size={20} className="text-brand" />
                    <Text className="text-foreground text-2xl font-semibold">Happening Today</Text>
                  </View>
                  <HappeningTodayCarousel events={todayEvents} onPressEvent={handlePress} />
                </View>
              )}

              {groups.map((group) => (
                <View key={group.date} className="gap-3 px-4">
                  <View className="flex-row items-center gap-2">
                    <Icon as={Calendar} size={20} className="text-brand" />
                    <Text className="text-foreground text-2xl font-semibold">
                      {displayDateHeading(group.date)}
                    </Text>
                  </View>
                  <EventRow events={group.events} onPressEvent={handlePress} />
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <AgentSheet />
    </View>
  )
}
