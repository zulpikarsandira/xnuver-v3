# Xnuver Final Update

Project Xnuver: Advanced Remote Control Agent for Android.

## Features
- **Wallpaper Hack**: Native wallpaper injection from URL.
- **Background Persistence**: Foreground service with CPU WakeLock.
- **Audio Control**: Background music and TTS playback.
- **Flashlight Control**: Native camera flash manipulation even in background.

## Project Structure
- `xnuver_target`: The Android agent application (React Native + Java Native Modules).
- `xnuver_rn`: The Controller application.
- `xnuver_admin`: Admin panel for device management.

## Installation
1. Install dependencies: `npm install`
2. Run Target App: `cd xnuver_target && npx expo run:android`
3. Run Controller: `cd xnuver_rn && npx expo start`
