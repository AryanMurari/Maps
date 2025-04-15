

# 🌐 Platform-Specific Component Files in React Native with Expo

This project uses platform-specific extensions (`.native.tsx`, `.web.tsx`, etc.) to render different components based on the target platform (iOS, Android, or Web). Expo and React Native support this feature out of the box through Metro bundler.

---

## 📁 Folder Structure Overview

```
project-root/
│
├── app/
│   ├── _layout.tsx          # Common layout for all platforms
│   └── index.tsx            # Main entry point
│
├── components/
│   ├── Maps.native.tsx      # Shared component for iOS + Android
│   └── Maps.web.tsx         # Component specifically for Web
│
├── .env                     # Environment variables
├── app.json                 # Expo configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🧠 How It Works

React Native supports resolving platform-specific modules automatically based on the platform:

| Extension      | Platform      |
| -------------- | ------------- |
| `.ios.tsx`     | iOS only      |
| `.android.tsx` | Android only  |
| `.native.tsx`  | iOS + Android |
| `.web.tsx`     | Web only      |

When you import a file like:

```tsx
import Maps from '../components/Maps';
```

The bundler automatically chooses the correct file depending on the platform:

- On Android/iOS, it will pick `Maps.native.tsx`
- On Web, it will pick `Maps.web.tsx`

---

## ✅ Benefits

- Clean imports – no need to conditionally check platform using `Platform.OS`
- Better separation of platform-specific logic
- Improves readability and maintainability

---

## ⚙️ Expo Support

This setup works seamlessly with Expo because:

- Expo uses the Metro bundler which supports platform-specific extensions.
- No extra configuration is needed.
