/**
 * worldHtml.ts
 * Self-contained Three.js scene rendered inside a react-native-webview.
 *
 * A low-poly Clash-of-Clans / SimCity style floating ISLAND made of a tile grid.
 * Driven from React Native by:
 *   window.__applyState(cleanliness, phase)   // 0..100 + 'cleanup'|'building'
 *   window.__setBuildings(jsonArray)           // [{id,type,x,z}]
 *   window.__setBuildMode(on)                  // enter/exit build mode
 *   window.__setBulldoze(on)                   // place vs remove
 * Posts back to RN: {type:'ready'|'tileTap'|'buildingTap'|'error', ...}
 *
 * The embedded JS avoids backticks and ${...} so it can live in a template literal.
 */

export const WORLD_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0b1020; }
  #c { width: 100%; height: 100%; display: block; touch-action: none; }
  #err { position: absolute; top: 0; left: 0; right: 0; padding: 16px; font-family: system-ui, sans-serif; color: #fff; font-size: 13px; display: none; z-index: 10; }
</style>
<script>
  window.__state = { cleanliness: 0, phase: 'cleanup' };
  window.__applyState = function (c, p) {
    if (typeof c === 'number') window.__state.cleanliness = c;
    if (p) window.__state.phase = p;
    if (window.__onState) window.__onState(window.__state.cleanliness, window.__state.phase);
  };
  function __post(o) { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch (e) {} }
  window.onerror = function (m) { var e = document.getElementById('err'); if (e) { e.style.display = 'block'; e.textContent = 'World error: ' + m; } __post({ type: 'error', message: String(m) }); };
</script>
<script type="importmap">
{ "imports": {
  "three": "https://unpkg.com/three@0.166.1/build/three.module.js",
  "three/addons/": "https://unpkg.com/three@0.166.1/examples/jsm/"
} }
</script>
</head>
<body>
<canvas id="c"></canvas>
<div id="err"></div>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function lerpColor(out, a, b, t) { out.copy(a).lerp(b, t); return out; }

// palette
var SKY_DIRTY = new THREE.Color(0x6d6552);
var SKY_CLEAN = new THREE.Color(0x87ceeb);
var SEA_DIRTY = new THREE.Color(0x4a5a52);
var SEA_CLEAN = new THREE.Color(0x2f9fd6);
var GRASS_DIRTY = new THREE.Color(0x8a7d4a);
var GRASS_CLEAN = new THREE.Color(0x6abe4f);
var FOL_DIRTY = new THREE.Color(0x9a8b3d);
var FOL_CLEAN = new THREE.Color(0x2f9e44);
var SUN_DIRTY = new THREE.Color(0xc9b08a);
var SUN_CLEAN = new THREE.Color(0xffffff);

// grid config
var GRID_N = 7;
var TILE = 2.0;
var HALF = (GRID_N - 1) / 2;
var TILE_TOP = 0.0;
function tileWorld(i, j) { return { x: (i - HALF) * TILE, z: (j - HALF) * TILE }; }
var ISLAND_R = HALF * TILE + 1.6;

// renderer / scene / camera
var canvas = document.getElementById('c');
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene = new THREE.Scene();
scene.background = SKY_DIRTY.clone();
scene.fog = new THREE.Fog(SKY_DIRTY.clone(), 26, 70);

var camera = new THREE.PerspectiveCamera(46, 1, 0.1, 250);
camera.position.set(15, 14, 15);

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 11;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI * 0.47;
controls.target.set(0, 1, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// lights
var hemi = new THREE.HemisphereLight(0xffffff, 0x55603f, 0.85);
scene.add(hemi);
var sun = new THREE.DirectionalLight(SUN_DIRTY.clone(), 1.7);
sun.position.set(12, 20, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
sun.shadow.bias = -0.0004;
scene.add(sun);

// sea
var seaMat = new THREE.MeshStandardMaterial({ color: SEA_DIRTY.clone(), roughness: 0.35, metalness: 0.15, transparent: true, opacity: 0.96 });
var sea = new THREE.Mesh(new THREE.CircleGeometry(60, 64), seaMat);
sea.rotation.x = -Math.PI / 2; sea.position.y = -1.7; sea.receiveShadow = true;
scene.add(sea);

// island base (rock + beach rim)
var island = new THREE.Group();
scene.add(island);
var rock = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R * 0.5, 3.4, 40), new THREE.MeshStandardMaterial({ color: 0x6f4f33, roughness: 1 }));
rock.position.y = -1.9; rock.receiveShadow = true; island.add(rock);
var beachMat = new THREE.MeshStandardMaterial({ color: 0xded3a6, roughness: 1 });
var beach = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R, 0.5, 40), beachMat);
beach.position.y = -0.35; beach.receiveShadow = true; island.add(beach);

