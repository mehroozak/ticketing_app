import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Share, View } from 'react-native'
import { ArrowLeft, ChevronLeft, Share2 } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import { TabBar } from '../../components/ui/tabs'
import PublicEventCard from '../../components/explore/PublicEventCard'
import OrganizerStats from '../../components/explore/OrganizerStats'
import EventGalleryAlbumCard from '../../components/explore/EventGalleryAlbumCard'
import EventGalleryGrid from '../../components/explore/EventGalleryGrid'
import { publicApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { OrganizerProfileScreenProps } from '../../navigation/types'
import type { PublicEvent, PublicOrganizerDetail } from '../../types/events'

type Props = OrganizerProfileScreenProps

const TABS = [
  { value: 'events', label: 'Events' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'refund-policy', label: 'Refund Policy' },
]

export default function OrganizerProfileScreen({ navigation, route }: Props) {
  const { slug } = route.params
  const [organizer, setOrganizer] = useState<PublicOrganizerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')
  const [selectedAlbum, setSelectedAlbum] = useState<PublicEvent | null>(null)

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
    navigation.navigate('EventDetail', { id: event.slug })
  }

  const galleryAlbums = organizer?.previous_events.filter((event) => event.gallery.length > 0) ?? []

  const handleShare = () => {
    if (!organizer) return
    Share.share({ message: `https://passlay.com/organizers/${organizer.slug}` })
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
        {organizer && (
          <Pressable onPress={handleShare} hitSlop={12} className="absolute right-4">
            <Icon as={Share2} size={22} />
          </Pressable>
        )}
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
        <>
          <View className="px-4 gap-6 mt-4">
            <View className="flex-row items-center gap-4">
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
          </View>

          <TabBar tabs={TABS} value={activeTab} onChange={setActiveTab} />

          <ScrollView contentContainerClassName="px-4 py-6 gap-6" className="flex-1">
            {activeTab === 'events' && (
              <>
                {organizer.upcoming_events.length === 0 && organizer.previous_events.length === 0 && (
                  <Text className="text-muted-foreground text-sm">No events yet.</Text>
                )}

                {organizer.upcoming_events.length > 0 && (
                  <View className="gap-3">
                    <Text variant="h3">Upcoming Events</Text>
                    {organizer.upcoming_events.map((event) => (
                      <PublicEventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />
                    ))}
                  </View>
                )}

                {organizer.previous_events.length > 0 && (
                  <View className="gap-3 mt-6">
                    <Text variant="h3">Previous Events</Text>
                    {organizer.previous_events.map((event) => (
                      <PublicEventCard key={event.id} event={event} onPress={() => handleEventPress(event)} isPast />
                    ))}
                  </View>
                )}
              </>
            )}

            {activeTab === 'gallery' && (
              <>
                {galleryAlbums.length === 0 && (
                  <Text className="text-muted-foreground text-sm">No gallery photos yet.</Text>
                )}

                {galleryAlbums.length > 0 && selectedAlbum && (
                  <View className="gap-4">
                    <Pressable
                      onPress={() => setSelectedAlbum(null)}
                      className="flex-row items-center gap-2"
                    >
                      <Icon as={ArrowLeft} size={16} className="text-muted-foreground" />
                      <Text className="text-muted-foreground text-sm">Back to albums</Text>
                    </Pressable>
                    <Text variant="h3">{selectedAlbum.name}</Text>
                    <EventGalleryGrid images={selectedAlbum.gallery} />
                  </View>
                )}

                {galleryAlbums.length > 0 && !selectedAlbum && (
                  <View className="flex-row flex-wrap gap-3">
                    {galleryAlbums.map((event) => (
                      <EventGalleryAlbumCard
                        key={event.id}
                        name={event.name}
                        cover={event.gallery[0]}
                        photoCount={event.gallery.length}
                        onPress={() => setSelectedAlbum(event)}
                      />
                    ))}
                  </View>
                )}
              </>
            )}

            {activeTab === 'refund-policy' && (
              organizer.refund_policy ? (
                <View className="gap-3">
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
              ) : (
                <Text className="text-muted-foreground text-sm">No refund policy set.</Text>
              )
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}
