import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
};

// ── Bottom tabs (4 tabs) ──────────────────────────────────────────────────────

export type BottomTabParamList = {
  Home: undefined;
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  Queries: NavigatorScreenParams<QueriesStackParamList>;
  // auth-aware — renders AuthStackNavigator or PortalDrawerNavigator internally
  Portal: undefined;
};

// ── Explore stack (deep-linkable) ─────────────────────────────────────────────

export type ExploreStackParamList = {
  ExploreScreen: undefined;          // passlay.com/events
  EventDetail: { id: string };       // passlay.com/events/:id
  Checkout: { eventId: string; tierId: string };
  Confirmation: { orderId: string };
};

// ── Queries stack ─────────────────────────────────────────────────────────────

export type QueriesStackParamList = {
  QueriesScreen: undefined;
  EnquireArtist: undefined;
  EnquireEventManagement: undefined;
  ContactUs: undefined;
};

// ── Auth stack (Portal tab — not logged in) ───────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// ── Portal drawer (Portal tab — logged in) ────────────────────────────────────

export type PortalDrawerParamList = {
  // Personal context
  MyTickets: undefined;
  Profile: undefined;
  // Staff context
  Staff: NavigatorScreenParams<StaffStackParamList>;
};

// ── Staff stack (inside Portal drawer) ───────────────────────────────────────

export type StaffStackParamList = {
  AssignedEvents: undefined;
  EventCheckin: { eventId: string; eventName: string };
  Scanner: { eventId: string; eventName: string };
};

// ── Typed screen props ────────────────────────────────────────────────────────

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type BottomTabScreenProps_<T extends keyof BottomTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ExploreStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<BottomTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type QueriesStackScreenProps<T extends keyof QueriesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<QueriesStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<BottomTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type PortalDrawerScreenProps<T extends keyof PortalDrawerParamList> =
  DrawerScreenProps<PortalDrawerParamList, T>;

export type StaffStackScreenProps<T extends keyof StaffStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<StaffStackParamList, T>,
    DrawerScreenProps<PortalDrawerParamList>
  >;

// ── Global augmentation — enables useNavigation() without generic everywhere ──

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
