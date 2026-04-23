# TANAW ONE APP — Frontend Backbone
## Phase 1 UI · Connected to Backend · All Icons Clickable

---

> **LAYUNIN NG DOC NA ITO:**
> I-build ang buong frontend structure na:
> 1. Connected na sa Phase 1 Backend (real login, register, profile)
> 2. Lahat ng icon at service ay clickable na (Coming Soon modal)
> 3. Navigation ay complete na para sa lahat ng phases
> 4. Ready para palitan ng real screens sa Phase 2 at 3

---

# PART A — CURSOR SETUP

## A1. Ang `.cursorrules` File

I-paste mo ang content na ito sa `tanaw-mobile/.cursorrules`:

**Content ng `.cursorrules`:**
```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App — City of Tanauan, Batangas, Philippines.
Phase 1 Frontend: Auth, Home, Profile, Digital ID.
Stack: React Native, Expo SDK 52, TypeScript, Redux Toolkit, React Navigation 6.

ARCHITECTURE
  constants/     → Design tokens ONLY (COLORS, SPACING, FONT_SIZE)
  types/         → TypeScript interfaces ONLY
  utils/         → Pure helpers (no React, no state)
  api/           → Axios client + endpoint functions
  store/slices/  → Redux Toolkit slices + async thunks
  hooks/         → Custom React hooks
  components/    → Reusable UI (common/, home/, id-card/)
  screens/       → Full-page screens (one folder per feature)
  navigation/    → React Navigation navigators

RULES
F1   STYLING     StyleSheet.create() ONLY. Colors from constants. No inline styles.
F2   COMPONENTS  Typed Props interface. No any. No direct API calls in components.
F3   STATE       Redux Toolkit + typed hooks (useAppDispatch, useAppSelector).
F4   API         All calls through src/api/. Interceptors handle auth token.
F5   NAVIGATION  Typed params. Root switches Auth vs Main by isAuthenticated.
F6   TOKENS      expo-secure-store. Login stores, logout clears, startup checks.
F7   FORMS       react-hook-form + zod for all forms.
F8   COMING SOON ComingSoonModal for unimplemented features.
F9   BACKEND     Barangay is a RELATION OBJECT: user.barangay?.name (NOT a string).
                 Register sends barangayCode (e.g. BGY-SALA-035). Login sends identifier.
F10  NAMING      PascalCase screens/components. camelCase hooks/utils/api.

BACKEND API SHAPE
  Response: { success, message, data }. API functions return data only.
  User.barangay = { id, code, name } (relation object, NOT string)
  User.address = { houseNo, street, city, province, zipCode } (NO barangay field)
  Gender: MALE | FEMALE (two values only)
  Register: barangayCode field (not barangay)
  Login: identifier (email OR phone OR tanawId) + password
```

---

## A2. Ang `TANAW.SKILL.md` File

Quick reference para sa developer:

```markdown
# TANAW ONE APP — Frontend Skill

## Architecture
constants/ → types/ → utils/ → api/ → store/ → hooks/ → components/ → screens/ → navigation/

## Rules Quick Reference
F1  StyleSheet.create() only. Colors from COLORS constant.
F2  Typed Props. No any. Components never call API directly.
F3  Redux Toolkit. useAppDispatch + useAppSelector.
F4  All API through src/api/. Interceptors handle tokens.
F5  Typed navigation. Root switches Auth vs Main.
F6  Tokens in SecureStore. Login stores, logout clears.
F7  react-hook-form + zod for forms.
F8  ComingSoonModal for unimplemented features.
F9  user.barangay?.name for barangay. NOT user.address?.barangay.
F10 PascalCase screens. camelCase utils.

## Backend Types (critical)
User.barangay = { id, code, name }     ← relation object
User.address = { houseNo, street, city, province, zipCode }  ← NO barangay here
Gender = 'MALE' | 'FEMALE'            ← only two values
Register sends: barangayCode           ← not free text
Login sends: identifier + password     ← multi-identifier
```

---

# PART B — COMPLETE FOLDER STRUCTURE

