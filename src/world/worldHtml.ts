/**
 * worldHtml.ts
 * Self-contained Three.js scene rendered inside a react-native-webview.
 *
 * The world is a low-poly floating island (Clash of Clans / SimCity vibe) that
 * transforms based on a single `cleanliness` value (0–100):
 *   - low  → smog, grey sky, scattered garbage, sickly/brown grass, bare trees
 *   - high → clear blue sky, lush green grass, full trees, no litter
 *   - 100 + phase 'building' → a small pollution-free eco-city rises from the ground
 *
 * React Native drives it by calling (via injectJavaScript):
 *     window.__applyState(cleanliness, phase)
 * The scene smoothly animates toward whatever state it is given.
 *
 * NOTE: the embedded JS intentionally avoids backticks and ${...} so this whole
 * file can live inside a normal template literal without escaping headaches.
 */

export const WORLD_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0b1020; }
  #c { width: 100%; height: 100%; display: block; touch-action: none; }
  #err {
    position: absolute; top: 0; left: 0; right: 0; padding: 16px;
    font-family: -apple-system, system-ui, sans-serif; color: #fff;
    font-size: 13px; display: none; z-index: 10;
  }
</style>
<script>
  // Bridge stub defined BEFORE the module loads so injected calls never get lost.
  window.__state = { cleanliness: 0, phase: 'cleanup' };
  window.__applyState = function (c, p) {
    if (typeof c === 'number') window.__state.cleanliness = c;
    if (p) window.__state.phase = p;
    if (window.__onState) window.__onState(window.__state.cleanliness, window.__state.phase);
  };
  function __post(obj) {
    try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch (e) {}
  }
  window.onerror = function (msg) {
    var e = document.getElementById('err');
    if (e) { e.style.display = 'block'; e.textContent = 'World error: ' + msg; }
    __post({ type: 'error', message: String(msg) });
  };
</script>
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.166.1/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.166.1/examples/jsm/"
  }
}
</script>
</head>
<body>
<canvas id="c"></canvas>
<div id="err"></div>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---- helpers ----
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }

var SKY_DIRTY = new THREE.Color(0x6b6357);
var SKY_CLEAN = new THREE.Color(0x8fd1ff);
var GRASS_DIRTY = new THREE.Color(0x7a6f4f);
var GRASS_CLEAN = new THREE.Color(0x5bba47);
var FOLIAGE_DIRTY = new THREE.Color(0x9a8b3d);
var FOLIAGE_CLEAN = new THREE.Color(0x2f9e44);
var SUN_DIRTY = new THREE.Color(0xb9a07a);
var SUN_CLEAN = new THREE.Color(0xffffff);

// ---- renderer / scene / camera ----
var canvas = document.getElementById('c');
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene = new THREE.Scene();
scene.background = SKY_DIRTY.clone();
scene.fog = new THREE.Fog(SKY_DIRTY.clone(), 22, 60);

var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
camera.position.set(16, 13, 16);

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 10;
controls.maxDistance = 38;
controls.maxPolarAngle = Math.PI * 0.46;
controls.target.set(0, 1.5, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;

// ---- lights ----
var hemi = new THREE.HemisphereLight(0xffffff, 0x4a4a3a, 0.9);
scene.add(hemi);
var sun = new THREE.DirectionalLight(SUN_DIRTY.clone(), 1.6);
sun.position.set(14, 22, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 60;
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
scene.add(sun);

// ---- floating island ----
var island = new THREE.Group();
scene.add(island);

var R = 9;
var grassMat = new THREE.MeshStandardMaterial({ color: GRASS_DIRTY.clone(), roughness: 1, metalness: 0 });
var grass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.2, 48), grassMat);
grass.position.y = 0; grass.receiveShadow = true;
island.add(grass);

var dirtMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 1 });
var dirt = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.92, R * 0.45, 4.5, 48), dirtMat);
dirt.position.y = -2.8; dirt.receiveShadow = true;
island.add(dirt);

// a flat "lake" disc that brightens when clean
var waterMat = new THREE.MeshStandardMaterial({ color: 0x3a4a55, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.9 });
var water = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), waterMat);
water.rotation.x = -Math.PI / 2;
water.position.set(-4, 0.62, 3.2);
island.add(water);

