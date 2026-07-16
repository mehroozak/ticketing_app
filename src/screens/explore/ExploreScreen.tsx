import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Text } from '../../components/ui/text'
import EventFilters, { EMPTY_FILTERS, type FilterValues } from '../../components/explore/EventFilters'
import PublicEventCard from '../../components/explore/PublicEventCard'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { useAppSelector } from '../../store/hooks'
import { selectLookupsByType } from '../../store/slices/lookupsSlice'
import { selectActiveCities } from '../../store/slices/settingsSlice'
import type { ExploreStackScreenProps } from '../../navigation/types'
import type { PublicEvent, PublicEventListResponse } from '../../types/events'

function buildUrl(filters: FilterValues): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.city) params.set('city', filters.city)
  if (filters.category) params.set('category', filters.category)
  if (filters.start_date) params.set('start_date', filters.start_date)
  if (filters.end_date) params.set('end_date', filters.end_date)
  return `${END_POINTS.PUBLIC_EVENTS}?${params.toString()}`
}

export default function ExploreScreen({ navigation }: ExploreStackScreenProps<'ExploreScreen'>) {
  const cities = useAppSelector(selectActiveCities)
  const categories = useAppSelector(selectLookupsByType('event_category'))

  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getEvents = useCallback(async (url: string, append = false) => {
    try {
      const res = await publicApi.get<{ data: PublicEventListResponse }>(url)
      const { results, next } = res.data.data
      setEvents((prev) => (append ? [...prev, ...results] : results))
      setNextUrl(next)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setEvents([])

    if (searchDebounce.current) clearTimeout(searchDebounce.current)

    searchDebounce.current = setTimeout(
      () => {
        getEvents(buildUrl(filters))
      },
      filters.search ? 400 : 0,
    )

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
    }
  }, [filters, getEvents])

  const loadMore = () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    getEvents(nextUrl, true)
  }

  const handleRefresh = () => {
    setLoading(true)
    getEvents(buildUrl(filters))
  }

  const handlePress = (event: PublicEvent) => {
    navigation.navigate('EventDetail', { id: String(event.id) })
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-4 bg-background mb-4">
          <EventFilters values={filters} cities={cities} categories={categories} onChange={setFilters} />
        </View>

        <FlatList
          className="flex-1"
          data={events}
          keyExtractor={(event) => String(event.id)}
          contentContainerClassName="px-4 pb-6 gap-3"
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
          renderItem={({ item }) => <PublicEventCard event={item} onPress={() => handlePress(item)} />}
          ListEmptyComponent={
            loading ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator />
              </View>
            ) : (
              <View className="items-center justify-center py-16 px-6">
                <Text className="text-foreground text-base font-semibold">No events found</Text>
                <Text className="text-muted-foreground text-sm mt-1 text-center">
                  Try adjusting your filters.
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  )
}