```bash
# Sa loob ng tanaw-mobile folder

# Screens
mkdir -p src/screens/auth
mkdir -p src/screens/home
mkdir -p src/screens/profile
mkdir -p src/screens/services
mkdir -p src/screens/emergency
mkdir -p src/screens/market

# Components
mkdir -p src/components/common
mkdir -p src/components/home
mkdir -p src/components/id-card

# Store
mkdir -p src/store/slices

# Navigation, API, Types, Constants, Hooks, Utils
mkdir -p src/navigation
mkdir -p src/api
mkdir -p src/types
mkdir -p src/constants
mkdir -p src/hooks
mkdir -p src/utils
```

## File Map

```
tanaw-mobile/
│
├── App.tsx                              ← Root entry point
│
├── src/
│   ├── constants/
│   │   ├── colors.ts                   ← COLORS.PRIMARY, COLORS.GOLD, etc.
│   │   └── spacing.ts                  ← SPACING, RADIUS, FONT_SIZE
│   │
│   ├── types/
│   │   ├── user.types.ts               ← User, Barangay, Address interfaces
│   │   └── navigation.types.ts         ← All navigation param types
│   │
│   ├── utils/
│   │   ├── storage.ts                  ← SecureStore wrappers
│   │   └── format.ts                   ← Date, name, role, gender formatters
│   │
│   ├── api/
│   │   ├── client.ts                   ← Axios + auto token refresh
│   │   ├── auth.api.ts                 ← register, login, logout, refresh
│   │   └── users.api.ts                ← getProfile, updateProfile, digitalId
│   │
│   ├── store/
│   │   ├── index.ts                    ← Redux store + typed hooks
│   │   └── slices/
│   │       ├── authSlice.ts            ← auth state + thunks
│   │       └── userSlice.ts            ← profile state + thunks
│   │
│   ├── hooks/
│   │   └── useAuth.ts                  ← auth convenience hook
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx           ← Auth vs Main switch
│   │   ├── AuthNavigator.tsx           ← Welcome→RoleSelect→Register→Login
│   │   └── MainNavigator.tsx           ← Bottom tabs (5 tabs)
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── ComingSoonModal.tsx     ← Reused by ALL coming soon taps
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── home/
│   │   │   ├── AlertBanner.tsx
│   │   │   ├── ServiceGrid.tsx
│   │   │   ├── ExploreSection.tsx
│   │   │   └── FeedPreview.tsx
│   │   └── id-card/
│   │       └── TanawIDCard.tsx
│   │
│   └── screens/
│       ├── auth/
│       │   ├── WelcomeScreen.tsx
│       │   ├── RoleSelectScreen.tsx
│       │   ├── RegisterScreen.tsx
│       │   └── LoginScreen.tsx
│       ├── home/
│       │   └── HomeScreen.tsx
│       ├── profile/
│       │   ├── ProfileScreen.tsx
│       │   └── DigitalIDScreen.tsx
│       ├── services/
│       │   └── ServicesScreen.tsx       ← Coming Soon placeholder
│       ├── emergency/
│       │   └── EmergencyScreen.tsx      ← Coming Soon placeholder
│       └── market/
│           └── MarketScreen.tsx         ← Coming Soon placeholder
```

---

# PART C — STEP BY STEP PROMPTS

---

## STEP 1 — Constants + Types + Utils

**Ano ito:** Foundation files na kailangan ng lahat.

---

**PROMPT 1:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App — City of Tanauan, Batangas. Phase 1 frontend.
Stack: React Native, Expo SDK 52, TypeScript, Redux Toolkit, React Navigation 6.

Generate these files. Complete content. No placeholders.

━━━ FILE 1: src/constants/colors.ts ━━━

export const COLORS = {
  PRIMARY: '#C8102E',
  PRIMARY_DARK: '#9B0B21',
  PRIMARY_DEEPER: '#6E0718',
  PRIMARY_LIGHT: '#FFF0F0',
  GOLD: '#F2A900',
  GOLD_LIGHT: '#FFF8E1',
  WHITE: '#FFFFFF',
  OFF_WHITE: '#FAF9F8',
  GRAY_50: '#F5F4F2',
  GRAY_100: '#E8E6E3',
  GRAY_300: '#B8B4AE',
  GRAY_500: '#7A7570',
  GRAY_700: '#3E3A36',
  GRAY_900: '#1A1714',
  SUCCESS: '#1E7E34',
  SUCCESS_LIGHT: '#E6FFE6',
  DANGER: '#DC3545',
  DANGER_LIGHT: '#FFF0F0',
  WARNING: '#FFC107',
  WARNING_LIGHT: '#FFF8E1',
  INFO: '#17A2B8',
  INFO_LIGHT: '#E8F8FA',
  OVERLAY: 'rgba(0,0,0,0.5)',
  SHADOW: 'rgba(0,0,0,0.1)',
} as const