// tile grid
var tiles = [];
var tileMat = new THREE.MeshStandardMaterial({ color: GRASS_DIRTY.clone(), roughness: 1 });
var tileGeo = new THREE.BoxGeometry(TILE * 0.94, 0.3, TILE * 0.94);
for (var i = 0; i < GRID_N; i++) {
  for (var j = 0; j < GRID_N; j++) {
    var w = tileWorld(i, j);
    var t = new THREE.Mesh(tileGeo, tileMat);
    t.position.set(w.x, -0.15, w.z);
    t.receiveShadow = true;
    t.userData = { gx: w.x, gz: w.z, i: i, j: j };
    island.add(t);
    tiles.push(t);
  }
}

// hover/selection highlight
var hlMat = new THREE.MeshBasicMaterial({ color: 0x6dff8a, transparent: true, opacity: 0.0, depthWrite: false });
var hl = new THREE.Mesh(new THREE.PlaneGeometry(TILE * 0.96, TILE * 0.96), hlMat);
hl.rotation.x = -Math.PI / 2; hl.position.y = 0.03; hl.visible = false;
island.add(hl);

// perimeter scenery trees (off-grid, on the beach rim)
var trees = [];
var trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 1 });
function makeTree(x, z, s) {
  var g = new THREE.Group();
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.1, 6), trunkMat);
  trunk.position.y = 0.55; trunk.castShadow = true; g.add(trunk);
  var fMat = new THREE.MeshStandardMaterial({ color: FOL_DIRTY.clone(), roughness: 1 });
  var f1 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.5, 7), fMat); f1.position.y = 1.6; f1.castShadow = true;
  var f2 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.2, 7), fMat); f2.position.y = 2.35; f2.castShadow = true;
  g.add(f1); g.add(f2);
  g.position.set(x, 0, z); g.userData = { base: s, fMat: fMat }; g.scale.setScalar(0.01);
  island.add(g); trees.push(g);
}
for (var a = 0; a < 10; a++) {
  var ang = (a / 10) * Math.PI * 2 + 0.3;
  makeTree(Math.cos(ang) * (ISLAND_R - 0.6), Math.sin(ang) * (ISLAND_R - 0.6), rand(0.7, 1.05));
}

// garbage on tiles (cleared as cleanliness rises)
var garbage = [];
var trashCols = [0x8a8f98, 0x9c6b3f, 0x4f6f8f, 0x7a7f55, 0xb04a4a, 0x556070];
function makeTrash(x, z) {
  var g = new THREE.Group();
  var kind = Math.floor(rand(0, 3));
  var mat = new THREE.MeshStandardMaterial({ color: trashCols[Math.floor(rand(0, trashCols.length))], roughness: 0.85 });
  var m;
  if (kind === 0) m = new THREE.Mesh(new THREE.BoxGeometry(rand(0.35, 0.6), rand(0.3, 0.5), rand(0.35, 0.6)), mat);
  else if (kind === 1) m = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, rand(0.45, 0.7), 8), mat);
  else m = new THREE.Mesh(new THREE.TetrahedronGeometry(rand(0.28, 0.42)), mat);
  m.castShadow = true; m.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
  g.add(m);
  g.position.set(x + rand(-0.4, 0.4), 0.3, z + rand(-0.4, 0.4));
  g.userData = { baseY: 0.3 };
  island.add(g); garbage.push(g);
}
var shuffled = tiles.slice().sort(function () { return Math.random() - 0.5; });
for (var s2 = 0; s2 < Math.min(34, shuffled.length); s2++) makeTrash(shuffled[s2].userData.gx, shuffled[s2].userData.gz);

// smog
var smogN = 240, sg = new THREE.BufferGeometry(), sp = new Float32Array(smogN * 3);
for (var k = 0; k < smogN; k++) { sp[k*3] = rand(-ISLAND_R, ISLAND_R); sp[k*3+1] = rand(1, 10); sp[k*3+2] = rand(-ISLAND_R, ISLAND_R); }
sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
var smogMat = new THREE.PointsMaterial({ color: 0x6a6258, size: 0.85, transparent: true, opacity: 0.5, depthWrite: false });
var smog = new THREE.Points(sg, smogMat); scene.add(smog);

