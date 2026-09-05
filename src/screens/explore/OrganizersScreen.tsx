import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Text } from '../../components/ui/text'
import { Input } from '../../components/ui/input'
import OrganizerCard from '../../components/explore/OrganizerCard'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { ExploreStackScreenProps } from '../../navigation/types'
import type { PublicOrganizer, PublicOrganizerListResponse } from '../../types/events'

export default function OrganizersScreen({ navigation }: ExploreStackScreenProps<'Organizers'>) {
  const [search, setSearch] = useState('')
  const [organizers, setOrganizers] = useState<PublicOrganizer[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getOrganizers = useCallback(async (url: string, append = false) => {
    try {
      const res = await publicApi.get<{ data: PublicOrganizerListResponse }>(url)
      const { results, next } = res.data.data
      setOrganizers((prev) => (append ? [...prev, ...results] : results))
      setNextUrl(next)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setOrganizers([])

    if (searchDebounce.current) clearTimeout(searchDebounce.current)

    searchDebounce.current = setTimeout(
      () => {
        getOrganizers(END_POINTS.PUBLIC_ORGANIZERS({ search }))
      },
      search ? 400 : 0,
    )

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
    }
  }, [search, getOrganizers])

  const loadMore = () => {
    if (!nextUrl || loadingMore) return
    setLoadingMore(true)
    getOrganizers(nextUrl, true)
  }

  const handleRefresh = () => {
    setLoading(true)
    getOrganizers(END_POINTS.PUBLIC_ORGANIZERS({ search }))
  }

  const handlePress = (organizer: PublicOrganizer) => {
    navigation.navigate('OrganizerProfile', { slug: organizer.slug })
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-4 pb-4 gap-3">
          <View>
            <Text variant="h2">Organizers</Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Meet the organizers behind the events on Passlay.
            </Text>
          </View>
          <Input placeholder="Search organizers..." value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          className="flex-1"
          data={organizers}
          keyExtractor={(organizer) => String(organizer.id)}
          contentContainerClassName="px-4 pb-6 gap-3"
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
          renderItem={({ item }) => <OrganizerCard organizer={item} onPress={() => handlePress(item)} />}
          ListEmptyComponent={
            loading ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator />
              </View>
            ) : (
              <View className="items-center justify-center py-16 px-6">
                <Text className="text-foreground text-base font-semibold">
                  {search ? `No organizers found for "${search}"` : 'No organizers to show yet'}
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
