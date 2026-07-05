import type { Theme } from '@react-navigation/native'

// Tokens not covered by React Navigation's Theme shape (colors.primary/background/card/border/text/notification only)
// but needed for imperative color props (e.g. tabBarActiveTintColor) elsewhere. Kept in sync with global.css.
export const BRAND_COLOR = 'hsl(41, 96%, 40%)' // --brand — same value in both light and dark

export const MUTED_FOREGROUND = {
  light: 'hsl(217, 14%, 43%)', // --muted-foreground (:root)
  dark: 'hsl(215, 17%, 60%)', // --muted-foreground (.dark)
}

export const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    dark: false,
    colors: {
      background: '#d6dbe4',
      border: '#b5bdc9',
      card: '#dde2ea',
      notification: '#dc2626',
      primary: '#0C0C0C',
      text: '#0C0C0C',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  },
  dark: {
    dark: true,
    colors: {
      background: '#0C0C0C',
      border: '#1a2535',
      card: '#151e2e',
      notification: '#f87171',
      primary: '#d6dbe4',
      text: '#d6dbe4',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  },
}
