import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { Text } from '../../../components/ui/text'
import AssignedEventCard from '../../../components/staff/AssignedEventCard'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAssignedEvents,
  selectAssignedEvents,
  selectAssignedEventsStatus,
} from '../../../store/slices/assignedEventsSlice'
import { selectActiveOrganization } from '../../../store/slices/contextSlice'
import type { StaffStackScreenProps } from '../../../navigation/types'
import type { AssignedEvent } from '../../../types/events'

export default function AssignedEventsScreen({ navigation }: StaffStackScreenProps<'AssignedEvents'>) {
  const dispatch = useAppDispatch()
  const activeOrganization = useAppSelector(selectActiveOrganization)
  const events = useAppSelector(selectAssignedEvents)
  const status = useAppSelector(selectAssignedEventsStatus)
  const organizationId = activeOrganization?.organization.id

  const loadEvents = useCallback(() => {
    if (organizationId) dispatch(fetchAssignedEvents(organizationId))
  }, [dispatch, organizationId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handlePress = (event: AssignedEvent) => {
    navigation.navigate('EventCheckin', { eventId: String(event.id), eventName: event.name })
  }

  if (status === 'loading' && events.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'failed' && events.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-foreground text-base font-semibold">Couldn't load your events</Text>
        <Text className="text-muted-foreground text-sm mt-1 text-center">Pull down to try again.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={events}
        keyExtractor={(event) => String(event.id)}
        contentContainerClassName="p-4 gap-3"
        refreshControl={
          <RefreshControl refreshing={status === 'loading'} onRefresh={loadEvents} />
        }
        renderItem={({ item }) => <AssignedEventCard event={item} onPress={() => handlePress(item)} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-foreground text-base font-semibold">No assigned events</Text>
            <Text className="text-muted-foreground text-sm mt-1 text-center">
              You haven't been assigned as gate staff for any upcoming events.
            </Text>
          </View>
        }
      />
    </View>
  )
}
