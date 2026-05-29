import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { auth } from '../../firebase';
import {
  listenToGarden,
  listenToChildProfile,
  ensurePersonalGarden,
  placeBuilding,
  removeBuilding,
  getWorldStage,
  getWorldStageLabel,
  getWorldStageEmoji,
  BUILDING_CATALOG,
  GardenData,
  ChildData,
  Building,
} from '../../services/gardenService';
import { WORLD_HTML } from '../../world/worldHtml';
import BrandHeader from '../../components/BrandHeader';

export default function WorldScreen({ navigation }: any) {
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildMode, setBuildMode] = useState(false);
  const [bulldoze, setBulldoze] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(BUILDING_CATALOG[0].type);
  const [toast, setToast] = useState<string | null>(null);

  const webRef = useRef<WebView>(null);
  const webReady = useRef(false);
  const gardenIdRef = useRef<string | null>(null);
  const placingRef = useRef(false);
  const buildModeRef = useRef(false);
  const bulldozeRef = useRef(false);
  const selectedTypeRef = useRef(selectedType);
  // Latest world state so the WebView "ready" handler can replay it.
  const latest = useRef<{ cleanliness: number; phase: string; buildings: Building[] }>({
    cleanliness: 0,
    phase: 'cleanup',
    buildings: [],
  });

  useEffect(() => { buildModeRef.current = buildMode; }, [buildMode]);
  useEffect(() => { bulldozeRef.current = bulldoze; }, [bulldoze]);
  useEffect(() => { selectedTypeRef.current = selectedType; }, [selectedType]);

  const inject = useCallback((js: string) => {
    if (!webReady.current || !webRef.current) return;
    webRef.current.injectJavaScript(js + ' true;');
  }, []);

  const pushState = useCallback((cleanliness: number, phase: string) => {
    latest.current.cleanliness = cleanliness;
    latest.current.phase = phase;
    inject(`window.__applyState && window.__applyState(${Number(cleanliness) || 0}, ${JSON.stringify(phase || 'cleanup')});`);
  }, [inject]);

  const pushBuildings = useCallback((buildings: Building[]) => {
    latest.current.buildings = buildings || [];
    inject(`window.__setBuildings && window.__setBuildings(${JSON.stringify(JSON.stringify(latest.current.buildings))});`);
  }, [inject]);

  const pushBuildMode = useCallback((on: boolean) => {
    inject(`window.__setBuildMode && window.__setBuildMode(${on ? 'true' : 'false'});`);
  }, [inject]);

  const pushBulldoze = useCallback((on: boolean) => {
    inject(`window.__setBulldoze && window.__setBulldoze(${on ? 'true' : 'false'});`);
  }, [inject]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    let unsubGarden: (() => void) | null = null;
    let unsubChild: (() => void) | null = null;

    const init = async () => {
      try {
        const gardenId = await ensurePersonalGarden(uid);
        gardenIdRef.current = gardenId;

        unsubGarden = listenToGarden(gardenId, (data) => {
          if (data) {
            setGarden(data);
            pushState(data.cleanliness ?? 0, data.phase ?? 'cleanup');
            pushBuildings(data.buildings ?? []);
          }
          setLoading(false);
        });
        unsubChild = listenToChildProfile(uid, setChild);
      } catch (e) {
        console.warn('[WorldScreen] init error:', e);
        setLoading(false);
      }
    };
    init();

    return () => {
      if (unsubGarden) unsubGarden();
      if (unsubChild) unsubChild();
    };
  }, [pushState, pushBuildings]);

  const onWebMessage = useCallback(
    async (event: any) => {
      let msg: any;
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (msg.type === 'ready') {
        webReady.current = true;
        pushState(latest.current.cleanliness, latest.current.phase);
        pushBuildings(latest.current.buildings);
        pushBuildMode(buildModeRef.current);
        pushBulldoze(bulldozeRef.current);
      } else if (msg.type === 'error') {
        console.warn('[WorldScreen] scene error:', msg.message);
      } else if (msg.type === 'tileTap') {
        if (!buildModeRef.current || bulldozeRef.current || placingRef.current) return;
        const gardenId = gardenIdRef.current;
        const uid = auth.currentUser?.uid;
        if (!gardenId || !uid) return;
        placingRef.current = true;
        const res = await placeBuilding(uid, gardenId, selectedTypeRef.current, msg.x, msg.z);
        placingRef.current = false;
        showToast(res.success ? `✅ ${res.message}` : `⚠️ ${res.message}`);
      } else if (msg.type === 'buildingTap') {
        if (!buildModeRef.current || !bulldozeRef.current || placingRef.current || !msg.id) return;
        const gardenId = gardenIdRef.current;
        const uid = auth.currentUser?.uid;
        if (!gardenId || !uid) return;
        placingRef.current = true;
        const res = await removeBuilding(uid, gardenId, msg.id);
        placingRef.current = false;
        showToast(
          res.success
            ? `🗑️ ${res.message}${res.refund ? ` +${res.refund}⚡` : ''}`
            : `⚠️ ${res.message}`
        );
      }
    },
    [pushState, pushBuildings, pushBuildMode, pushBulldoze, showToast]
  );

  const toggleBuild = () => {
    const next = !buildMode;
    setBuildMode(next);
    pushBuildMode(next);
    if (!next && bulldoze) {
      setBulldoze(false);
      pushBulldoze(false);
    }
  };

  const toggleBulldoze = () => {
    const next = !bulldoze;
    setBulldoze(next);
    pushBulldoze(next);
  };

  const cleanliness = Math.round(garden?.cleanliness ?? 0);
  const phase = garden?.phase ?? 'cleanup';
  const stage = getWorldStage(cleanliness);
  const stageLabel = getWorldStageLabel(stage);
  const stageEmoji = getWorldStageEmoji(stage);
  const isBuilding = phase === 'building';
  const points = child?.energy_points ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.webWrap}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: WORLD_HTML, baseUrl: 'https://greenpulse.local/' }}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          androidLayerType="hardware"
          setSupportMultipleWindows={false}
          onMessage={onWebMessage}
          style={styles.web}
          containerStyle={styles.web}
        />
        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#4ADE80" />
            <Text style={styles.loadingText}>Loading your world…</Text>
          </View>
        )}
      </View>

      {/* Top bar */}
      <View style={styles.topBar} pointerEvents="box-none">
        <BrandHeader
          transparent
          style={styles.brand}
          rightContent={
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsIcon}>⚡</Text>
              <Text style={styles.pointsText}>{points}</Text>
            </View>
          }
        />
      </View>

      {/* Toast */}
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* Bottom HUD */}
      <View style={styles.hud} pointerEvents="box-none">
        <View style={styles.hudCard}>
          <View style={styles.hudHeaderRow}>
            <View style={styles.stagePill}>
              <Text style={styles.stageEmoji}>{stageEmoji}</Text>
              <Text style={styles.stageLabel}>{stageLabel}</Text>
            </View>
            <Text style={styles.cleanPct}>{cleanliness}%</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${cleanliness}%` }]} />
          </View>
          <Text style={styles.hudCaption}>
            {isBuilding
              ? buildMode
                ? bulldoze
                  ? '🗑️ Tap a building to remove it (50% refund)'
                  : '🏗️ Tap the ground to place your building'
                : '🏙️ World cleaned! Build your pollution-free city.'
              : `Clean the world — ${100 - cleanliness}% pollution left`}
          </Text>

          {/* Build/Bulldoze sub-toolbar + palette (only when building & in build mode) */}
          {isBuilding && buildMode && (
            <>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeChip, !bulldoze && styles.modeChipActive]}
                  onPress={() => bulldoze && toggleBulldoze()}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modeChipText, !bulldoze && styles.modeChipTextActive]}>🏗️ Place</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeChip, bulldoze && styles.modeChipBulldoze]}
                  onPress={() => !bulldoze && toggleBulldoze()}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modeChipText, bulldoze && styles.modeChipTextActive]}>🗑️ Bulldoze</Text>
                </TouchableOpacity>
              </View>

              {!bulldoze && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette}>
                  {BUILDING_CATALOG.map((b) => {
                    const active = b.type === selectedType;
                    const afford = points >= b.cost;
                    return (
                      <TouchableOpacity
                        key={b.type}
                        style={[styles.paletteItem, active && styles.paletteItemActive, !afford && styles.paletteItemPoor]}
                        onPress={() => setSelectedType(b.type)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.paletteIcon}>{b.icon}</Text>
                        <Text style={styles.paletteLabel}>{b.label}</Text>
                        <Text style={[styles.paletteCost, !afford && { color: '#fca5a5' }]}>{b.cost}⚡</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}

          {/* Action row */}
          {isBuilding ? (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.cta, styles.ctaHalf, buildMode && styles.ctaGhost]}
                activeOpacity={0.85}
                onPress={toggleBuild}
              >
                <Text style={[styles.ctaText, buildMode && styles.ctaGhostText]}>
                  {buildMode ? 'Done' : '🏗️ Build City'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cta, styles.ctaHalf]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Camera')}
              >
                <Text style={styles.ctaText}>📸 Earn ⚡</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => navigation.navigate('Camera')}>
              <Text style={styles.ctaIcon}>📸</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaText}>Take an Eco-Action</Text>
                <Text style={styles.ctaSub}>Zara AI verifies your photo to clean the world</Text>
              </View>
              <Text style={styles.ctaArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1020' },
  webWrap: { ...StyleSheet.absoluteFillObject },
  web: { flex: 1, backgroundColor: '#0b1020' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 14, color: '#A7F3D0', fontSize: 15, fontWeight: '700' },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  brand: { backgroundColor: 'transparent' },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,83,45,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.5)',
  },
  pointsIcon: { fontSize: 14, marginRight: 4 },
  pointsText: { fontSize: 15, fontWeight: '900', color: '#4ADE80' },

  toast: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(11,16,32,0.92)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.4)',
    maxWidth: '88%',
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  hud: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  hudCard: {
    backgroundColor: 'rgba(11,16,32,0.82)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
  },
  hudHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stageEmoji: { fontSize: 16, marginRight: 6 },
  stageLabel: { color: '#A7F3D0', fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  cleanPct: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -1 },

  track: { height: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#4ADE80', borderRadius: 6 },
  hudCaption: { color: '#9fb3c8', fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 14 },

  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modeChipActive: { borderColor: '#4ADE80', backgroundColor: 'rgba(74,222,128,0.14)' },
  modeChipBulldoze: { borderColor: '#ff5a5a', backgroundColor: 'rgba(255,90,90,0.14)' },
  modeChipText: { color: '#9fb3c8', fontSize: 13, fontWeight: '800' },
  modeChipTextActive: { color: '#fff' },

  palette: { marginBottom: 14, marginHorizontal: -4 },
  paletteItem: {
    width: 92,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  paletteItemActive: { borderColor: '#4ADE80', backgroundColor: 'rgba(74,222,128,0.14)' },
  paletteItemPoor: { opacity: 0.55 },
  paletteIcon: { fontSize: 24 },
  paletteLabel: { color: '#E5EEF6', fontSize: 11, fontWeight: '700', marginTop: 2 },
  paletteCost: { color: '#A7F3D0', fontSize: 12, fontWeight: '900', marginTop: 2 },

  btnRow: { flexDirection: 'row', gap: 10 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  ctaHalf: { flex: 1 },
  ctaGhost: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.5)' },
  ctaGhostText: { color: '#A7F3D0' },
  ctaIcon: { fontSize: 22 },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  ctaSub: { color: '#D1FAE5', fontSize: 11, fontWeight: '600', marginTop: 1 },
  ctaArrow: { color: '#D1FAE5', fontSize: 18, fontWeight: '900' },
});
