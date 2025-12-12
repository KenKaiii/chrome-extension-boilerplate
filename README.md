# Chrome Extension Boilerplate

A production-ready Chrome Extension template using **Manifest V3**, **TypeScript**, **React**, **Vite**, and **Tailwind CSS**.

**Author:** Ken Kai
**YouTube:** [@kenkaidoesai](https://www.youtube.com/@kenkaidoesai)
**Skool:** [www.skool.com/kenkai](https://www.skool.com/kenkai)

## Features

- **Manifest V3** - Latest Chrome extension standard
- **TypeScript** - Full type safety throughout
- **React 18** - Modern UI components
- **Vite + CRXJS** - Fast builds with HMR support
- **Tailwind CSS** - Utility-first styling
- **Type-safe Messaging** - Communication between background, content, and popup
- **Type-safe Storage** - Chrome storage with TypeScript interfaces
- **Complete Structure** - Background worker, content script, popup, and options page

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Chrome Browser** ([Download](https://www.google.com/chrome/))

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR-USERNAME/chrome-extension-boilerplate.git
cd chrome-extension-boilerplate
npm install
```

### 2. Development Mode

```bash
npm run dev
```

This starts Vite in watch mode with hot reload.

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist` folder in your project

The extension will now appear in your toolbar!

### 4. Build for Production

```bash
npm run build
```

This creates an optimized `dist` folder ready for Chrome Web Store submission.

## Project Structure

```
├── public/
│   └── icons/           # Extension icons (16, 32, 48, 128px)
├── src/
│   ├── background/      # Service worker (background script)
│   │   └── index.ts
│   ├── content/         # Content script (runs on web pages)
│   │   ├── index.ts
│   │   └── content.css
│   ├── popup/           # Popup UI (extension toolbar)
│   │   ├── popup.html
│   │   ├── main.tsx
│   │   ├── Popup.tsx
│   │   └── popup.css
│   ├── options/         # Options page (full-page settings)
│   │   ├── options.html
│   │   ├── main.tsx
│   │   ├── Options.tsx
│   │   └── options.css
│   └── lib/             # Shared utilities
│       ├── storage.ts   # Type-safe Chrome storage
│       ├── messaging.ts # Type-safe message passing
│       └── index.ts
├── manifest.json        # Extension manifest (MV3)
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## Customization

### Change Extension Name and Description

Edit `manifest.json`:

```json
{
  "name": "Your Extension Name",
  "description": "Your extension description"
}
```

### Replace Icons

Replace the PNG files in `public/icons/` with your own:
- `icon-16.png` - 16x16px
- `icon-32.png` - 32x32px
- `icon-48.png` - 48x48px
- `icon-128.png` - 128x128px

### Add Permissions

Edit `manifest.json` to add Chrome API permissions:

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "tabs",           // Add more as needed
    "notifications"
  ]
}
```

### Modify Storage Schema

Edit `src/lib/storage.ts` to add your own storage types:

```typescript
export interface StorageSchema {
  settings: {
    enabled: boolean;
    // Add your settings here
  };
  // Add more storage keys here
}
```

### Add New Message Types

Edit `src/lib/messaging.ts` to add communication channels:

```typescript
export interface MessageTypes {
  YOUR_MESSAGE: {
    request: { /* your request data */ };
    response: { /* your response data */ };
  };
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Chrome Extension Architecture

### Background Script (Service Worker)
- Runs in the background
- Handles events, alarms, and message routing
- Cannot access DOM
- Located in `src/background/`

### Content Script
- Runs in web page context
- Can access and modify page DOM
- Limited Chrome API access
- Located in `src/content/`

### Popup
- Shows when clicking extension icon
- React-based UI
- Full Chrome API access
- Located in `src/popup/`

### Options Page
- Full-page settings interface
- Opens in new tab
- Full Chrome API access
- Located in `src/options/`

## Publishing to Chrome Web Store

1. Build the extension: `npm run build`
2. Zip the `dist` folder
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Pay one-time $5 developer fee
5. Upload your zip file
6. Fill in listing details
7. Submit for review

## Troubleshooting

### Extension not updating?
1. Go to `chrome://extensions/`
2. Click the refresh icon on your extension
3. Or remove and re-load the unpacked extension

### Hot reload not working?
- Make sure `npm run dev` is running
- Check the terminal for errors
- Try reloading the extension manually

### Content script not running?
- Check `manifest.json` matches patterns
- Ensure the page URL matches `content_scripts.matches`
- Check Chrome DevTools console for errors

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin/)
- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore/publish/)

## License

MIT License - Feel free to use this template for any project!