━━━ FILE 2: src/constants/spacing.ts ━━━

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 9999,
} as const

export const FONT_SIZE = {
  xs: 10, sm: 12, base: 14, md: 16, lg: 18,
  xl: 20, xxl: 24, xxxl: 32, display: 40,
} as const

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}

━━━ FILE 3: src/types/user.types.ts ━━━

IMPORTANT: These types MUST match the backend API response shapes exactly.

export type UserRole =
  | 'RESIDENT'
  | 'BARANGAY_OFFICIAL'
  | 'GOVERNMENT_EMPLOYEE'
  | 'SUPER_ADMIN'

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED'

export type Gender = 'MALE' | 'FEMALE'

export interface Barangay {
  id: string
  code: string
  name: string
  zipCode?: string
  isActive: boolean
}

export interface Address {
  id: string
  userId: string
  houseNo?: string
  street?: string
  city: string
  province: string
  zipCode: string
}

export interface User {
  id: string
  tanawId: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  birthDate: string
  gender: Gender
  profilePhoto?: string
  barangayId?: string
  barangay?: Barangay
  employeeCode?: string
  department?: string
  position?: string
  address?: Address
  createdAt: string
  updatedAt: string
}

export interface DigitalIdData {
  tanawId: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  role: UserRole
  status: UserStatus
  profilePhoto?: string
  birthDate: string
  createdAt: string
  barangay?: { code: string; name: string }
  address?: { city: string }
}

━━━ FILE 4: src/types/navigation.types.ts ━━━

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { RouteProp } from '@react-navigation/native'

export type AuthStackParamList = {
  Welcome: undefined
  RoleSelect: undefined
  Register: {
    role: 'RESIDENT' | 'BARANGAY_OFFICIAL' | 'GOVERNMENT_EMPLOYEE'
  }
  Login: undefined
}

export type MainTabParamList = {
  Home: undefined
  Services: undefined
  DigitalID: undefined
  Emergency: undefined
  Profile: undefined
}

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>

export type WelcomeNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>
export type RoleSelectNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>
export type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>
export type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>
export type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>

━━━ FILE 5: src/utils/storage.ts ━━━

import * as SecureStore from 'expo-secure-store'

export const setToken = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value)
}

export const getToken = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key)
}

export const removeToken = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key)
}

export const clearAuthTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('accessToken')
  await SecureStore.deleteItemAsync('refreshToken')
}

━━━ FILE 6: src/utils/format.ts ━━━

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getFullName(
  firstName: string,
  lastName: string,
  middleName?: string,
  suffix?: string
): string {
  const parts = [firstName, middleName, lastName, suffix].filter(Boolean)
  return parts.join(' ')
}

export function formatRole(role: string): string {
  const map: Record<string, string> = {
    RESIDENT: 'City Resident',
    BARANGAY_OFFICIAL: 'Barangay Official',
    GOVERNMENT_EMPLOYEE: "Gov't Employee",
    SUPER_ADMIN: 'Admin',
  }
  return map[role] ?? role
}

export function formatGender(gender: string): string {
  const map: Record<string, string> = {
    MALE: 'Lalaki',
    FEMALE: 'Babae',
  }
  return map[gender] ?? gender
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING_VERIFICATION: 'Pending',
    ACTIVE: 'Aktibo',
    SUSPENDED: 'Suspended',
    DEACTIVATED: 'Deactivated',
  }
  return map[status] ?? status
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ngayon lang'
  if (diffMins < 60) return `${diffMins} minuto ang nakalipas`
  if (diffHours < 24) return `${diffHours} oras ang nakalipas`
  return `${diffDays} araw ang nakalipas`
}

