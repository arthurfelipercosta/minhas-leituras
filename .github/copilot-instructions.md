# Minhas Leituras - AI Coding Guidelines

## Architecture Overview

**React Native Expo app** for managing reading progress (books/manga). Core architecture:
- **Frontend**: React Native with Expo, TypeScript, React Navigation
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State**: Context API (AuthContext, ThemeContext, SubscriptionContext)
- **Storage**: AsyncStorage for local data, Firebase for cloud sync
- **Styling**: Theme-aware components using `colors.ts` with light/dark modes

## Key Patterns & Conventions

### Path Mapping
- Use `@/` prefix for `src/` imports (configured in `tsconfig.json`)
- Example: `import { Title } from '@/types'`

### Theme System
- Colors defined in `src/styles/colors.ts` with `light` and `dark` objects
- Access via: `const { theme } = useTheme(); const themeColors = colors[theme]`
- All components must be theme-aware

### Data Models
- `Title` interface in `src/types.ts` - core entity with chapters, URLs, thumbnails
- `UserProfile` interface for Firestore user data
- `Plan` interface for subscription tiers

### Firebase Integration
- Security rules in `firestore.rules` ensure user data isolation (`userTitles/{userId}`)
- Auth initialized with React Native persistence in `src/config/firebaseConfig.ts`
- Sync service merges local/cloud data by `lastUpdate` timestamp

### Component Structure
- Screens in `src/screens/` with navigation integration
- Reusable components in `src/components/`
- Services in `src/services/` handle business logic
- Contexts in `src/context/` manage global state

### Navigation
- Native Stack Navigator with typed routes (`RootStackParamList` in `App.tsx`)
- Theme-aware navigation colors
- Header buttons for theme toggle and profile actions

## Critical Workflows

### Data Sync
- Local storage via `storageServices.ts` functions (`getTitles`, `saveTitles`)
- Cloud sync via `syncService.ts` (`syncTitlesToFirebase`, `syncTitlesFromFirebase`)
- Merge strategy: newer `lastUpdate` wins for conflicts

### Authentication Flow
- Firebase Auth with email/password
- User state managed by `AuthContext`
- Automatic auth state persistence

### Image Handling
- Firebase Storage for cover/thumbnail images
- `imageUploadService.ts` handles uploads/downloads
- Images referenced by `coverUri` and `thumbnailUri` in Title objects

### Build & Deploy
- Development: `npm start` or `expo start`
- Production builds: `eas build --profile production --platform android`
- Firebase deploy: `firebase deploy` (functions, rules, indexes)

## Common Patterns

### Error Handling
- Use `Toast.show()` for user notifications
- Firebase errors caught and displayed via Toast
- Async operations wrapped in try/catch

### Settings Management
- User preferences stored locally via `getSettings`/`saveSettings`
- Tap actions configurable: 'edit', 'copy_url', 'open_url'

### Component Props
- Theme colors passed as props to styled components
- Callback functions for user interactions
- Loading states with `ActivityIndicator`

### Data Validation
- Chapter numbers can be decimal (e.g., 1.5)
- URLs optional, validated before opening
- Release days: 0=Sunday, 1=Monday, ..., 6=Saturday

## File Organization Reference

```
src/
├── components/     # Reusable UI components
├── context/        # React Context providers
├── screens/        # Navigation screens
├── services/       # Business logic & external APIs
├── config/         # Firebase & app configuration
├── styles/         # Theme colors & styling
└── types.ts        # TypeScript interfaces
```

## Development Tips

- Always test theme switching (light/dark modes)
- Verify offline functionality with AsyncStorage
- Test Firebase sync after auth state changes
- Use Expo Go for development testing
- Check Toast messages for user feedback
- Validate navigation flows between screens