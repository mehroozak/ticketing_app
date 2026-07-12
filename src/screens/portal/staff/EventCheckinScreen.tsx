import React, { useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from '../../../components/ui/safe-area-view'
import { Icon } from '../../../components/ui/icon'
import { Text } from '../../../components/ui/text'
import { Button } from '../../../components/ui/button'
import { secureApi, type ApiEnvelope } from '../../../services/api'
import { END_POINTS } from '../../../lib/endpoints'
import {
  getUnsyncedLogs,
  replaceLogsAfterSync,
  updateEventTickets,
  type CheckinTicket,
  type ServerCheckInLog,
} from '../../../lib/checkinDb'
import { useAppSelector } from '../../../store/hooks'
import { selectDeviceId } from '../../../store/slices/checkinSlice'
import type { StaffStackScreenProps } from '../../../navigation/types'

type Props = StaffStackScreenProps<'EventCheckin'>

export default function EventCheckinScreen({ navigation, route }: Props) {
  const { eventId, eventName } = route.params
  const deviceId = useAppSelector(selectDeviceId)
  const [updating, setUpdating] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // The drawer's own "Staff" header stays visible on AssignedEventsScreen (so the
  // hamburger/menu is reachable), but stacks with our own header here — hide it
  // only while this screen is focused, restore it on the way back.
  useEffect(() => {
    const parent = navigation.getParent()
    parent?.setOptions({ headerShown: false })
    return () => parent?.setOptions({ headerShown: true })
  }, [navigation])

  async function handleUpdate() {
    setUpdating(true)
    try {
      const res = await secureApi.get<ApiEnvelope<CheckinTicket[]>>(
        END_POINTS.EVENT_CHECKIN_TICKETS(eventId),
      )
      await updateEventTickets(eventId, res.data.data)
      Toast.show({ type: 'success', text1: `Updated ${res.data.data.length} ticket(s)` })
    } catch {
      // secureApi's response interceptor already toasts the error
    } finally {
      setUpdating(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const unsynced = await getUnsyncedLogs(eventId)
      const res = await secureApi.post<ApiEnvelope<ServerCheckInLog[]>>(
        END_POINTS.EVENT_CHECKIN_LOGS(eventId),
        {
          device_id: deviceId,
          logs: unsynced.map((log) => ({
            qr_code: log.qr_code,
            scanned_at: log.scanned_at,
            client_scan_id: log.client_scan_id,
          })),
        },
      )
      await replaceLogsAfterSync(eventId, res.data.data)
      Toast.show({ type: 'success', text1: `Synced ${res.data.data.length} check-in(s)` })
    } catch {
      // secureApi's response interceptor already toasts the error
    } finally {
      setSyncing(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          {eventName}
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="px-4 gap-4"
        refreshControl={<RefreshControl refreshing={updating} onRefresh={handleUpdate} />}
      >
        <Text className="text-muted-foreground text-xs text-center">
          Swipe down to update event tickets
        </Text>

        <Button onPress={handleSync} disabled={syncing}>
          <Text>{syncing ? 'Syncing…' : 'Sync'}</Text>
        </Button>

        <Button onPress={() => navigation.navigate('Scanner', { eventId, eventName })}>
          <Text>Scan</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