// ---- trees ----
var trees = [];
var trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 1 });
function makeTree(x, z, scale) {
  var g = new THREE.Group();
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.3, 6), trunkMat);
  trunk.position.y = 0.65; trunk.castShadow = true;
  g.add(trunk);
  var folMat = new THREE.MeshStandardMaterial({ color: FOLIAGE_DIRTY.clone(), roughness: 1 });
  var f1 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.6, 7), folMat);
  f1.position.y = 1.8; f1.castShadow = true;
  var f2 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.3, 7), folMat);
  f2.position.y = 2.6; f2.castShadow = true;
  g.add(f1); g.add(f2);
  g.position.set(x, 0.6, z);
  g.userData.baseScale = scale;
  g.userData.folMat = folMat;
  g.scale.setScalar(0.001);
  island.add(g);
  trees.push(g);
}
for (var i = 0; i < 14; i++) {
  var a = rand(0, Math.PI * 2), rr = rand(2.2, R - 1.4);
  makeTree(Math.cos(a) * rr, Math.sin(a) * rr, rand(0.8, 1.25));
}

// ---- garbage pool (visible count scales with pollution) ----
var garbage = [];
var trashColors = [0x8a8f98, 0x9c6b3f, 0x4f6f8f, 0x7a7f55, 0xb04a4a, 0x556070];
function makeTrash(x, z) {
  var g = new THREE.Group();
  var kind = Math.floor(rand(0, 3));
  var col = trashColors[Math.floor(rand(0, trashColors.length))];
  var mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85, metalness: 0.1 });
  var mesh;
  if (kind === 0) mesh = new THREE.Mesh(new THREE.BoxGeometry(rand(0.4,0.7), rand(0.3,0.6), rand(0.4,0.7)), mat);       // crate / box
  else if (kind === 1) mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, rand(0.5,0.8), 8), mat);            // bottle / can
  else mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(rand(0.3,0.5)), mat);                                        // crumpled junk
  mesh.castShadow = true;
  mesh.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
  g.add(mesh);
  g.position.set(x, 0.75, z);
  g.userData.baseY = 0.75;
  island.add(g);
  garbage.push(g);
}
for (var j = 0; j < 46; j++) {
  var aa = rand(0, Math.PI * 2), r2 = rand(0.8, R - 1.0);
  makeTrash(Math.cos(aa) * r2, Math.sin(aa) * r2);
}

// ---- smog particles ----
var smogCount = 260;
var smogGeo = new THREE.BufferGeometry();
var smogPos = new Float32Array(smogCount * 3);
for (var k = 0; k < smogCount; k++) {
  smogPos[k*3] = rand(-R, R);
  smogPos[k*3+1] = rand(1, 11);
  smogPos[k*3+2] = rand(-R, R);
}
smogGeo.setAttribute('position', new THREE.BufferAttribute(smogPos, 3));
var smogMat = new THREE.PointsMaterial({ color: 0x6a6258, size: 0.9, transparent: true, opacity: 0.55, depthWrite: false });
var smog = new THREE.Points(smogGeo, smogMat);
scene.add(smog);

// ---- eco city (data-driven, placed by the player in the building phase) ----
var city = new THREE.Group();
scene.add(city);
function makeBuilding(type) {
  var g = new THREE.Group();
  if (type === 'park') {
    var lawn = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 1 }));
    lawn.position.y = 0.08; lawn.receiveShadow = true;
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x6b4a2f }));
    trunk.position.y = 0.4;
    var fol = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.0, 7), new THREE.MeshStandardMaterial({ color: 0x2f9e44 }));
    fol.position.y = 1.1; fol.castShadow = true;
    g.add(lawn); g.add(trunk); g.add(fol);
  } else if (type === 'solar') {
    var base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.0), new THREE.MeshStandardMaterial({ color: 0x2b2b2b }));
    base.position.y = 0.1;
    var panel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.9), new THREE.MeshStandardMaterial({ color: 0x1b3a6b, metalness: 0.6, roughness: 0.3 }));
    panel.position.y = 0.25; panel.rotation.x = -0.5; panel.castShadow = true;
    g.add(base); g.add(panel);
  } else if (type === 'windmill') {
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
    pole.position.y = 1.2; pole.castShadow = true;
    var hub = new THREE.Group(); hub.position.set(0, 2.4, 0.15);
    var bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (var b = 0; b < 3; b++) {
      var holder = new THREE.Group(); holder.rotation.z = b * (Math.PI * 2 / 3);
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.25), bladeMat);
      blade.position.y = 0.55;
      holder.add(blade); hub.add(holder);
    }
    g.add(pole); g.add(hub);
    g.userData.hub = hub;
  } else { // house
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), new THREE.MeshStandardMaterial({ color: 0xf3ead7, roughness: 0.9 }));
    body.position.y = 0.6; body.castShadow = true;
    var roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.9, 4), new THREE.MeshStandardMaterial({ color: 0xc0552f, roughness: 0.9 }));
    roof.position.y = 1.65; roof.rotation.y = Math.PI / 4; roof.castShadow = true;
    g.add(body); g.add(roof);
  }
  g.userData.targetScale = 1;
  return g;
}

