import * as TaskManager from 'expo-task-manager';
import notifee, { AndroidImportance, AndroidColor, EventType } from '@notifee/react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { NativeModules, DeviceEventEmitter } from 'react-native';
const { FloatingAlert, FlashlightModule, WallpaperModule, PowerModule } = NativeModules;
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Asset } from 'expo-asset';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ejqrvmkjypdfqiiwyxkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcXJ2bWtqeXBkZnFpaXd5eGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzM0NDEsImV4cCI6MjA4MzUwOTQ0MX0.sDOLfczDLK4RNIHFLP-kG1_rnZNWhE4XFImruLBr8oA';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const DEVICE_ID = Constants.sessionId || Device.modelId || '1';

const CHANNEL_ID_ALERT = 'xnuver_critical_alert';
const BACKGROUND_TASK_NAME = 'XNUVER_BACKGROUND_POLLING';

// Native modules already declared at line 6
// Track last processed command ID to avoid duplicates
let lastCommandId = 0;

// Sound reference for background playback
let backgroundSound = null;

// Map asset requirements
const AUDIO_ASSETS = {
    'jetset.mp3': require('./assets/audio/jetset.mp3'),
    'hidup_jokowi.mp3': require('./assets/audio/hidup_jokowi.mp3')
};

/**
 * Background Task Definition
 * This runs even when app is closed/backgrounded
 */
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    try {
        console.log('[BG_TASK] Task triggered');
        await checkForCommands();
        return TaskManager.TaskResult.Success;
    } catch (error) {
        console.error('[BG_TASK] Error:', error);
        return TaskManager.TaskResult.Failed;
    }
});

// Setup Audio Mode globally for this process
const setupAudio = async () => {
    try {
        await Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
        });
    } catch (e) {
        console.error('[BG_TASK] Audio setup error:', e);
    }
};

// --- NOTIFEE FOREGROUND SERVICE REGISTRATION ---
// This is critical to keep the process alive!
notifee.registerForegroundService((notification) => {
    return new Promise(() => {
        console.log('[BG_TASK] Service Task Registered and Running');
        // We don't resolve this promise to keep the service running infinitely
        // Until the user manually stops it via notifee.stopForegroundService()
    });
});

// Handle events when the app is in background/killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    if (type === EventType.ACTION_PRESS && pressAction?.id === 'stop_service') {
        console.log('[BG_TASK] User requested stop');
        await notifee.stopForegroundService();
        await notifee.cancelNotification(notification.id);
    }
});

setupAudio();

/**
 * Poll Supabase for new commands
 */
const checkForCommands = async () => {
    try {
        const response = await fetch(
            `${SUPABASE_REST_URL}/commands?device_id=eq.${DEVICE_ID}&order=id.desc&limit=1`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            }
        );

        if (response.ok) {
            const commands = await response.json();
            if (commands.length > 0) {
                const cmd = commands[0];

                // Only process new commands
                if (cmd.id > lastCommandId) {
                    lastCommandId = cmd.id;
                    console.log('[BG_TASK] New command:', cmd.command);
                    await executeCommand(cmd.command, cmd.payload || {});
                }
            }
        }
    } catch (error) {
        console.error('[BG_TASK] Polling error:', error);
    }
};

/**
 * Execute command in background
 */