// ---- buildings ----
var city = new THREE.Group(); scene.add(city);
function makeBuilding(type) {
  var g = new THREE.Group();
  if (type === 'park') {
    var lawn = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 1.7), new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 1 }));
    lawn.position.y = 0.06; lawn.receiveShadow = true; g.add(lawn);
    var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.6, 6), trunkMat); tr.position.y = 0.4; g.add(tr);
    var fo = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x2f9e44 })); fo.position.y = 1.15; fo.castShadow = true; g.add(fo);
    var bench = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: 0x8a5a2b })); bench.position.set(0.45, 0.2, 0.4); g.add(bench);
  } else if (type === 'solar') {
    var pad = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 1.7), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 1 })); pad.position.y = 0.06; pad.receiveShadow = true; g.add(pad);
    for (var sx = -1; sx <= 1; sx += 2) {
      var stand = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222 })); stand.position.set(sx * 0.42, 0.45, 0); stand.rotation.x = -0.55;
      var panel = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.04, 0.46), new THREE.MeshStandardMaterial({ color: 0x183a72, metalness: 0.7, roughness: 0.25 })); panel.position.set(sx * 0.42, 0.5, 0); panel.rotation.x = -0.55; panel.castShadow = true;
      g.add(stand); g.add(panel);
    }
  } else if (type === 'windmill') {
    var bs = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: 0x6abe4f, roughness: 1 })); bs.position.y = 0.06; g.add(bs);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 2.6, 10), new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })); pole.position.y = 1.35; pole.castShadow = true; g.add(pole);
    var hub = new THREE.Group(); hub.position.set(0, 2.6, 0.16);
    for (var b = 0; b < 3; b++) { var hold = new THREE.Group(); hold.rotation.z = b * (Math.PI * 2 / 3); var bl = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.2, 0.22), new THREE.MeshStandardMaterial({ color: 0xffffff })); bl.position.y = 0.6; hold.add(bl); hub.add(hold); }
    g.add(hub); g.userData.hub = hub;
  } else { // house
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: 0xf3ead7, roughness: 0.9 })); body.position.y = 0.55; body.castShadow = true; g.add(body);
    var roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.85, 4), new THREE.MeshStandardMaterial({ color: 0xc0552f, roughness: 0.9 })); roof.position.y = 1.5; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
    var door = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.05), new THREE.MeshStandardMaterial({ color: 0x7a4a25 })); door.position.set(0, 0.32, 0.71); g.add(door);
    var win = new THREE.MeshStandardMaterial({ color: 0x8fd3ff, metalness: 0.3, roughness: 0.2 });
    var w1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), win); w1.position.set(-0.42, 0.7, 0.71); g.add(w1);
    var w2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), win); w2.position.set(0.42, 0.7, 0.71); g.add(w2);
  }
  g.userData.targetScale = 1;
  return g;
}

var rendered = {};
window.__setBuildings = function (list) {
  try { if (typeof list === 'string') list = JSON.parse(list); } catch (e) { list = []; }
  if (!Array.isArray(list)) list = [];
  var seen = {};
  for (var i = 0; i < list.length; i++) {
    var bb = list[i]; if (!bb || !bb.id) continue; seen[bb.id] = true;
    if (!rendered[bb.id]) {
      var g = makeBuilding(bb.type);
      g.position.set(bb.x, TILE_TOP, bb.z); g.scale.setScalar(0.01); g.userData.buildingId = bb.id;
      city.add(g); rendered[bb.id] = g;
    }
  }
  for (var id in rendered) { if (!seen[id]) { city.remove(rendered[id]); delete rendered[id]; } }
};

// ---- build interaction (pointer events; robust on mobile WebViews) ----
window.__buildMode = false; window.__bulldoze = false;
var raycaster = new THREE.Raycaster();
var ndc = new THREE.Vector2();
window.__setBuildMode = function (on) { window.__buildMode = !!on; controls.autoRotate = !on; hl.visible = !!on && !window.__bulldoze; if (!on) hlMat.opacity = 0; };
window.__setBulldoze = function (on) { window.__bulldoze = !!on; hlMat.color.set(on ? 0xff6b6b : 0x6dff8a); hl.visible = window.__buildMode && !on; };

function setNdc(e) { ndc.x = (e.clientX / window.innerWidth) * 2 - 1; ndc.y = -(e.clientY / window.innerHeight) * 2 + 1; raycaster.setFromCamera(ndc, camera); }
function tileAt(e) { setNdc(e); var h = raycaster.intersectObjects(tiles, false); return h.length ? h[0].object : null; }

function findBuildingId(obj) { while (obj) { if (obj.userData && obj.userData.buildingId) return obj.userData.buildingId; obj = obj.parent; } return null; }

