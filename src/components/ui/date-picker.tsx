import { Button } from 'src/components/ui/button';
import { Icon } from 'src/components/ui/icon';
import { Text } from 'src/components/ui/text';
import { displayDate, parseISODateString, toISODateString } from 'src/lib/dateUtils';
import { cn } from 'src/lib/utils';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  maximumDate?: Date;
}

function DatePicker({
  value,
  onChange,
  disabled,
  invalid,
  placeholder = 'Select date',
  maximumDate = new Date(),
}: DatePickerProps) {
  const [showIOSPicker, setShowIOSPicker] = React.useState(false);
  const selectedDate = value ? parseISODateString(value) : maximumDate;

  const open = () => {
    if (disabled) return;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        maximumDate,
        onValueChange: (_event, date) => onChange(toISODateString(date)),
      });
      return;
    }
    setShowIOSPicker(true);
  };

  return (
    <View>
      <Pressable
        onPress={open}
        disabled={disabled}
        className={cn(
          'dark:bg-input/30 border-input bg-background h-10 w-full min-w-0 flex-row items-center justify-between rounded-md border px-3 py-1 shadow-sm shadow-black/5 sm:h-9',
          invalid && 'border-destructive',
          disabled && 'opacity-50'
        )}>
        <Text className={cn('text-base', !value && 'text-muted-foreground/50')}>
          {value ? displayDate(value) : placeholder}
        </Text>
        <Icon as={CalendarDays} className="text-muted-foreground size-4" />
      </Pressable>

      {Platform.OS === 'ios' && showIOSPicker && (
        <View className="border-input bg-background mt-2 gap-2 overflow-hidden rounded-md border p-2">
          <DateTimePicker
            style={{ width: '100%' }}
            value={selectedDate}
            mode="date"
            display="inline"
            maximumDate={maximumDate}
            onValueChange={(_event, date) => onChange(toISODateString(date))}
          />
          <Button size="sm" onPress={() => setShowIOSPicker(false)}>
            <Text>Done</Text>
          </Button>
        </View>
      )}
    </View>
  );
}

export { DatePicker };