Return all 6 files. Complete content.
```

---

## STEP 2 — API Client + API Files

**Ano ito:** Axios instance na auto-refresh tokens + lahat ng API calls.

---

**PROMPT 2:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.

Backend base URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

IMPORTANT — Backend response envelope:
  Every endpoint returns { success: boolean, message: string, data?: any }
  API functions must unwrap and return response.data.data

IMPORTANT — Backend shapes:
  User.barangay is a RELATION OBJECT: { id, code, name, zipCode, isActive }
  User.address is a RELATION OBJECT: { id, houseNo, street, city, province, zipCode }
  Gender: 'MALE' | 'FEMALE' only
  Register sends field name: barangayCode (not barangay)
  Login sends: { identifier, password }

Generate these 3 files. Complete TypeScript. No placeholders.

━━━ FILE 1: src/api/client.ts ━━━

Create Axios instance:
  baseURL: EXPO_PUBLIC_API_URL
  timeout: 15000
  headers: Content-Type application/json

REQUEST INTERCEPTOR:
  Read accessToken from SecureStore
  If exists: add Authorization: Bearer {token}

RESPONSE INTERCEPTOR:
  On 401 and NOT already retried (_retry flag):
    Mark _retry = true
    Read refreshToken from SecureStore
    POST to /auth/refresh with { refreshToken }
    On success:
      Store new accessToken and refreshToken in SecureStore
      Retry original request with new token
    On fail:
      clearAuthTokens()
      Lazy import store, dispatch logout action
      Reject with error
  Return response or reject error

export default apiClient

━━━ FILE 2: src/api/auth.api.ts ━━━

All functions call apiClient and return response.data.data

registerResident(dto: {
  email, phone, password, firstName, lastName,
  middleName?, suffix?, birthDate, gender: 'MALE'|'FEMALE',
  barangayCode, street?, houseNo?
})
  POST /auth/register/resident
  Returns: User (with tanawId, barangay object, address object)

registerBarangay(dto: above + position)
  POST /auth/register/barangay

registerEmployee(dto: above + employeeCode + department + position)
  POST /auth/register/employee

login(dto: { identifier: string; password: string })
  POST /auth/login
  Returns: { user: User, accessToken: string, refreshToken: string }

logout()
  POST /auth/logout

refresh(refreshToken: string)
  POST /auth/refresh
  Returns: { accessToken: string, refreshToken: string }

━━━ FILE 3: src/api/users.api.ts ━━━

getProfile()
  GET /users/me
  Returns: User (with barangay object + address object)

updateProfile(dto: {
  firstName?, middleName?, lastName?, suffix?, street?, houseNo?
})
  PATCH /users/me
  Returns: User

getDigitalIdData()
  GET /users/me/digital-id
  Returns: DigitalIdData
    Shape: { tanawId, firstName, middleName, lastName, suffix,
             role, status, profilePhoto, birthDate, createdAt,
             barangay: { code, name }, address: { city } }

registerDeviceToken(token: string, platform: 'ios' | 'android')
  POST /users/device-token
  Returns: { registered: boolean }

Return all 3 files. Complete TypeScript. No placeholders.
```

---

## STEP 3 — Redux Store + Slices

**Ano ito:** Global state management. Auth state at user profile.

---

**PROMPT 3:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.

Generate these 3 files. Complete TypeScript. No placeholders.

━━━ FILE 1: src/store/slices/authSlice.ts ━━━

State:
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isCheckingAuth: boolean
  error: string | null

Thunks:

loginThunk(dto: { identifier: string; password: string })
  1. Call authApi.login(dto)
  2. Store tokens in SecureStore
  3. Return { accessToken, refreshToken, user }
  Fulfilled: set isAuthenticated=true, user, tokens
  Rejected: set error from rejectWithValue

logoutThunk()
  1. Try authApi.logout() — ignore errors
  2. clearAuthTokens() from SecureStore
  3. Return void
  Fulfilled: reset entire state to initial

checkAuthThunk()
  1. Read accessToken and refreshToken from SecureStore
  2. If both exist: return { accessToken, refreshToken }
  3. Else: rejectWithValue('No tokens')
  Fulfilled: set isAuthenticated=true, set tokens
  Rejected: set isAuthenticated=false

Reducers:
  logout: reset all state
  setTokens(state, action: { accessToken, refreshToken })
  setUser(state, action: User)
  clearError

━━━ FILE 2: src/store/slices/userSlice.ts ━━━

