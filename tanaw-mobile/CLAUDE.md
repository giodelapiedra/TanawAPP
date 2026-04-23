# TANAW One App Frontend

React Native / Expo frontend for Tanauan City super-app. Phase 1.

## Stack

React Native, Expo SDK 52, TypeScript, Redux Toolkit, React Navigation 6,
Axios, react-hook-form + zod, expo-secure-store, react-native-qrcode-svg.

## Quick Commands

```bash
npx expo start              # Start Metro bundler
npx expo start --clear      # Start with cache clear
npm run android              # Run on Android
npm run ios                  # Run on iOS (macOS only)
```

## Architecture

```
src/constants/    → COLORS, SPACING, RADIUS, FONT_SIZE (design tokens)
src/types/        → User, Navigation param types
src/utils/        → storage (SecureStore), format (date, name, role)
src/api/          → Axios client with auto-refresh, auth.api, users.api
src/store/slices/ → authSlice (login/logout/tokens), userSlice (profile/digitalId)
src/hooks/        → useAuth convenience hook
src/components/   → common/ (Button, Input, Modal), home/ (ServiceGrid, etc), id-card/
src/screens/      → auth/ (Welcome, RoleSelect, Register, Login), home/, profile/, etc
src/navigation/   → RootNavigator, AuthNavigator, MainNavigator
```

## Frontend Rules

- F1: StyleSheet.create() only. Colors from constants. No inline styles.
- F2: Typed Props on every component. No `any`. No direct API calls.
- F3: Redux Toolkit + typed hooks (useAppDispatch, useAppSelector).
- F4: All API through src/api/. Interceptors handle auth. Functions return unwrapped data.
- F5: Typed navigation params. Root switches Auth vs Main.
- F6: Tokens in SecureStore. Login stores, logout clears, app start checks.
- F7: react-hook-form + zod for all forms.
- F8: ComingSoonModal for unimplemented features.
- F9: Backend returns barangay as RELATION OBJECT, not string. Use `user.barangay?.name`.
- F10: PascalCase screens/components. camelCase hooks/utils/api.

## Backend Connection

Base URL: `EXPO_PUBLIC_API_URL` env var (default: http://localhost:3000/api/v1)
All responses: `{ success, message, data }` — API functions unwrap to `data`.
Login uses `identifier` (email/phone/tanawId) not just email.
Register sends `barangayCode` (e.g., "BGY-SALA-035") not free text.
Gender: MALE | FEMALE only (dalawa lang, walang iba).
