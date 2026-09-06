import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  // reachable via universal link (https://passlay.com/reset-password?uid=&token=) regardless of auth state
  ResetPassword: { uid: string; token: string };
};

// ── Bottom tabs (5 tabs) ──────────────────────────────────────────────────────

export type BottomTabParamList = {
  Home: undefined;
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  Organizers: NavigatorScreenParams<OrganizersStackParamList>;
  Queries: NavigatorScreenParams<QueriesStackParamList>;
  // auth-aware — renders AuthStackNavigator or PortalDrawerNavigator internally
  Portal: undefined;
};

// ── Explore stack (deep-linkable) ─────────────────────────────────────────────
//
// EventDetail/OrganizerProfile/Checkout/Confirmation/PaymentCheckout/PaymentFailure
// are also registered in OrganizersStackParamList below — reachable both by browsing
// Explore's event list and by browsing the Organizers tab. Screens that live in both
// stacks are typed against a union of both stacks' screen props (see "Shared screen
// props" section) rather than picking one stack.

export type ExploreStackParamList = {
  ExploreScreen: undefined;          // passlay.com/events
  EventDetail: { id: string; resetCart?: boolean };       // passlay.com/events/:id
  OrganizerProfile: { slug: string };
  Checkout: {
    eventId: string;
    eventName: string;
    items: CheckoutItem[];
    organizationSlug: string;
    hasRefundPolicy: boolean;
    commissionPercent: string | null;
  };
  Confirmation: { orderId: string };
  PaymentCheckout: { orderId: string; postUrl: string; fields: Record<string, string> };
  PaymentFailure: { errMsg?: string };
};

export interface CheckoutItem {
  tierId: number;
  tierName: string;
  unitPrice: number;
  quantity: number;
}

// ── Organizers stack (deep-linkable) ──────────────────────────────────────────

export type OrganizersStackParamList = {
  OrganizersScreen: undefined;        // passlay.com/organizers
  OrganizerProfile: { slug: string }; // passlay.com/organizers/:slug
  EventDetail: { id: string; resetCart?: boolean };
  Checkout: ExploreStackParamList['Checkout'];
  Confirmation: { orderId: string };
  PaymentCheckout: { orderId: string; postUrl: string; fields: Record<string, string> };
  PaymentFailure: { errMsg?: string };
};

// ── Queries stack ─────────────────────────────────────────────────────────────

export type QueriesStackParamList = {
  QueriesScreen: undefined;
  EnquireArtist: undefined;
  EnquireEventManagement: undefined;
  ContactUs: undefined;
  ContactSupport: undefined;
};

// ── Auth stack (Portal tab — not logged in) ───────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// ── Portal drawer (Portal tab — logged in) ────────────────────────────────────

export type PortalDrawerParamList = {
  // Personal context
  MyTickets: NavigatorScreenParams<OrdersStackParamList>;
  Profile: undefined;
  // Staff context
  Staff: NavigatorScreenParams<StaffStackParamList>;
};

// ── Orders stack (inside Portal drawer) ───────────────────────────────────────

export type OrdersStackParamList = {
  MyTicketsList: undefined;
  OrderDetail: { orderId: string };
};

// ── Staff stack (inside Portal drawer) ───────────────────────────────────────

export type StaffStackParamList = {
  AssignedEvents: undefined;
  EventCheckin: { eventId: string; eventName: string };
  Scanner: { eventId: string; eventName: string };
  WalkInSale: { eventId: string; eventName: string };
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

export type OrganizersStackScreenProps<T extends keyof OrganizersStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OrganizersStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<BottomTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

// Screens registered in both ExploreStackNavigator and OrganizersStackNavigator, with an
// identical shape in each — typed against that common subset (not a union of both stacks'
// full param lists, which produces navigation props with incompatible call signatures)
// so `navigation.navigate(...)` only allows targets valid regardless of which tab mounted it.
export type SharedBrowseStackParamList = Pick<
  ExploreStackParamList,
  'EventDetail' | 'OrganizerProfile' | 'Checkout' | 'Confirmation' | 'PaymentCheckout' | 'PaymentFailure'
>;

export type SharedBrowseScreenProps<T extends keyof SharedBrowseStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SharedBrowseStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<BottomTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

export type EventDetailScreenProps = SharedBrowseScreenProps<'EventDetail'>;
export type OrganizerProfileScreenProps = SharedBrowseScreenProps<'OrganizerProfile'>;
export type CheckoutScreenProps = SharedBrowseScreenProps<'Checkout'>;
export type ConfirmationScreenProps = SharedBrowseScreenProps<'Confirmation'>;
export type PaymentCheckoutScreenProps = SharedBrowseScreenProps<'PaymentCheckout'>;
export type PaymentFailureScreenProps = SharedBrowseScreenProps<'PaymentFailure'>;

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

export type OrdersStackScreenProps<T extends keyof OrdersStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OrdersStackParamList, T>,
    DrawerScreenProps<PortalDrawerParamList>
  >;

// ── Global augmentation — enables useNavigation() without generic everywhere ──

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