State:
  profile: User | null
  digitalIdData: DigitalIdData | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null

Thunks:

fetchProfileThunk()
  Call usersApi.getProfile()
  Fulfilled: set profile
  Rejected: set error

updateProfileThunk(dto)
  Call usersApi.updateProfile(dto)
  Fulfilled: set profile
  Rejected: set error

fetchDigitalIdThunk()
  Call usersApi.getDigitalIdData()
  Fulfilled: set digitalIdData
  Rejected: set error

Reducers:
  clearProfile
  clearError

━━━ FILE 3: src/store/index.ts ━━━

configureStore with:
  auth: authReducer
  user: userReducer

Export:
  store
  RootState = ReturnType<typeof store.getState>
  AppDispatch = typeof store.dispatch
  useAppDispatch = () => useDispatch<AppDispatch>()
  useAppSelector: TypedUseSelectorHook<RootState>

Return all 3 files. Complete TypeScript. No placeholders.
```

---

## STEP 4 — Navigation

**Ano ito:** Buong navigation structure. Auth check on startup.

---

**PROMPT 4:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.

Generate these 3 files. Complete TypeScript. No placeholders.

━━━ FILE 1: src/navigation/RootNavigator.tsx ━━━

On mount: dispatch(checkAuthThunk())
While isCheckingAuth=true: show full screen loader
  View flex:1, backgroundColor PRIMARY (#C8102E), center
  ActivityIndicator white large
  Text "TANAW" white 24px bold below indicator

If isAuthenticated: render <MainNavigator />
Else: render <AuthNavigator />

━━━ FILE 2: src/navigation/AuthNavigator.tsx ━━━

createNativeStackNavigator<AuthStackParamList>
Screens: Welcome, RoleSelect, Register, Login

Default screen options:
  headerStyle: backgroundColor PRIMARY
  headerTintColor: WHITE
  headerTitleStyle: fontWeight bold
  headerShadowVisible: false

WelcomeScreen: headerShown false
All others: headerShown true

━━━ FILE 3: src/navigation/MainNavigator.tsx ━━━

createBottomTabNavigator<MainTabParamList>

5 tabs:
  Home → HomeScreen (house icon, label "Home")
  Services → ServicesScreen (grid icon, label "Services")
  DigitalID → DigitalIDScreen (NO label, custom center button)
    Custom tabBarButton: 60x60 red circle, elevated, ID card icon white
  Emergency → EmergencyScreen (warning icon, label "Emergency")
  Profile → ProfileScreen (person icon, label "Profile")

Tab bar: white bg, height 70, active=PRIMARY, inactive=GRAY_300
headerShown: false for all

Return all 3 files. Complete TypeScript. No placeholders.
```

---

## STEP 5 — Common Components

**Ano ito:** Shared components na ginagamit sa buong app.

---

**PROMPT 5:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.
Rules: COLORS constants, StyleSheet.create() only, no external UI lib.

Generate these 5 files. Complete TypeScript. No placeholders.

━━━ FILE 1: src/components/common/ComingSoonModal.tsx ━━━
Props: visible, onClose, featureName?, phase? (default 'Phase 2')
Modal fade, overlay bg, center card.
Logo mark "T" + "Malapit na!" + feature name + description + phase badge + close button.

━━━ FILE 2: src/components/common/Button.tsx ━━━
Props: title, onPress, variant (primary|outline|ghost|danger), size (sm|md|lg),
       isLoading?, disabled?, fullWidth?, style?
Variants with proper colors. Loading shows ActivityIndicator.

━━━ FILE 3: src/components/common/Input.tsx ━━━
Props: label?, placeholder?, value, onChangeText, error?, secureTextEntry?,
       keyboardType?, autoCapitalize?, leftIcon?, rightIcon?, multiline?, editable?
Focus state changes border color. Error state shows red border + message.

━━━ FILE 4: src/components/common/LoadingOverlay.tsx ━━━
Props: visible, message?
Modal overlay with ActivityIndicator + optional message.

━━━ FILE 5: src/components/common/ErrorMessage.tsx ━━━
Props: message (string|null), onDismiss?
Red banner with warning icon + message + optional dismiss X.