// rendered buildings keyed by id, synced from React Native via __setBuildings
var rendered = {};
window.__setBuildings = function (list) {
  try { if (typeof list === 'string') list = JSON.parse(list); } catch (e) { list = []; }
  if (!Array.isArray(list)) list = [];
  var seen = {};
  for (var i = 0; i < list.length; i++) {
    var bb = list[i];
    if (!bb || !bb.id) continue;
    seen[bb.id] = true;
    if (!rendered[bb.id]) {
      var g = makeBuilding(bb.type);
      g.position.set(bb.x, 0.6, bb.z);
      g.scale.setScalar(0.001);
      g.userData.buildingId = bb.id;
      city.add(g);
      rendered[bb.id] = g;
    }
  }
  for (var id in rendered) {
    if (!seen[id]) { city.remove(rendered[id]); delete rendered[id]; }
  }
};

// ---- build mode: tap a tile to place a building ----
window.__buildMode = false;
var raycaster = new THREE.Raycaster();
var ndc = new THREE.Vector2();
var GRID = 1.5;
var BUILD_RADIUS = 6.5;

var ringMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0, side: THREE.DoubleSide });
var ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.8, 28), ringMat);
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.64;
island.add(ring);
var ringPulse = 0;

window.__bulldoze = false;
window.__setBuildMode = function (on) {
  window.__buildMode = !!on;
  controls.autoRotate = !on;
  if (!on) ringMat.opacity = 0;
};
window.__setBulldoze = function (on) {
  window.__bulldoze = !!on;
  ringMat.color.set(on ? 0xff5a5a : 0x4ade80);
};

function findBuildingId(obj) {
  while (obj) {
    if (obj.userData && obj.userData.buildingId) return obj.userData.buildingId;
    obj = obj.parent;
  }
  return null;
}

