import React from 'react'
import { Pressable, View } from 'react-native'
import { X } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { DatePicker } from '../ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Text } from '../ui/text'
import type { LookupItem } from '../../store/slices/lookupsSlice'

export interface FilterValues {
  search: string
  city: string
  category: string
  start_date: string
  end_date: string
}

export const EMPTY_FILTERS: FilterValues = {
  search: '',
  city: '',
  category: '',
  start_date: '',
  end_date: '',
}

// Events are filtered into the future, unlike DatePicker's birth-date-oriented default
// of "today" — cap far enough out that it never actually constrains event date filtering.
const FAR_FUTURE_DATE = new Date(new Date().getFullYear() + 5, 11, 31)

function isDirty(values: FilterValues): boolean {
  return Object.values(values).some((v) => v !== '')
}

interface Props {
  values: FilterValues
  cities: LookupItem[]
  categories: LookupItem[]
  onChange: (values: FilterValues) => void
}

export default function EventFilters({ values, cities, categories, onChange }: Props) {
  function set(field: keyof FilterValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  const selectedCity = cities.find((c) => String(c.id) === values.city)
  const selectedCategory = categories.find((c) => String(c.id) === values.category)

  return (
    <View className="gap-3 bg-background pt-4 pb-2">
      <Input
        placeholder="Search events..."
        value={values.search}
        onChangeText={(text) => set('search', text)}
      />

      <View className="flex-row flex-wrap gap-2">
        <View className="flex-1 min-w-32">
          <Select
            value={selectedCity ? { value: values.city, label: selectedCity.display_name ?? '' } : undefined}
            onValueChange={(option) => set('city', option?.value ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} label={c.display_name ?? c.value} />
              ))}
            </SelectContent>
          </Select>
        </View>

        <View className="flex-1 min-w-32">
          <Select
            value={
              selectedCategory
                ? { value: values.category, label: selectedCategory.display_name ?? '' }
                : undefined
            }
            onValueChange={(option) => set('category', option?.value ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} label={c.display_name ?? c.value} />
              ))}
            </SelectContent>
          </Select>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <DatePicker
            value={values.start_date}
            onChange={(v) => set('start_date', v)}
            maximumDate={FAR_FUTURE_DATE}
            placeholder="Start date"
          />
        </View>
        <View className="flex-1">
          <DatePicker
            value={values.end_date}
            onChange={(v) => set('end_date', v)}
            maximumDate={FAR_FUTURE_DATE}
            placeholder="End date"
          />
        </View>
      </View>

      {isDirty(values) && (
        <Pressable
          onPress={() => onChange(EMPTY_FILTERS)}
          className="flex-row items-center self-start gap-1.5 rounded-md border border-border px-3 py-1.5"
        >
          <Icon as={X} size={14} className="text-muted-foreground" />
          <Text className="text-muted-foreground text-xs uppercase tracking-widest">Clear</Text>
        </Pressable>
      )}
    </View>
  )
}