Return all 5 files. Complete TypeScript. No placeholders.
```

---

## STEP 6 — Home Screen Components

**Ano ito:** Bawat section ng Home Screen as sariling component.

---

**PROMPT 6:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.
Rules: COLORS constants, StyleSheet.create() only, typed props.

Generate these 4 component files. Complete TypeScript. No placeholders.

━━━ FILE 1: src/components/home/AlertBanner.tsx ━━━
Props: title, subtitle?, onPress?, onDismiss?
Orange alert banner with dot, text, arrow, dismiss.

━━━ FILE 2: src/components/home/ServiceGrid.tsx ━━━
Props: onServicePress: (serviceName: string, phase: string) => void
2x4 grid: Documents, Appointments, Permits, Advisories (Phase 2),
          Programs, Tourism, Jobs, Report (Phase 2/3).
Each item: white card, emoji icon, label. onPress calls onServicePress.

━━━ FILE 3: src/components/home/ExploreSection.tsx ━━━
Props: onMarketplacePress, onEmergencyPress
Two cards: Marketplace (PRIMARY bg) and Emergency (GRAY_900 bg).

━━━ FILE 4: src/components/home/FeedPreview.tsx ━━━
Props: onViewAllPress, onPostPress?
2 mock posts (City Gov announcement + citizen report). Static data.
Will be replaced with real API data in Phase 2.

Return all 4 component files. Complete TypeScript. No placeholders.
```

---

## STEP 7 — Home Screen (Main)

**Ano ito:** Main dashboard. Real data from Redux. All items clickable.

---

**PROMPT 7:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.
Rules: COLORS constants, StyleSheet.create(), Redux for state.

CRITICAL — Backend shapes:
  user.barangay is an OBJECT: { id, code, name }
  To get barangay name: user?.barangay?.name (NOT user?.address?.barangay)
  user.address is an OBJECT: { houseNo, street, city, province, zipCode }

Generate: src/screens/home/HomeScreen.tsx
Complete TypeScript. No placeholders.

STATE:
  user = useAppSelector(s => s.auth.user)
  showModal, modalFeature, modalPhase, hasAlert = useState

  initials = user ? getInitials(user.firstName, user.lastName) : 'JD'
  fullName = user ? getFullName(...) : 'Juan Dela Cruz'
  barangayName = user?.barangay?.name ?? 'Tanauan'

LAYOUT (ScrollView, backgroundColor OFF_WHITE):

1. HEADER (backgroundColor PRIMARY):
   Logo "T" + "TANAW" + "CITY OF TANAUAN"
   Search + notification buttons

   USER CARD (white card inside header):
     Avatar circle with initials
     Name + "Brgy. {barangayName}, Tanauan City"
     Digital Resident ID button → navigate('DigitalID')

2. ALERT BANNER (if hasAlert)

3. CITY SERVICES section with <ServiceGrid>

4. EXPLORE section with <ExploreSection>

5. COMMUNITY FEED section with <FeedPreview>

6. <ComingSoonModal>