var pdown = null;
function pStart(e) { var t = e.touches ? e.touches[0] : e; pdown = { x: t.clientX, y: t.clientY, t: Date.now() }; }
function pEnd(e) {
  if (!pdown) return;
  var t = e.changedTouches ? e.changedTouches[0] : e;
  var dx = t.clientX - pdown.x, dy = t.clientY - pdown.y;
  var moved = Math.sqrt(dx * dx + dy * dy), dt = Date.now() - pdown.t;
  pdown = null;
  if (!window.__buildMode || moved > 12 || dt > 450) return;  // ignore drags (orbit)
  ndc.x = (t.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(t.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);

  if (window.__bulldoze) {
    // remove: tap an existing building
    var bHits = raycaster.intersectObjects(city.children, true);
    if (!bHits.length) return;
    var id = findBuildingId(bHits[0].object);
    if (id) __post({ type: 'buildingTap', id: id });
    return;
  }

  // place: tap the ground, snap to grid
  var hits = raycaster.intersectObject(grass, false);
  if (!hits.length) return;
  var p = hits[0].point;
  var gx = Math.round(p.x / GRID) * GRID;
  var gz = Math.round(p.z / GRID) * GRID;
  if (Math.sqrt(gx * gx + gz * gz) > BUILD_RADIUS) return;
  ring.position.set(gx, 0.64, gz);
  ringMat.opacity = 0.9; ringPulse = 1;
  __post({ type: 'tileTap', x: gx, z: gz });
}
renderer.domElement.addEventListener('touchstart', pStart, { passive: true });
renderer.domElement.addEventListener('touchend', pEnd, { passive: true });
renderer.domElement.addEventListener('mousedown', pStart);
renderer.domElement.addEventListener('mouseup', pEnd);

// ---- animated state (current vs target) ----
var cur = { green: 0, garbage: 1, smog: 1, sky: 0 };
var tgt = { green: 0, garbage: 1, smog: 1, sky: 0 };

window.__onState = function (cleanliness, phase) {
  var c = clamp(cleanliness, 0, 100) / 100;
  tgt.green = c;                 // grass/tree greenness + tree growth
  tgt.garbage = 1 - c;           // how much litter remains
  tgt.smog = 1 - c;              // smog density
  tgt.sky = c;                   // sky/sun clarity
  __post({ type: 'stateApplied', cleanliness: cleanliness, phase: phase });
};

// apply whatever state arrived before the module finished loading
window.__onState(window.__state.cleanliness, window.__state.phase);
__post({ type: 'ready' });

// ---- resize ----
function resize() {
  var w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ---- render loop ----
var tmpColor = new THREE.Color();
function tick() {
  requestAnimationFrame(tick);

  // ease current toward target
  cur.green   = lerp(cur.green,   tgt.green,   0.05);
  cur.garbage = lerp(cur.garbage, tgt.garbage, 0.05);
  cur.smog    = lerp(cur.smog,    tgt.smog,    0.05);
  cur.sky     = lerp(cur.sky,     tgt.sky,     0.05);

  // sky + fog + sun
  tmpColor.copy(SKY_DIRTY).lerp(SKY_CLEAN, cur.sky);
  scene.background.copy(tmpColor);
  scene.fog.color.copy(tmpColor);
  sun.color.copy(SUN_DIRTY).lerp(SUN_CLEAN, cur.sky);
  sun.intensity = lerp(1.3, 2.0, cur.sky);
  hemi.intensity = lerp(0.7, 1.1, cur.sky);

  // grass + water
  grassMat.color.copy(GRASS_DIRTY).lerp(GRASS_CLEAN, cur.green);
  waterMat.color.set(0x3a4a55); waterMat.color.lerp(new THREE.Color(0x4aa3d6), cur.green);

  // trees grow + green up
  for (var i = 0; i < trees.length; i++) {
    var t = trees[i];
    var s = t.userData.baseScale * clamp(cur.green * 1.15, 0.04, 1);
    t.scale.setScalar(s);
    t.userData.folMat.color.copy(FOLIAGE_DIRTY).lerp(FOLIAGE_CLEAN, cur.green);
  }

  // garbage: show a fraction of the pool, sink/scale the rest away
  var visible = Math.round(garbage.length * cur.garbage);
  for (var g = 0; g < garbage.length; g++) {
    var obj = garbage[g];
    var on = g < visible;
    var target = on ? 1 : 0;
    var sc = lerp(obj.scale.x, target, 0.12);
    obj.scale.setScalar(Math.max(0.0001, sc));
    obj.position.y = lerp(obj.userData.baseY, obj.userData.baseY - 0.8, 1 - sc);
    obj.visible = sc > 0.02;
  }

  // smog
  smogMat.opacity = 0.55 * cur.smog;
  smog.visible = smogMat.opacity > 0.02;
  smog.rotation.y += 0.0008;

  // placed buildings: pop-in scale + spinning windmills
  for (var id in rendered) {
    var bld = rendered[id];
    bld.scale.setScalar(lerp(bld.scale.x, bld.userData.targetScale || 1, 0.14));
    if (bld.userData.hub) bld.userData.hub.rotation.z += 0.05;
  }

  // build cursor ring pulse
  if (ringPulse > 0) {
    ringPulse = Math.max(0, ringPulse - 0.02);
    ringMat.opacity = (window.__buildMode ? 0.35 : 0) + 0.55 * ringPulse;
    ring.scale.setScalar(1 + (1 - ringPulse) * 0.4);
  } else if (window.__buildMode) {
    ringMat.opacity = 0.35;
    ring.scale.setScalar(1);
  }

  controls.update();
  renderer.render(scene, camera);
}
tick();
</script>
</body>
</html>`;
