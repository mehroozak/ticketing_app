import React, { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { CodeScanner, type Barcode } from 'react-native-vision-camera-barcode-scanner'
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera'
import { ChevronLeft } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from '../../../components/ui/safe-area-view'
import { Icon } from '../../../components/ui/icon'
import { Text } from '../../../components/ui/text'
import { Button } from '../../../components/ui/button'
import { parseQrPayload } from '../../../lib/qrPayload'
import { getTicketByQrCode, recordScan, type CheckinLogEntry } from '../../../lib/checkinDb'
import { displayDateTime } from '../../../lib/dateUtils'
import type { StaffStackScreenProps } from '../../../navigation/types'

type Props = StaffStackScreenProps<'Scanner'>

type ScanResult =
  | { kind: 'granted' }
  | { kind: 'already_scanned'; entry: CheckinLogEntry }
  | { kind: 'cancelled' }
  | { kind: 'not_found' }
  | { kind: 'wrong_event' }

const RESULT_COPY: Record<ScanResult['kind'], { title: string; className: string }> = {
  granted: { title: 'Valid — Entry granted', className: 'bg-green-600' },
  already_scanned: { title: 'Already scanned', className: 'bg-amber-500' },
  cancelled: { title: 'Cancelled — Entry denied', className: 'bg-destructive' },
  not_found: {
    title: 'Invalid ticket / Not Found. Update tickets inventory and try again.',
    className: 'bg-destructive',
  },
  wrong_event: { title: 'Wrong event for this ticket', className: 'bg-destructive' },
}

export default function ScannerScreen({ navigation, route }: Props) {
  const { eventId, eventName } = route.params
  const isFocused = useIsFocused()
  const { hasPermission, requestPermission } = useCameraPermission()
  // CodeScanner's own internal useCameraDevice('back') throws synchronously if the
  // device is still null right after mount (a real VisionCamera race) — checking it
  // here first lets us hold off mounting CodeScanner until that race has resolved.
  const device = useCameraDevice('back')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [processing, setProcessing] = useState(false)

  // Same drawer-header stacking issue as EventCheckinScreen — hide it only while focused.
  useEffect(() => {
    const parent = navigation.getParent()
    parent?.setOptions({ headerShown: false })
    return () => parent?.setOptions({ headerShown: true })
  }, [navigation])

  useEffect(() => {
    if (!hasPermission) requestPermission()
  }, [hasPermission, requestPermission])

  async function handleBarcodeScanned(barcodes: Barcode[]) {
    if (processing || result) return
    const raw = barcodes[0]?.rawValue
    if (!raw) return

    setProcessing(true)
    try {
      const parsed = parseQrPayload(raw)
      if (!parsed) {
        setResult({ kind: 'not_found' })
        return
      }
      if (parsed.eventId !== eventId) {
        setResult({ kind: 'wrong_event' })
        return
      }

      const ticket = await getTicketByQrCode(eventId, parsed.ticketId)
      if (!ticket) {
        setResult({ kind: 'not_found' })
        return
      }
      if (ticket.status === 'cancelled') {
        setResult({ kind: 'cancelled' })
        return
      }

      const { entry, isNew } = await recordScan(eventId, parsed.ticketId)
      setResult(isNew ? { kind: 'granted' } : { kind: 'already_scanned', entry })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} className="text-white" />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center text-white">
          {eventName}
        </Text>
      </View>

      <View className="flex-1">
        {!hasPermission ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-white text-center">
              Camera permission is required to scan tickets.
            </Text>
          </View>
        ) : !device ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-white text-center">Looking for camera…</Text>
          </View>
        ) : (
          <CodeScanner
            style={{ flex: 1 }}
            isActive={isFocused && !result}
            barcodeFormats={['qr-code']}
            onBarcodeScanned={handleBarcodeScanned}
            onError={(error) => Toast.show({ type: 'error', text1: error.message })}
          />
        )}

        {result && (
          <View className="absolute inset-0 items-center justify-center px-8">
            <View className={`w-full rounded-2xl p-6 items-center gap-4 ${RESULT_COPY[result.kind].className}`}>
              <Text className="text-white text-xl font-semibold text-center">
                {RESULT_COPY[result.kind].title}
              </Text>
              {result.kind === 'already_scanned' && (
                <Text className="text-white/90 text-sm text-center">
                  {result.entry.scanned_by_name ? `Scanned by ${result.entry.scanned_by_name}\n` : ''}
                  {displayDateTime(result.entry.scanned_at)}
                </Text>
              )}
              <Button variant="secondary" onPress={() => setResult(null)}>
                <Text>Scan Next</Text>
              </Button>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
