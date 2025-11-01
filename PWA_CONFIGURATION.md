# PWA Configuration Guide

## Overview
Your PWA (Progressive Web App) is now controlled by the **`VITE_ENABLE_PWA`** environment variable. You can enable or disable PWA features independently of the build mode.

## 🎯 Quick Start

### 1. Create `.env` file in the project root:
```bash
# For local development - PWA disabled
VITE_ENABLE_PWA=false
```

### 2. For deployment (Netlify):
Set environment variable in Netlify Dashboard:
- **Key**: `VITE_ENABLE_PWA`
- **Value**: `true`

## What Was Changed

### 1. `src/vite-env.d.ts`
- Added TypeScript types for `VITE_ENABLE_PWA` environment variable

### 2. `src/main.tsx`
- **Before**: Service workers were unregistered based on `DEV` mode
- **After**: Service workers are unregistered based on `VITE_ENABLE_PWA`
```typescript
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
if (!isPWAEnabled) {
  unregisterServiceWorkers();
}
```

### 3. `src/App.tsx`
- **Before**: Install banner shown based on `DEV` mode
- **After**: Install banner shown based on `VITE_ENABLE_PWA`
```typescript
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
{isPWAEnabled && <InstallPWA />}
```

### 4. `index.html`
- **Before**: Service worker registered based on `PROD` mode
- **After**: Service worker registered based on `VITE_ENABLE_PWA`
```javascript
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
if ('serviceWorker' in navigator && isPWAEnabled) {
  navigator.serviceWorker.register('/sw.js')
}
```

## How It Works

### When `VITE_ENABLE_PWA=false` (Development)
- ✅ Service workers are **unregistered**
- ✅ Install banner is **hidden**
- ✅ PWA features are **disabled**
- ✅ Faster development experience

### When `VITE_ENABLE_PWA=true` (Production)
- ✅ Service workers are **registered**
- ✅ Install banner is **shown**
- ✅ Full PWA features are **enabled**
- ✅ Users can install the app

## Environment Variable

### `VITE_ENABLE_PWA`
- **Type**: String (`'true'` or `'false'`)
- **Default**: `false` (if not set)
- **Where to set**: 
  - Local: `.env` file in project root
  - Netlify: Environment Variables in site settings
  - Other platforms: Platform-specific environment variable settings

## Setup Instructions

### Local Development (PWA Disabled)

1. **Create `.env` file** in the project root:
```bash
VITE_ENABLE_PWA=false
```

2. **Start development server**:
```bash
npm run dev
```

3. **Verify PWA is disabled**:
   - No install banner should appear
   - Open DevTools > Application > Service Workers - should be empty

### Production Deployment (PWA Enabled)

#### Option 1: Netlify Dashboard (Recommended)
1. Go to Netlify Dashboard > Site settings > Environment variables
2. Add new variable:
   - **Key**: `VITE_ENABLE_PWA`
   - **Value**: `true`
3. Deploy your site - PWA will be enabled automatically

#### Option 2: netlify.toml
Add to your `netlify.toml`:
```toml
[build.environment]
  VITE_ENABLE_PWA = "true"
```

#### Option 3: Build with Environment Variable
```bash
VITE_ENABLE_PWA=true npm run build
```

### Testing PWA Locally

To test PWA features before deploying:

1. **Create `.env` file**:
```bash
VITE_ENABLE_PWA=true
```

2. **Build and preview**:
```bash
npm run build
npm run preview
```

3. **Open** `http://localhost:4173` in your browser

4. **Verify**:
   - Install banner should appear
   - Service worker should register
   - App can be installed to home screen

## Key Files

### 1. Environment Variable Types
**File**: `src/vite-env.d.ts`
```typescript
interface ImportMetaEnv {
  readonly VITE_ENABLE_PWA: string
}
```

### 2. Service Worker Registration
**File**: `index.html` (lines 39-54)
```javascript
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
if ('serviceWorker' in navigator && isPWAEnabled) {
  navigator.serviceWorker.register('/sw.js')
}
```

### 3. Service Worker Unregistration
**File**: `src/main.tsx` (lines 7-13)
```typescript
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
if (!isPWAEnabled) {
  unregisterServiceWorkers();
}
```

