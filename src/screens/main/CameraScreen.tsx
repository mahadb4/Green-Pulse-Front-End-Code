import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [isCapturing, setIsCapturing] = useState(false);
    const [isPickingGallery, setIsPickingGallery] = useState(false);
    const [lastGalleryThumb, setLastGalleryThumb] = useState<string | null>(null);

    const cameraRef = useRef<CameraView>(null);
    const videoRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);

    const insets = useSafeAreaInsets();

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scannerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (Platform.OS === 'web') {
            setupWebCamera();
        }
        
        // Shutter pulse loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true, easing: Easing.ease }),
                Animated.timing(pulseAnim, { toValue: 1.0,  duration: 1000, useNativeDriver: true, easing: Easing.ease }),
            ])
        ).start();

        // AI Scanner line loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(scannerAnim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
                Animated.timing(scannerAnim, { toValue: 0, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
            ])
        ).start();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setupWebCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const handleClose = () => {
        if (navigation && navigation.goBack) navigation.goBack();
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    // ─── Camera Capture ───────────────────────────────────────────────────────
    const handleCapture = async () => {
        if (isCapturing) return;
        const { points } = navigation.getState().routes.find((r: any) => r.name === 'Camera')?.params || {};

        if (Platform.OS === 'web') {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas) {
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                navigation.navigate('PhotoPreview', { photoUri: dataUrl, points });
            }
            return;
        }

        if (cameraRef.current) {
            setIsCapturing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.85,
                    base64: false,
                    exif: false,
                });
                if (navigation && navigation.navigate && photo) {
                    navigation.navigate('PhotoPreview', { photoUri: photo.uri, points });
                }
            } catch (error) {
                console.error('Failed to take photo', error);
                Alert.alert('Capture Failed', 'Could not take photo. Please try again.');
            } finally {
                setIsCapturing(false);
            }
        }
    };

    // ─── Gallery Picker ───────────────────────────────────────────────────────
    const handlePickGallery = async () => {
        if (isPickingGallery) return;
        const { points } = navigation.getState().routes.find((r: any) => r.name === 'Camera')?.params || {};

        // Request media library permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Photo Library Access Required',
                'GreenPulse needs access to your photo library to upload eco-action photos. Please enable it in your device Settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => {
                        // On iOS this opens app settings; on Android it opens the app info page
                        // expo-linking can deep-link to settings but ImagePicker handles this gracefully
                    }},
                ]
            );
            return;
        }

        setIsPickingGallery(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],   // Square crop for consistent AI analysis
                quality: 0.85,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setLastGalleryThumb(asset.uri);
                navigation.navigate('PhotoPreview', { photoUri: asset.uri, points });
            }
        } catch (err) {
            console.error('[CameraScreen] Gallery pick error:', err);
            Alert.alert('Error', 'Could not open photo library. Please try again.');
        } finally {
            setIsPickingGallery(false);
        }
    };

    // ─── Permission Denied State ─────────────────────────────────────────────
    if (Platform.OS !== 'web') {
        if (!permission) {
            // Permissions still loading
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#38ad32" style={{ flex: 1 }} />
                </View>
            );
        }

        if (!permission.granted) {
            return (
                <View style={styles.permissionContainer}>
                    <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
                    <View style={[styles.permissionSafeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                        <TouchableOpacity style={styles.permCloseButton} onPress={handleClose}>
                            <Text style={styles.permCloseText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.permContent}>
                            <View style={styles.permIconCircle}>
                                <Text style={styles.permIconText}>📷</Text>
                            </View>
                            <Text style={styles.permTitle}>Camera Access Needed</Text>
                            <Text style={styles.permSubtitle}>
                                GreenPulse needs camera access to capture your eco-actions for AI verification and reward processing.
                            </Text>

                            <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
                                <Text style={styles.permButtonText}>Allow Camera Access</Text>
                            </TouchableOpacity>

                            <Text style={styles.permOrText}>— or —</Text>

                            {/* Let users pick from gallery even without camera */}
                            <TouchableOpacity
                                style={[styles.permButton, styles.permButtonSecondary]}
                                onPress={handlePickGallery}
                                disabled={isPickingGallery}
                            >
                                {isPickingGallery ? (
                                    <ActivityIndicator size="small" color="#006e09" />
                                ) : (
                                    <Text style={styles.permButtonTextSecondary}>Choose from Gallery</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }
    }

    // ─── Main Camera UI ───────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            {/* Camera Viewport */}
            <View style={styles.cameraViewport}>
                {Platform.OS === 'web' ? (
                    <View style={styles.webCameraContainer}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </View>
                ) : (
                    <CameraView
                        ref={cameraRef}
                        style={styles.cameraFrame}
                        facing={facing}
                        autofocus="on"
                    />
                )}
                {/* Vignette Overlay */}
                <View style={styles.vignetteOverlay} />
            </View>

            {/* UI Overlay Layer */}
            <View style={[styles.overlayLayer, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
                        <Text style={styles.iconText}>✕</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.aiBadgeTop}>
                        <Text style={styles.aiBadgeDot}>●</Text>
                        <Text style={styles.aiBadgeText}>ZARA VISION AI</Text>
                    </View>

                    <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                        <Text style={styles.iconText}>🔄</Text>
                    </TouchableOpacity>
                </View>

                {/* Framing Guide */}
                <View style={styles.framingContainer}>
                    <View style={styles.framingBox}>
                        {/* Corner Indicators */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />

                        {/* Scanner Line Animation */}
                        <Animated.View style={[styles.scannerLaser, {
                            transform: [{
                                translateY: scannerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-140, 140] // Sweeps across the 280px framing box
                                })
                            }]
                        }]} />

                        {/* Center Target */}
                        <View style={styles.targetCrosshair}>
                            <View style={styles.targetHorizontal} />
                            <View style={styles.targetVertical} />
                        </View>
                    </View>

                    {/* Instruction Overlay */}
                    <View style={styles.instructionContainer}>
                        <View style={styles.instructionGlass}>
                            <Text style={styles.instructionIcon}>🤖</Text>
                            <View>
                                <Text style={styles.instructionTitle}>Center the eco-action</Text>
                                <Text style={styles.instructionDesc}>AI requires clear lighting</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <View style={styles.controlsRow}>

                        {/* Gallery Button */}
                        <TouchableOpacity
                            style={styles.galleryButton}
                            onPress={handlePickGallery}
                            disabled={isPickingGallery}
                            activeOpacity={0.7}
                        >
                            {isPickingGallery ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : lastGalleryThumb ? (
                                <Image source={{ uri: lastGalleryThumb }} style={styles.galleryImage} />
                            ) : (
                                <View style={styles.galleryPlaceholder}>
                                    <Text style={styles.galleryPlaceholderIcon}>🖼️</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Shutter Button */}
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                style={[styles.shutterButton, isCapturing && { opacity: 0.6 }]}
                                onPress={handleCapture}
                                activeOpacity={0.8}
                                disabled={isCapturing}
                            >
                                {isCapturing ? (
                                    <ActivityIndicator size="large" color="#4ADE80" />
                                ) : (
                                    <View style={styles.shutterInner}>
                                        <View style={styles.shutterCore} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Help / Spacer */}
                        <View style={styles.helpButton}>
                            <Text style={styles.helpIcon}>🌱</Text>
                        </View>
                    </View>

                    {/* Bottom hint */}
                    <Text style={styles.hintText}>Tap shutter to capture · Tap 🖼️ for gallery</Text>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // ── Permission Screen ──
    permissionContainer: {
        flex: 1,
        backgroundColor: '#F0FFF4',
    },
    permissionSafeArea: {
        flex: 1,
    },
    permCloseButton: {
        marginTop: 16,
        marginLeft: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(20, 83, 45, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    permCloseText: {
        color: '#14532D',
        fontSize: 16,
        fontWeight: '900',
    },
    permContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    permIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(74, 222, 128, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    permIconText: {
        fontSize: 48,
    },
    permTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#14532D',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    permSubtitle: {
        fontSize: 16,
        color: '#166534',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 8,
        fontWeight: '500',
        opacity: 0.8,
    },
    permButton: {
        width: '100%',
        paddingVertical: 16,
        backgroundColor: '#14532D',
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#14532D',
    },
    permButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    permButtonTextSecondary: {
        color: '#14532D',
        fontSize: 18,
        fontWeight: '800',
    },
    permOrText: {
        color: '#166534',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },

    // ── Camera Screen ──
    container: {
        flex: 1,
        backgroundColor: '#171d14',
    },
    cameraViewport: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
    },
    webCameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraFrame: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
    },
    vignetteOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(23, 29, 20, 0.35)',
    },
    overlayLayer: {
        flex: 1,
        zIndex: 10,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    aiBadgeTop: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 83, 45, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.5)',
    },
    aiBadgeDot: {
        color: '#4ADE80',
        fontSize: 10,
        marginRight: 6,
    },
    aiBadgeText: {
        color: '#4ADE80',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(20, 83, 45, 0.8)', // Dark green
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.4)',
    },
    iconText: {
        fontSize: 18,
        color: '#A7F3D0', // Light green
    },

    // ── Framing Guide ──
    framingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    framingBox: {
        width: 280,
        height: 280,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#4ADE80',
    },
    cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 32 },
    cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 32 },
    cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 32 },
    cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 32 },
    scannerLaser: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: '#4ADE80',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 5,
    },
    targetCrosshair: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    targetHorizontal: {
        position: 'absolute',
        width: 40,
        height: 2,
        backgroundColor: 'rgba(74, 222, 128, 0.4)',
    },
    targetVertical: {
        position: 'absolute',
        width: 2,
        height: 40,
        backgroundColor: 'rgba(74, 222, 128, 0.4)',
    },
    instructionContainer: {
        marginTop: 40,
        width: '100%',
        alignItems: 'center',
    },
    instructionGlass: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        ...Platform.select({
            web: { backdropFilter: 'blur(16px)' }
        })
    },
    instructionIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    instructionDesc: {
        fontSize: 13,
        color: '#A7F3D0',
        fontWeight: '500',
    },

    // ── Bottom Controls ──
    bottomControls: {
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 16,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        gap: 12,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 320,
    },
    galleryButton: {
        width: 56,
        height: 56,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    galleryPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    galleryPlaceholderIcon: {
        fontSize: 24,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    shutterButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 4,
        borderColor: 'rgba(74, 222, 128, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    shutterInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
        elevation: 8,
    },
    shutterCore: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#4ADE80',
        opacity: 0.2,
    },
    helpButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    helpIcon: {
        fontSize: 22,
    },
    hintText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});
