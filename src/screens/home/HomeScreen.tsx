import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'
import { Calendar } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Text } from '../../components/ui/text'
import { Icon } from '../../components/ui/icon'
import FeaturedCarousel from '../../components/home/FeaturedCarousel'
import EventRow from '../../components/home/EventRow'
import AgentSheet from '../../components/home/AgentSheet'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { displayDateHeading } from '../../lib/dateUtils'
import type { BottomTabScreenProps_ } from '../../navigation/types'
import type { PublicEvent, UpcomingEventGroup } from '../../types/events'

export default function HomeScreen({ navigation }: BottomTabScreenProps_<'Home'>) {
  const [groups, setGroups] = useState<UpcomingEventGroup[]>([])
  const [loading, setLoading] = useState(true)

  const getUpcoming = useCallback(async () => {
    try {
      const res = await publicApi.get<{ data: UpcomingEventGroup[] }>(END_POINTS.PUBLIC_EVENTS_UPCOMING)
      setGroups(res.data.data)
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

  const [featured, ...rest] = groups

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="pb-28 gap-6"
          refreshControl={<RefreshControl refreshing={loading} onRefresh={getUpcoming} />}
        >
          {loading && groups.length === 0 ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator />
            </View>
          ) : groups.length === 0 ? (
            <View className="items-center justify-center py-16 px-6">
              <Text className="text-foreground text-base font-semibold">No upcoming events</Text>
              <Text className="text-muted-foreground text-sm mt-1 text-center">Check back soon.</Text>
            </View>
          ) : (
            <>
              {featured && <FeaturedCarousel events={featured.events} onPressEvent={handlePress} />}

              {rest.map((group) => (
                <View key={group.date} className="gap-3 px-4">
                  <View className="flex-row items-center gap-2">
                    <Icon as={Calendar} size={16} className="text-brand" />
                    <Text className="text-foreground text-base font-semibold">
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
