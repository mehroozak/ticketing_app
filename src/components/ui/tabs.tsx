import React from 'react'
import { Pressable, View } from 'react-native'
import { Text } from './text'

interface Tab {
  value: string
  label: string
}

interface Props {
  tabs: Tab[]
  value: string
  onChange: (value: string) => void
}

export function TabBar({ tabs, value, onChange }: Props) {
  return (
    <View className="flex-row border-b border-border">
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          onPress={() => onChange(tab.value)}
          className="flex-1 items-center py-3"
        >
          <Text
            className={`text-xs font-semibold uppercase tracking-widest ${
              value === tab.value ? 'text-brand' : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </Text>
          {value === tab.value && <View className="absolute bottom-0 h-0.5 w-full bg-brand" />}
        </Pressable>
      ))}
    </View>
  )
}