const executeCommand = async (command, payload) => {
    console.log('[BG_TASK] Executing:', command, payload);

    // Notify UI if it's listening
    DeviceEventEmitter.emit('XNUVER_COMMAND_RECEIVED', { command, payload });

    switch (command) {
        case 'FLASHLIGHT_ON':
            try {
                if (FlashlightModule) {
                    FlashlightModule.turnOn();
                } else {
                    console.warn('[BG_TASK] FlashlightModule not available');
                }
            } catch (e) {
                console.error('[BG_TASK] Flashlight ON error:', e);
            }
            break;

        case 'FLASHLIGHT_OFF':
            try {
                if (FlashlightModule) {
                    FlashlightModule.turnOff();
                } else {
                    console.warn('[BG_TASK] FlashlightModule not available');
                }
            } catch (e) {
                console.error('[BG_TASK] Flashlight OFF error:', e);
            }
            break;

        case 'ALERT_SHOW':
            try {
                // 1. Try Native Overlay (Floating Window)
                if (FloatingAlert) {
                    FloatingAlert.show(
                        payload.title || 'SYSTEM ALERT',
                        payload.message || 'High Priority Message'
                    );
                }

                // 2. Backup: Full-screen notification
                await displayFullScreenAlert(payload);
            } catch (e) {
                console.error('[BG_TASK] Alert error:', e);
            }
            break;

        case 'TTS_SPEAK':
            try {
                if (payload.text) {
                    Speech.speak(payload.text, {
                        language: 'id',
                        pitch: 1.0,
                        rate: 1.0
                    });
                }
            } catch (e) {
                console.error('[BG_TASK] TTS error:', e);
            }
            break;

        case 'MUSIC_PLAY_JETSET':
        case 'MUSIC_PLAY_JOKOWI':
            try {
                const audioFileName = command === 'MUSIC_PLAY_JETSET' ? 'jetset.mp3' : 'hidup_jokowi.mp3';

                // Stop any currently playing sound
                if (backgroundSound) {
                    try {
                        await backgroundSound.stopAsync();
                        await backgroundSound.unloadAsync();
                    } catch (e) {
                        console.warn('[BG_TASK] Error stopping previous sound:', e);
                    }
                }

                console.log('[BG_TASK] Starting background music:', audioFileName);

                const source = AUDIO_ASSETS[audioFileName];
                const { sound } = await Audio.Sound.createAsync(source, {
                    shouldPlay: true,
                    volume: 1.0,
                    isLooping: false,
                    androidImplementation: 'MediaPlayer'
                });

                backgroundSound = sound;

                // Ensure it plays in background
                await backgroundSound.setStatusAsync({ playsInSilentModeIOS: true });

                backgroundSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        backgroundSound.unloadAsync();
                        backgroundSound = null;
                    }
                });

            } catch (e) {
                console.error('[BG_TASK] Music playback error:', e);
            }
            break;

        case 'MUSIC_STOP':
            try {
                if (backgroundSound) {
                    await backgroundSound.stopAsync();
                    await backgroundSound.unloadAsync();
                    backgroundSound = null;
                }
            } catch (e) {
                console.error('[BG_TASK] Music stop error:', e);
            }
            break;

        case 'WALLPAPER_SET':
            try {
                if (WallpaperModule && payload.url) {
                    console.log('[BG_TASK] Setting wallpaper:', payload.url);
                    const result = await WallpaperModule.setWallpaper(payload.url);
                    console.log('[BG_TASK]', result);
                } else {
                    console.warn('[BG_TASK] WallpaperModule not available or URL missing');
                }
            } catch (e) {
                console.error('[BG_TASK] Wallpaper error:', e);
            }
            break;

        default:
            console.log('[BG_TASK] Unknown command:', command);
    }
};

/**
 * Display full-screen notification alert
 */
const displayFullScreenAlert = async (payload) => {
    try {
        await notifee.displayNotification({
            title: payload.title || 'SYSTEM ALERT',
            body: payload.message || 'High Priority Message Received',
            android: {
                channelId: CHANNEL_ID_ALERT,
                importance: AndroidImportance.HIGH,
                fullScreenAction: {
                    id: 'default',
                    launchActivity: 'default',
                },
                pressAction: {
                    id: 'default',
                    launchActivity: 'default',
                },
                lightUpScreen: true,
                sound: 'default',
                color: AndroidColor.RED,
                vibrationPattern: [300, 500, 300, 500],
            },
        });
        console.log('[BG_TASK] Full-screen alert displayed');
    } catch (e) {
        console.error('[BG_TASK] Full-screen alert error:', e);
    }
};

/**
 * Register background task with interval
 */
export const registerBackgroundTask = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);

        if (!isRegistered) {
            // Note: expo-task-manager with background fetch requires specific setup
            // For now, we'll use a different approach with foreground service
            console.log('[BG_TASK] Task registration attempted');
        } else {
            console.log('[BG_TASK] Task already registered');
        }
    } catch (error) {
        console.error('[BG_TASK] Registration error:', error);
    }
};

// Track interval locally
let activeIntervalId = null;

/**
 * Start background polling (called when foreground service starts)
 */
export const startBackgroundPolling = () => {
    if (activeIntervalId) {
        console.log('[BG_TASK] Polling already active');
        return activeIntervalId;
    }

    console.log('[BG_TASK] Starting background polling interval');

    // Acquire WakeLock to keep CPU awake
    if (PowerModule) {
        PowerModule.acquireWakeLock();
        console.log('[BG_TASK] CPU WakeLock acquired');
    }

    // Poll every 2 seconds
    activeIntervalId = setInterval(async () => {
        await checkForCommands();
    }, 2000);

    return activeIntervalId;
};

/**
 * Stop background polling
 */
export const stopBackgroundPolling = () => {
    if (activeIntervalId) {
        clearInterval(activeIntervalId);
        activeIntervalId = null;

        if (PowerModule) {
            PowerModule.releaseWakeLock();
            console.log('[BG_TASK] CPU WakeLock released');
        }

        console.log('[BG_TASK] Polling stopped');
    }
};

/**
 * Export for use in other modules
 */
export { BACKGROUND_TASK_NAME, checkForCommands, executeCommand };
