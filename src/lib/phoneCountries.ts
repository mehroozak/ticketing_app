import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js'

export interface PhoneCountry {
  iso2: CountryCode
  callingCode: string
}

// Derived entirely from libphonenumber-js's own metadata (no hand-maintained
// country-name list) — sorted by calling code so the picker groups countries
// that share a dialing code (e.g. +1) together.
export const PHONE_COUNTRIES: PhoneCountry[] = getCountries()
  .map((iso2) => ({ iso2, callingCode: getCountryCallingCode(iso2) }))
  .sort((a, b) => Number(a.callingCode) - Number(b.callingCode))

export const DEFAULT_PHONE_COUNTRY: CountryCode = 'PK'

export function findPhoneCountry(iso2: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((c) => c.iso2 === iso2)
}