Return complete HomeScreen.tsx.
```

---

## STEP 8 — Auth Screens

**Ano ito:** Welcome, Role Select, Register (3 roles), Login — real API calls.

---

**PROMPT 8:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.
Rules: COLORS, StyleSheet.create(), react-hook-form + zodResolver, Redux.

CRITICAL — Backend expectations:
  Registration field: barangayCode (not barangay). Code like "BGY-SALA-035".
  Gender: only 'MALE' | 'FEMALE' (two values, no other option).
  Login: identifier (email OR phone OR tanawId) + password.
  Registration returns User (no tokens). Must login separately after register.

Generate these 4 screens. Complete TypeScript. No placeholders.

━━━ SCREEN 1: src/screens/auth/WelcomeScreen.tsx ━━━
Full red screen. Logo "T" + "TANAW" + "ONE APP" + tagline.
Stats row: "48 Barangays" | "1 Digital ID" | "∞ Serbisyo"
Two buttons: "Mag-register" → RoleSelect, "Mag-login" → Login.

━━━ SCREEN 2: src/screens/auth/RoleSelectScreen.tsx ━━━
3 role cards: Resident, Barangay Official, Gov't Employee.
Notice about special codes for Barangay/Employee.
Continue → Register screen with selected role.

━━━ SCREEN 3: src/screens/auth/RegisterScreen.tsx ━━━

route.params.role determines which fields to show.

3 steps:
  Step 1 — Personal Info:
    firstName, middleName (optional), lastName, suffix (optional),
    birthDate (YYYY-MM-DD), gender (2 buttons: Lalaki/Babae)

  Step 2 — Contact & Address:
    email, phone (09XXXXXXXXX format),
    barangayCode (placeholder: "BGY-SALA-035"),
    houseNo (optional), street (optional)
    If BARANGAY_OFFICIAL: + position
    If GOVERNMENT_EMPLOYEE: + employeeCode + department + position

  Step 3 — Password:
    password, confirmPassword
    Rules note: "Minimum 8 characters"

Zod validation per step. Navigate next only if current step validates.

SUBMIT: Call appropriate API based on role:
  RESIDENT → authApi.registerResident({...fields, barangayCode})
  BARANGAY_OFFICIAL → authApi.registerBarangay({...fields, barangayCode, position})
  GOVERNMENT_EMPLOYEE → authApi.registerEmployee({...fields, barangayCode, employeeCode, department, position})

On success: show success view with tanawId, button to navigate to Login.
On error: show ErrorMessage.

━━━ SCREEN 4: src/screens/auth/LoginScreen.tsx ━━━
Top: red area with logo.
Card: identifier input (email/phone/tanawId), password input with eye toggle.
Login button dispatches loginThunk({ identifier, password }).
RootNavigator automatically switches to Main on success.
Register link at bottom.

Return all 4 screen files. Complete TypeScript. StyleSheet only.
```

---

## STEP 9 — Digital ID Screen

**Ano ito:** Real TANAW ID card na may QR code. Data galing sa backend.

---

**PROMPT 9:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.

CRITICAL — Backend response shape for GET /users/me/digital-id:
  {
    tanawId, firstName, middleName, lastName, suffix,
    role, status, profilePhoto, birthDate, createdAt,
    barangay: { code: string, name: string },
    address: { city: string }
  }

  Barangay name: idData?.barangay?.name (NOT idData?.address?.barangay)
  City: idData?.address?.city

Generate: src/screens/profile/DigitalIDScreen.tsx
Complete TypeScript. StyleSheet only. No placeholders.

DATA:
  dispatch(fetchDigitalIdThunk()) on mount
  idData = useAppSelector(s => s.user.digitalIdData)

ID CARD:
  Top: dark red header with logo, name, role badge, "Brgy. {idData?.barangay?.name}"
  Middle: white area with TANAW ID number + QR code
    QR value: JSON.stringify({
      tanawId, name, role,
      barangay: idData?.barangay?.name,
      issued: idData?.createdAt
    })
  Info grid: Date Issued, Date of Birth, Katayuan, Kasarian
  Footer: "tanaw.tanauan.gov.ph" + "VERIFIED"

Action buttons: Share + Download (both show Coming Soon alert).

Note: react-native-qrcode-svg is already installed.
Return complete DigitalIDScreen.tsx.
```

---

## STEP 10 — Profile + Placeholder Screens

**Ano ito:** Profile (real data) at placeholder screens.

---

**PROMPT 10:**

```
You are a senior React Native/TypeScript engineer.
Project: TANAW One App Phase 1 frontend.

CRITICAL — Backend shapes:
  Barangay name: user?.barangay?.name (NOT user?.address?.barangay)
  Address: user?.address?.city, user?.address?.province, user?.address?.zipCode
  Gender: 'MALE' | 'FEMALE' only. Format with formatGender().

Generate these 4 screens. Complete TypeScript. StyleSheet only.

━━━ SCREEN 1: src/screens/profile/ProfileScreen.tsx ━━━
DATA: user from Redux auth state, dispatch(fetchProfileThunk()) on mount.

TOP: red header with avatar (initials), name, tanawId (gold), role + status chips.

CONTENT (3 info sections in white cards):
  "Personal na Impormasyon": First Name, Last Name, Middle Name,
    Date of Birth (formatDate), Gender (formatGender)
  "Tirahan": Barangay (user?.barangay?.name), Lungsod (user?.address?.city),
    Probinsya (user?.address?.province), Zip Code (user?.address?.zipCode)
  "Account": Email, Phone, Member Since (formatDate)