var pdown = null;
function onDown(e) { pdown = { x: e.clientX, y: e.clientY, t: Date.now() }; }
function onMove(e) {
  if (!window.__buildMode || window.__bulldoze) return;
  var t = tileAt(e);
  if (t) { hl.position.set(t.userData.gx, 0.03, t.userData.gz); hl.visible = true; }
}
function onUp(e) {
  if (!pdown) return;
  var dx = e.clientX - pdown.x, dy = e.clientY - pdown.y, moved = Math.sqrt(dx * dx + dy * dy), dt = Date.now() - pdown.t;
  pdown = null;
  if (!window.__buildMode || moved > 14 || dt > 500) return; // ignore camera drags
  if (window.__bulldoze) {
    setNdc(e); var bh = raycaster.intersectObjects(city.children, true);
    if (bh.length) { var id = findBuildingId(bh[0].object); if (id) __post({ type: 'buildingTap', id: id }); }
    return;
  }
  var t = tileAt(e);
  if (!t) return;
  hl.position.set(t.userData.gx, 0.03, t.userData.gz); hl.visible = true; hlMat.opacity = 0.9; pulse = 1;
  __post({ type: 'tileTap', x: t.userData.gx, z: t.userData.gz });
}
canvas.addEventListener('pointerdown', onDown);
canvas.addEventListener('pointermove', onMove);
canvas.addEventListener('pointerup', onUp);
canvas.addEventListener('pointercancel', function () { pdown = null; });

// ---- animated state ----
var cur = { green: 0, garbage: 1, smog: 1, sky: 0 };
var tgt = { green: 0, garbage: 1, smog: 1, sky: 0 };
var pulse = 0;
window.__onState = function (cleanliness, phase) {
  var c = clamp(cleanliness, 0, 100) / 100;
  tgt.green = c; tgt.garbage = 1 - c; tgt.smog = 1 - c; tgt.sky = c;
  __post({ type: 'stateApplied', cleanliness: cleanliness, phase: phase });
};
window.__onState(window.__state.cleanliness, window.__state.phase);
__post({ type: 'ready' });

function resize() { var w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();

var tmp = new THREE.Color();
var t0 = (window.performance && performance.now) ? performance.now() : 0;
function tick() {
  requestAnimationFrame(tick);
  var now = (window.performance && performance.now) ? performance.now() : 0;
  var time = (now - t0) / 1000;

  cur.green = lerp(cur.green, tgt.green, 0.05);
  cur.garbage = lerp(cur.garbage, tgt.garbage, 0.05);
  cur.smog = lerp(cur.smog, tgt.smog, 0.05);
  cur.sky = lerp(cur.sky, tgt.sky, 0.05);

  lerpColor(tmp, SKY_DIRTY, SKY_CLEAN, cur.sky); scene.background.copy(tmp); scene.fog.color.copy(tmp);
  sun.color.copy(SUN_DIRTY).lerp(SUN_CLEAN, cur.sky); sun.intensity = lerp(1.35, 2.0, cur.sky); hemi.intensity = lerp(0.7, 1.05, cur.sky);
  lerpColor(seaMat.color, SEA_DIRTY, SEA_CLEAN, cur.sky);
  lerpColor(tileMat.color, GRASS_DIRTY, GRASS_CLEAN, cur.green);
  sea.position.y = -1.7 + Math.sin(time * 0.8) * 0.05;

  for (var i = 0; i < trees.length; i++) { var tr = trees[i]; tr.scale.setScalar(tr.userData.base * clamp(cur.green * 1.2, 0.05, 1)); lerpColor(tr.userData.fMat.color, FOL_DIRTY, FOL_CLEAN, cur.green); }

  var vis = Math.round(garbage.length * cur.garbage);
  for (var g = 0; g < garbage.length; g++) { var o = garbage[g]; var on = g < vis; var sc = lerp(o.scale.x, on ? 1 : 0, 0.12); o.scale.setScalar(Math.max(0.0001, sc)); o.position.y = lerp(o.userData.baseY, o.userData.baseY - 0.7, 1 - sc); o.visible = sc > 0.02; }

  smogMat.opacity = 0.5 * cur.smog; smog.visible = smogMat.opacity > 0.02; smog.rotation.y += 0.0007;

  for (var id in rendered) { var bld = rendered[id]; bld.scale.setScalar(lerp(bld.scale.x, bld.userData.targetScale || 1, 0.16)); if (bld.userData.hub) bld.userData.hub.rotation.z += 0.06; }

  if (pulse > 0) { pulse = Math.max(0, pulse - 0.02); hlMat.opacity = (window.__buildMode && !window.__bulldoze ? 0.3 : 0) + 0.6 * pulse; hl.scale.setScalar(1 + (1 - pulse) * 0.3); }
  else if (window.__buildMode && !window.__bulldoze) { hlMat.opacity = 0.3; hl.scale.setScalar(1); }

  controls.update();
  renderer.render(scene, camera);
}
tick();
</script>
</body>
</html>`;
