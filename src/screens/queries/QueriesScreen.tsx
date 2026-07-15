import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { CalendarClock, LifeBuoy, Mail, Mic2 } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import type { LucideIcon } from 'lucide-react-native'
import type { QueriesStackScreenProps } from '../../navigation/types'

type Props = QueriesStackScreenProps<'QueriesScreen'>

interface MenuItem {
  route: 'ContactUs' | 'ContactSupport' | 'EnquireArtist' | 'EnquireEventManagement'
  title: string
  description: string
  icon: LucideIcon
}

const MENU_ITEMS: MenuItem[] = [
  {
    route: 'ContactUs',
    title: 'Contact Us',
    description: 'General questions or feedback',
    icon: Mail,
  },
  {
    route: 'ContactSupport',
    title: 'Contact Support',
    description: 'Help with an existing order or ticket',
    icon: LifeBuoy,
  },
  {
    route: 'EnquireArtist',
    title: 'Enquire Artist',
    description: 'Book an artist for your event',
    icon: Mic2,
  },
  {
    route: 'EnquireEventManagement',
    title: 'Event Management',
    description: 'Get a quote for full event management',
    icon: CalendarClock,
  },
]

export default function QueriesScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-4 py-6 gap-3">
        <Text variant="h2" className="mb-2">
          Queries
        </Text>

        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <View className="size-11 items-center justify-center rounded-full bg-muted">
              <Icon as={item.icon} size={20} className="text-brand" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground text-base font-semibold">{item.title}</Text>
              <Text className="text-muted-foreground text-sm">{item.description}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