BUTTONS: "I-edit ang Profile" (Coming Soon) + "Mag-logout" (confirm → dispatch logoutThunk)

━━━ SCREEN 2: src/screens/services/ServicesScreen.tsx ━━━
Coming Soon placeholder with service chips grid.

━━━ SCREEN 3: src/screens/emergency/EmergencyScreen.tsx ━━━
Dark bg, alert level, map placeholder, emergency hotlines list.

━━━ SCREEN 4: src/screens/market/MarketScreen.tsx ━━━
Coming Soon placeholder for marketplace.

Return all 4 screen files. Complete TypeScript. StyleSheet only.
```

---

## STEP 11 — App.tsx + Run Guide

**Ano ito:** Root entry point at final setup.

---

**PROMPT 11:**

```
You are a senior React Native/TypeScript engineer.

Generate: App.tsx

import { Provider } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { store } from './src/store'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

Also generate .env.example:
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api/v1

Return both files.
```

---

## RUN GUIDE

```bash
# 1. I-configure ang .env
cp .env.example .env
# Palitan ang YOUR_LOCAL_IP ng actual IP mo
# Windows: ipconfig → IPv4 Address
# Mac: ifconfig en0 | grep inet
# Example: EXPO_PUBLIC_API_URL=http://192.168.1.5:3000/api/v1

# 2. I-start ang backend (sa tanaw-backend folder)
npm run dev

# 3. I-start ang frontend (sa tanaw-mobile folder)
npx expo start

# 4. I-scan ang QR code sa Expo Go app (phone)
# O kaya: press 'a' for Android emulator, 'i' for iOS simulator
```

---

## TEST FLOW

```
1. Open app → WelcomeScreen (red screen, "TANAW")
2. Tap "Mag-register" → RoleSelectScreen
3. Pick "City Resident" → RegisterScreen
4. Fill Step 1: name, birthdate, gender
5. Fill Step 2: email, phone, barangayCode (BGY-SALA-035)
6. Fill Step 3: password
7. Submit → Success! Shows TAN-RES-2026-XXXXX
8. Tap "Mag-login na" → LoginScreen
9. Enter email + password → Login
10. HomeScreen loads with real user data
11. Tap Digital Resident ID → Digital ID with QR
12. Tap Profile tab → real profile data
13. Tap any service icon → Coming Soon modal
14. Tap Logout → back to Welcome
```

---

## DEPENDENCIES (already installed)

```json
{
  "@reduxjs/toolkit": "^2.x",
  "react-redux": "^9.x",
  "axios": "^1.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "expo-secure-store": "^13.x",
  "react-native-qrcode-svg": "^6.x",
  "react-native-svg": "^15.x",
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "react-native-screens": "^3.x",
  "react-native-safe-area-context": "^4.x",
  "react-native-gesture-handler": "^2.x"
}
```

---

## TROUBLESHOOTING

```
"Cannot find module" errors:
→ npm install
→ npx expo install --fix

"SecureStore not available on web":
→ Normal — test sa device or simulator
→ npx expo start → scan QR sa Expo Go

"Metro bundler error":
→ npx expo start --clear

API connection error:
→ Backend server must be running (npm run dev sa tanaw-backend)
→ Hindi 'localhost' sa mobile — gamitin ang local IP
→ Palitan sa .env: EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api/v1
```

---

## CHECKLIST

```
STEP 1  ✅  constants + types + utils (6 files)
STEP 2  ✅  API client + auth.api + users.api (3 files)
STEP 3  ✅  Redux store + slices (3 files)
STEP 4  ✅  Navigation (3 files)
STEP 5  ✅  Common components (5 files)
STEP 6  ✅  Home components (4 files)
STEP 7  ✅  Home Screen (1 file)
STEP 8  ✅  Auth screens — Welcome, RoleSelect, Register, Login (4 files)
STEP 9  ✅  Digital ID Screen (1 file)
STEP 10 ✅  Profile + placeholder screens (4 files)
STEP 11 ✅  App.tsx + .env.example (2 files)

Total: ~36 files
Phase 1 Frontend: READY TO BUILD
Connected sa Phase 1 Backend ✅
```

---

*TANAW One App · Frontend Backbone · Phase 1 · City of Tanauan, Batangas*
