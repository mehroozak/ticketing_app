import React from 'react'
import { View } from 'react-native'
import { Text } from '../ui/text'

interface Props {
  eventsHosted: number
  totalTicketsSold: number
  organizingSince: number
}

export default function OrganizerStats({ eventsHosted, totalTicketsSold, organizingSince }: Props) {
  const stats = [
    { label: 'Events Hosted', value: eventsHosted },
    { label: 'Tickets Sold', value: totalTicketsSold },
    { label: 'Organizing Since', value: organizingSince },
  ]

  return (
    <View className="flex-row flex-wrap gap-6">
      {stats.map((stat) => (
        <View key={stat.label}>
          <Text className="text-3xl font-extrabold text-brand">{stat.value}</Text>
          <Text className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</Text>
        </View>
      ))}
    </View>
  )
}
