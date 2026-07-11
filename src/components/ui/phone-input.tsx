import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { cn } from 'src/lib/utils';
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES } from 'src/lib/phoneCountries';
import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import * as React from 'react';
import { Platform, TextInput, View } from 'react-native';

export interface PhoneInputProps {
  value?: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

function PhoneInput({
  value,
  onChangeText,
  onBlur,
  disabled,
  invalid,
  placeholder = 'Phone number',
}: PhoneInputProps) {
  const [country, setCountry] = React.useState<CountryCode>(DEFAULT_PHONE_COUNTRY);
  const [isFocused, setIsFocused] = React.useState(false);

  // Keep the country selector in sync when an existing E.164 value is loaded from outside (e.g. editing a profile)
  React.useEffect(() => {
    if (!value) return;
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) setCountry(parsed.country);
  }, [value]);

  const callingCode = getCountryCallingCode(country);
  const nationalDigits = value ? value.replace(`+${callingCode}`, '') : '';

  const emitChange = (digits: string, nextCountry: CountryCode) => {
    onChangeText(digits ? `+${getCountryCallingCode(nextCountry)}${digits}` : '');
  };

  return (
    <View
      className={cn(
        'dark:bg-input/30 border-input bg-background h-10 w-full min-w-0 flex-row items-center rounded-md border shadow-sm shadow-black/5 sm:h-9',
        isFocused && 'border-brand',
        invalid && 'border-destructive',
        disabled && 'opacity-50'
      )}>
      <Select
        className="h-full"
        value={{ value: country, label: `+${callingCode}` }}
        onValueChange={(option) => {
          if (!option) return;
          const nextCountry = option.value as CountryCode;
          setCountry(nextCountry);
          emitChange(nationalDigits, nextCountry);
        }}
        disabled={disabled}>
        <SelectTrigger
          disabled={disabled}
          className="h-full shrink-0 rounded-r-none border-0 border-r border-input bg-transparent px-3 shadow-none sm:h-full">
          <SelectValue placeholder={`+${callingCode}`} />
        </SelectTrigger>
        <SelectContent>
          {PHONE_COUNTRIES.map((c) => (
            <SelectItem key={c.iso2} value={c.iso2} label={`${c.iso2} +${c.callingCode}`} />
          ))}
        </SelectContent>
      </Select>

      <TextInput
        value={nationalDigits}
        onChangeText={(text) => emitChange(text.replace(/\D/g, ''), country)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        editable={!disabled}
        keyboardType="phone-pad"
        placeholder={placeholder}
        className={cn(
          'text-foreground flex-1 px-3 py-1 text-base leading-5',
          Platform.select({
            web: 'placeholder:text-muted-foreground outline-none md:text-sm',
            native: 'placeholder:text-muted-foreground/50',
          })
        )}
      />
    </View>
  );
}

export { PhoneInput };
