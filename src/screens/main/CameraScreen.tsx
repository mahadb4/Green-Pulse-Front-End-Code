import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [isCapturing, setIsCapturing] = useState(false);
    const [isPickingGallery, setIsPickingGallery] = useState(false);
    const [lastGalleryThumb, setLastGalleryThumb] = useState<string | null>(null);

    const cameraRef = useRef<CameraView>(null);
    const videoRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);

    // Subtle pulse animation for the shutter button
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (Platform.OS === 'web') {
            setupWebCamera();
        }
        // Start subtle pulse loop on shutter
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1.0,  duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
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
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                    <SafeAreaView style={styles.permissionSafeArea}>
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
                    </SafeAreaView>
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
            <SafeAreaView style={styles.overlayLayer}>

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
                        <Text style={styles.iconText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.topBarRight}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                            <Text style={styles.iconText}>🔄</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Framing Guide */}
                <View style={styles.framingContainer}>
                    <View style={styles.framingBox}>
                        {/* Corner Indicators */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />

                        {/* Center Focus Ring */}
                        <View style={styles.focusRing}>
                            <View style={styles.focusDot} />
                        </View>
                    </View>

                    {/* Instruction Overlay — text corrected to "Center the object" */}
                    <View style={styles.instructionContainer}>
                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionTitle}>Center the object</Text>
                            <Text style={styles.instructionDesc}>Ensure good lighting for identification</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <View style={styles.controlsRow}>

                        {/* Gallery Button — fully wired */}
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
                                activeOpacity={0.7}
                                disabled={isCapturing}
                            >
                                {isCapturing ? (
                                    <ActivityIndicator size="large" color="#FFFFFF" />
                                ) : (
                                    <View style={styles.shutterInner} />
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Spacer to balance the layout symmetrically */}
                        <View style={styles.helpButton}>
                            <Text style={styles.helpIcon}>📷</Text>
                        </View>
                    </View>

                    {/* Bottom hint */}
                    <Text style={styles.hintText}>Tap shutter to capture · Tap 🖼️ for gallery</Text>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    // ── Permission Screen ──
    permissionContainer: {
        flex: 1,
        backgroundColor: '#171d14',
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
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    permCloseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
        backgroundColor: 'rgba(56, 173, 50, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    permIconText: {
        fontSize: 48,
    },
    permTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    permSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.65)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    permButton: {
        width: '100%',
        paddingVertical: 16,
        backgroundColor: '#38ad32',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permButtonSecondary: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    permButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    permButtonTextSecondary: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    permOrText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    topBarRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.82)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 17,
        color: '#171d14',
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
        width: 48,
        height: 48,
        borderColor: '#38ad32',
    },
    cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 32 },
    cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 32 },
    cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 32 },
    cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 32 },
    focusRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    instructionContainer: {
        marginTop: 40,
    },
    instructionBox: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
    instructionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#171d14',
        marginBottom: 3,
    },
    instructionDesc: {
        fontSize: 13,
        color: '#68756B',
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
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.15)',
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
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#38ad32',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
    },
    shutterInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
    },
    helpButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
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
