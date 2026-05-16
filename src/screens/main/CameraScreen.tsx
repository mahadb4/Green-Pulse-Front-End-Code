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
    Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        if (Platform.OS === 'web') {
            setupWebCamera();
        }
    }, []);

    const videoRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);

    const setupWebCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const handleClose = () => {
        if (navigation && navigation.goBack) {
            navigation.goBack();
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const handleCapture = async () => {
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
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    exif: false,
                });
                if (navigation && navigation.navigate && photo) {
                    navigation.navigate('PhotoPreview', { photoUri: photo.uri, points });
                }
            } catch (error) {
                console.error('Failed to take photo', error);
                // Fallback
                if (navigation && navigation.navigate) {
                    navigation.navigate('PhotoPreview', { points });
                }
            }
        }
    };

    if (Platform.OS !== 'web') {
        if (!permission) {
            // Camera permissions are still loading
            return <View style={styles.container} />;
        }

        if (!permission.granted) {
            // Camera permissions are not granted yet
            return (
                <View style={styles.container}>
                    <Text style={{ textAlign: 'center', color: 'white', marginTop: 100 }}>
                        We need your permission to show the camera
                    </Text>
                    <TouchableOpacity 
                        onPress={requestPermission} 
                        style={[styles.button, { marginTop: 20, marginHorizontal: 40 }]}
                    >
                        <Text style={styles.buttonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

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
                {/* Subtle Vignette Overlay */}
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
                        <TouchableOpacity style={styles.iconButton}>
                            <Text style={styles.iconText}>⚡</Text>
                        </TouchableOpacity>
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

                    {/* Integrated Instruction Overlay */}
                    <View style={styles.instructionContainer}>
                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionTitle}>Center the plant</Text>
                            <Text style={styles.instructionDesc}>Ensure good lighting for identification</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <View style={styles.controlsRow}>
                        {/* Gallery Button */}
                        <TouchableOpacity style={styles.galleryButton}>
                            <Image
                                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAacionShWf4gVzYYZS-lWXadtzbrKqFq4dJUqigdcd8BnvCPvuJs_8vQTbFTB4QvWrNS-WIhk5eoGLtz1etZVEB2BTm4v6yLHVx8lMzIWHwa2rifld77Uk8dR3YbTtIspItM_bWVVPNc6HR0LtZcFQgx_zOM1p6roLql1LT48wV1D9TEI5e8J5h8eMs6cDUrBE0lJvKnpS9XFLbLvbRnzb4lxuhrd1m_2vsiVyNgMaulJtM0AMbz9zr6DhilYS4lRhiTHGDMTjlTE' }}
                                style={styles.galleryImage}
                            />
                        </TouchableOpacity>

                        {/* Shutter Button */}
                        <TouchableOpacity
                            style={styles.shutterButton}
                            onPress={handleCapture}
                            activeOpacity={0.7}
                        >
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>

                        {/* Help Button */}
                        <TouchableOpacity style={styles.helpButton}>
                            <Text style={styles.helpIcon}>?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#171d14',
    },
    cameraViewport: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    webCameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraFrame: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    centerFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackText: {
        color: '#ffffff',
        fontSize: 16,
        marginTop: 12,
    },
    vignetteOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(23, 29, 20, 0.4)', // Simulated vignette
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
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 18,
        color: '#171d14',
    },
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
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderColor: '#38ad32', // primary-container
    },
    cornerTL: {
        top: -2,
        left: -2,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: 32,
    },
    cornerTR: {
        top: -2,
        right: -2,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: 32,
    },
    cornerBL: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderBottomLeftRadius: 32,
    },
    cornerBR: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderBottomRightRadius: 32,
    },
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
        marginTop: 48,
    },
    instructionBox: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#171d14',
        marginBottom: 4,
    },
    instructionDesc: {
        fontSize: 14,
        color: '#68756B',
    },
    bottomControls: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 320,
    },
    galleryButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    shutterButton: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterInner: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FFFFFF',
    },
    helpButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpIcon: {
        fontSize: 24,
        color: '#171d14',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#38ad32',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