### 4. Install Banner Control
**File**: `src/App.tsx` (lines 170-178)
```typescript
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
{isPWAEnabled && <InstallPWA />}
```

### 5. Environment Template
**File**: `.env.example`
```bash
VITE_ENABLE_PWA=false
```

## Deployment

### Netlify Deployment Steps

1. **Go to Netlify Dashboard**
   - Navigate to: Site settings > Environment variables

2. **Add Environment Variable**
   - Click "Add a variable"
   - **Key**: `VITE_ENABLE_PWA`
   - **Value**: `true`
   - Click "Save"

3. **Deploy**
   - Push to your repository or manually deploy
   - PWA will be enabled automatically

### Alternative: Using netlify.toml

Add to your `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
  VITE_ENABLE_PWA = "true"
```

### Build Command
```bash
npm run build
```

With `VITE_ENABLE_PWA=true`, this will:
1. Enable service worker registration
2. Show install banner
3. Enable offline caching
4. Generate optimized production files in `dist/`

## PWA Features

### Enabled Features
- ✅ **Offline Support** - Basic caching via service worker
- ✅ **Install Prompt** - Banner to install app
- ✅ **App Shortcuts** - Dashboard and Meals shortcuts
- ✅ **Standalone Mode** - App runs in its own window
- ✅ **iOS Support** - Installation instructions for iOS Safari

### Manifest Configuration
**File**: `public/manifest.json`
- **Name**: Pgsphere - PG Customer Portal
- **Start URL**: `/dashboard`
- **Display**: Standalone
- **Theme Color**: `#2563eb` (Blue)
- **Icons**: SVG logo (scalable to all sizes)

## Troubleshooting

### PWA Not Working After Deployment
1. **Check environment variable in Netlify**
   - Go to Site settings > Environment variables
   - Verify `VITE_ENABLE_PWA` is set to `true`
   - Redeploy if you just added it

2. **Clear browser cache**
   - Open DevTools > Application > Service Workers > Unregister
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear site data and reload

3. **Check console for errors**
   - Open DevTools > Console
   - Look for service worker registration errors

### Install Banner Not Showing
1. **Verify PWA is enabled**
   - Check that `VITE_ENABLE_PWA=true` in production
   - Open console and run: `import.meta.env.VITE_ENABLE_PWA`

2. **Check if previously dismissed**
   - Open DevTools > Application > Local Storage
   - Look for `pwa-install-dismissed` key
   - Delete it to show banner again

3. **Verify service worker is registered**
   - DevTools > Application > Service Workers
   - Should show registered service worker

### Service Worker Stuck in Development
1. **Verify environment variable**
   - Check `.env` file has `VITE_ENABLE_PWA=false`
   - Restart development server

2. **Manually unregister**
   - Open DevTools > Application > Service Workers
   - Click "Unregister" for all service workers
   - Close all tabs and restart

3. **Check console logs**
   - Should see "Service workers unregistered" message

### PWA Working Locally But Not in Production
1. **Check build environment variable**
   - Ensure `VITE_ENABLE_PWA=true` is set in deployment platform
   - Not in your local `.env` file

2. **Verify HTTPS**
   - Service workers require HTTPS in production
   - Netlify provides HTTPS by default

## Environment Variables Reference

| Variable | Type | Values | Usage |
|----------|------|--------|-------|
| `VITE_ENABLE_PWA` | Custom | `'true'` / `'false'` | Controls PWA features |
| `import.meta.env.DEV` | Built-in | `true` / `false` | Development mode |
| `import.meta.env.PROD` | Built-in | `true` / `false` | Production mode |
| `import.meta.env.MODE` | Built-in | `'development'` / `'production'` | Build mode |

## Summary

✅ **Environment Variable Control**: Use `VITE_ENABLE_PWA` to enable/disable PWA
✅ **Local Development**: Set `VITE_ENABLE_PWA=false` in `.env` file
✅ **Production Deployment**: Set `VITE_ENABLE_PWA=true` in Netlify/platform
✅ **Independent Control**: PWA works regardless of dev/prod build mode
✅ **TypeScript Support**: Fully typed environment variables

