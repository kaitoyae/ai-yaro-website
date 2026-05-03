import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SURFACE_SIZE = 18;
const DESKTOP_SEGMENTS = 86;
const MOBILE_SEGMENTS = 58;
const CONTOUR_LEVELS = 22;
const CONTOUR_SEGMENTS = 88;
const TRAIL_POINTS = 38;
const PATH_SAMPLE_COUNT = 260;

type SurfaceData = {
  baseHeights: Float32Array;
  coordinates: Float32Array;
  geometry: THREE.BufferGeometry;
};

type LossSample = {
  x: number;
  z: number;
  value: number;
};

type ScrollState = {
  progress: number;
  targetProgress: number;
  velocity: number;
  targetVelocity: number;
  lastScrollY: number;
  lastUpdateTime: number;
};

type SceneLayout = {
  cameraY: number;
  cameraZ: number;
  worldScale: number;
  worldY: number;
};

const colorLow = new THREE.Color('#00ff9d');
const colorMid = new THREE.Color('#01a7ff');
const colorHigh = new THREE.Color('#7000ff');
const colorPeak = new THREE.Color('#ff2bd6');

const sampleRawLoss = (x: number, z: number) => {
  const radius = x * x + z * z;
  const curvedValley = 0.026 * x * x + 0.036 * (z + 0.17 * x * x + 1.25) ** 2;
  const globalBowl = 0.012 * radius;
  const basin = -1.35 * Math.exp(-((x - 0.45) ** 2 * 0.72 + (z + 1.35) ** 2 * 1.15));
  const ripples = 0.24 * Math.sin(x * 1.35 + 0.35) * Math.cos(z * 1.08 - 0.2) * Math.exp(-radius * 0.024);
  const saddle = 0.12 * Math.sin((x - z) * 1.18);

  return (curvedValley + globalBowl + basin + ripples + saddle) * 1.45;
};

const sampleLoss = (x: number, z: number) => {
  const rawLoss = sampleRawLoss(x, z);

  return Math.sign(rawLoss) * Math.log1p(Math.abs(rawLoss)) * 1.22;
};

const sampleGradient = (x: number, z: number) => {
  const epsilon = 0.025;

  return {
    x: (sampleLoss(x + epsilon, z) - sampleLoss(x - epsilon, z)) / (epsilon * 2),
    z: (sampleLoss(x, z + epsilon) - sampleLoss(x, z - epsilon)) / (epsilon * 2),
  };
};

const getTerrainColor = (level: number) => {
  const t = THREE.MathUtils.clamp(level, 0, 1);
  const color = new THREE.Color();

  if (t < 0.36) {
    color.copy(colorLow).lerp(colorMid, t / 0.36);
  } else if (t < 0.75) {
    color.copy(colorMid).lerp(colorHigh, (t - 0.36) / 0.39);
  } else {
    color.copy(colorHigh).lerp(colorPeak, (t - 0.75) / 0.25);
  }

  return color.multiplyScalar(0.52 + t * 0.72);
};

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);

const easeBetween = (value: number, min: number, max: number) => THREE.MathUtils.smoothstep(value, min, max);

const getScrollRange = () => {
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );

  return Math.max(documentHeight - window.innerHeight, 1);
};

const isWebGLAvailable = () => {
  if (!window.WebGLRenderingContext) return false;

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

    context?.getExtension('WEBGL_lose_context')?.loseContext();

    return Boolean(context);
  } catch {
    return false;
  }
};

const createSurfaceData = (segments: number): SurfaceData => {
  const vertexCount = (segments + 1) * (segments + 1);
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const baseHeights = new Float32Array(vertexCount);
  const coordinates = new Float32Array(vertexCount * 2);
  const indices: number[] = [];
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  let vertexIndex = 0;

  for (let zIndex = 0; zIndex <= segments; zIndex++) {
    const z = (zIndex / segments - 0.5) * SURFACE_SIZE;

    for (let xIndex = 0; xIndex <= segments; xIndex++) {
      const x = (xIndex / segments - 0.5) * SURFACE_SIZE;
      const y = sampleLoss(x, z);
      const positionIndex = vertexIndex * 3;
      const coordinateIndex = vertexIndex * 2;

      positions[positionIndex] = x;
      positions[positionIndex + 1] = y;
      positions[positionIndex + 2] = z;
      baseHeights[vertexIndex] = y;
      coordinates[coordinateIndex] = x;
      coordinates[coordinateIndex + 1] = z;
      minHeight = Math.min(minHeight, y);
      maxHeight = Math.max(maxHeight, y);
      vertexIndex++;
    }
  }

  const range = Math.max(maxHeight - minHeight, 1);

  for (let index = 0; index < vertexCount; index++) {
    const normalizedHeight = (baseHeights[index] - minHeight) / range;
    const color = getTerrainColor(normalizedHeight);
    const colorIndex = index * 3;

    colors[colorIndex] = color.r;
    colors[colorIndex + 1] = color.g;
    colors[colorIndex + 2] = color.b;
  }

  for (let zIndex = 0; zIndex < segments; zIndex++) {
    for (let xIndex = 0; xIndex < segments; xIndex++) {
      const topLeft = zIndex * (segments + 1) + xIndex;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + segments + 1;
      const bottomRight = bottomLeft + 1;

      indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { baseHeights, coordinates, geometry };
};

const getSurfaceHeightRange = (segments: number) => {
  let minHeight = Infinity;
  let maxHeight = -Infinity;

  for (let zIndex = 0; zIndex <= segments; zIndex++) {
    const z = (zIndex / segments - 0.5) * SURFACE_SIZE;

    for (let xIndex = 0; xIndex <= segments; xIndex++) {
      const x = (xIndex / segments - 0.5) * SURFACE_SIZE;
      const value = sampleLoss(x, z);

      minHeight = Math.min(minHeight, value);
      maxHeight = Math.max(maxHeight, value);
    }
  }

  return { maxHeight, minHeight };
};

const interpolateCrossing = (start: LossSample, end: LossSample, level: number): THREE.Vector3 | null => {
  const difference = end.value - start.value;

  if (Math.abs(difference) < 0.0001) return null;

  const amount = THREE.MathUtils.clamp((level - start.value) / difference, 0, 1);
  const x = THREE.MathUtils.lerp(start.x, end.x, amount);
  const z = THREE.MathUtils.lerp(start.z, end.z, amount);

  return new THREE.Vector3(x, level + 0.075, z);
};

const addContourSegment = (
  positions: number[],
  colors: number[],
  start: THREE.Vector3,
  end: THREE.Vector3,
  level: number,
  minHeight: number,
  maxHeight: number,
) => {
  const normalizedLevel = (level - minHeight) / Math.max(maxHeight - minHeight, 1);
  const color = getTerrainColor(normalizedLevel).lerp(new THREE.Color('#ffffff'), 0.2);

  positions.push(start.x, start.y, start.z, end.x, end.y, end.z);

  for (let index = 0; index < 2; index++) {
    colors.push(color.r, color.g, color.b);
  }
};

const createContourGeometry = (minHeight: number, maxHeight: number) => {
  const gridSize = CONTOUR_SEGMENTS + 1;
  const values = new Float32Array(gridSize * gridSize);
  const positions: number[] = [];
  const colors: number[] = [];
  const cellStep = SURFACE_SIZE / CONTOUR_SEGMENTS;

  for (let zIndex = 0; zIndex < gridSize; zIndex++) {
    const z = (zIndex / CONTOUR_SEGMENTS - 0.5) * SURFACE_SIZE;

    for (let xIndex = 0; xIndex < gridSize; xIndex++) {
      const x = (xIndex / CONTOUR_SEGMENTS - 0.5) * SURFACE_SIZE;
      values[zIndex * gridSize + xIndex] = sampleLoss(x, z);
    }
  }

  for (let levelIndex = 1; levelIndex <= CONTOUR_LEVELS; levelIndex++) {
    const level = THREE.MathUtils.lerp(minHeight + 0.15, maxHeight - 0.4, levelIndex / (CONTOUR_LEVELS + 1));

    for (let zIndex = 0; zIndex < CONTOUR_SEGMENTS; zIndex++) {
      const z = (zIndex / CONTOUR_SEGMENTS - 0.5) * SURFACE_SIZE;

      for (let xIndex = 0; xIndex < CONTOUR_SEGMENTS; xIndex++) {
        const x = (xIndex / CONTOUR_SEGMENTS - 0.5) * SURFACE_SIZE;
        const corners: LossSample[] = [
          { value: values[zIndex * gridSize + xIndex], x, z },
          { value: values[zIndex * gridSize + xIndex + 1], x: x + cellStep, z },
          { value: values[(zIndex + 1) * gridSize + xIndex + 1], x: x + cellStep, z: z + cellStep },
          { value: values[(zIndex + 1) * gridSize + xIndex], x, z: z + cellStep },
        ];
        const crossings: THREE.Vector3[] = [];

        for (let edgeIndex = 0; edgeIndex < 4; edgeIndex++) {
          const start = corners[edgeIndex];
          const end = corners[(edgeIndex + 1) % 4];
          const crossesLevel = (start.value <= level && end.value > level) || (start.value > level && end.value <= level);
          const crossing = crossesLevel ? interpolateCrossing(start, end, level) : null;

          if (crossing) crossings.push(crossing);
        }

        if (crossings.length === 2) {
          addContourSegment(positions, colors, crossings[0], crossings[1], level, minHeight, maxHeight);
        }

        if (crossings.length === 4) {
          addContourSegment(positions, colors, crossings[0], crossings[1], level, minHeight, maxHeight);
          addContourSegment(positions, colors, crossings[2], crossings[3], level, minHeight, maxHeight);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

  return geometry;
};

const createDescentPoints = () => {
  const points: THREE.Vector3[] = [];
  let x = -7;
  let z = 5.8;
  let velocityX = 0;
  let velocityZ = 0;

  for (let index = 0; index < 40; index++) {
    const y = sampleLoss(x, z) + 0.26;
    const gradient = sampleGradient(x, z);

    points.push(new THREE.Vector3(x, y, z));

    velocityX = velocityX * 0.45 - gradient.x * 0.58;
    velocityZ = velocityZ * 0.45 - gradient.z * 0.58;

    const velocityLength = Math.hypot(velocityX, velocityZ);
    const maxStep = 0.9 * Math.max(0.32, 1 - index / 78);

    if (velocityLength > maxStep) {
      velocityX = (velocityX / velocityLength) * maxStep;
      velocityZ = (velocityZ / velocityLength) * maxStep;
    }

    x += velocityX;
    z += velocityZ;

    if (index > 20 && Math.hypot(gradient.x, gradient.z) < 0.035) break;
  }

  return points;
};

const createOptimizer = () => {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.16, 3),
    new THREE.MeshStandardMaterial({
      color: '#f4fff9',
      emissive: '#00ff9d',
      emissiveIntensity: 1.65,
      metalness: 0.1,
      roughness: 0.16,
    }),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 32, 16),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: '#00ff9d',
      depthWrite: false,
      opacity: 0.16,
      transparent: true,
    }),
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.007, 8, 96),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: '#d8fff2',
      depthWrite: false,
      opacity: 0.75,
      transparent: true,
    }),
  );

  ring.rotation.x = Math.PI / 2;
  group.add(halo, ring, core);

  return { group, halo, ring };
};

const createTrail = () => {
  const positions = new Float32Array(TRAIL_POINTS * 3);
  const colors = new Float32Array(TRAIL_POINTS * 3);

  for (let index = 0; index < TRAIL_POINTS; index++) {
    const fade = 1 - index / TRAIL_POINTS;
    const color = new THREE.Color('#00ff9d').lerp(new THREE.Color('#7000ff'), index / TRAIL_POINTS);
    const colorIndex = index * 3;

    colors[colorIndex] = color.r * fade;
    colors[colorIndex + 1] = color.g * fade;
    colors[colorIndex + 2] = color.b * fade;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.9,
    size: 0.095,
    sizeAttenuation: true,
    transparent: true,
    vertexColors: true,
  });

  return { geometry, material, positions, points: new THREE.Points(geometry, material) };
};

const createRevealedPath = (curve: THREE.CatmullRomCurve3) => {
  const positions = new Float32Array(PATH_SAMPLE_COUNT * 3);
  const colors = new Float32Array(PATH_SAMPLE_COUNT * 3);

  for (let index = 0; index < PATH_SAMPLE_COUNT; index++) {
    const progress = index / (PATH_SAMPLE_COUNT - 1);
    const point = curve.getPointAt(progress);
    const positionIndex = index * 3;
    const color = new THREE.Color('#00ff9d').lerp(new THREE.Color('#f7f0ff'), progress * 0.72);
    const falloff = 0.48 + progress * 0.72;

    positions[positionIndex] = point.x;
    positions[positionIndex + 1] = point.y + 0.035;
    positions[positionIndex + 2] = point.z;
    colors[positionIndex] = color.r * falloff;
    colors[positionIndex + 1] = color.g * falloff;
    colors[positionIndex + 2] = color.b * falloff;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setDrawRange(0, 2);

  const material = new THREE.LineBasicMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.92,
    transparent: true,
    vertexColors: true,
  });
  const line = new THREE.Line(geometry, material);

  line.frustumCulled = false;

  return { geometry, line, material };
};

const createDescentMarkers = (points: THREE.Vector3[]) => {
  const positions = new Float32Array(points.length * 3);
  const colors = new Float32Array(points.length * 3);

  points.forEach((point, index) => {
    const progress = index / Math.max(points.length - 1, 1);
    const positionIndex = index * 3;
    const color = new THREE.Color('#ffffff').lerp(new THREE.Color('#00ff9d'), 0.78 - progress * 0.3);

    positions[positionIndex] = point.x;
    positions[positionIndex + 1] = point.y + 0.09;
    positions[positionIndex + 2] = point.z;
    colors[positionIndex] = color.r;
    colors[positionIndex + 1] = color.g;
    colors[positionIndex + 2] = color.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setDrawRange(0, 1);

  const material = new THREE.PointsMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.86,
    size: 0.07,
    sizeAttenuation: true,
    transparent: true,
    vertexColors: true,
  });
  const markers = new THREE.Points(geometry, material);

  markers.frustumCulled = false;

  return { geometry, markers, material };
};

const createAmbientParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index++) {
    const positionIndex = index * 3;
    const color = new THREE.Color(index % 3 === 0 ? '#00ff9d' : index % 3 === 1 ? '#01a7ff' : '#ff2bd6');

    positions[positionIndex] = (Math.random() - 0.5) * 23;
    positions[positionIndex + 1] = Math.random() * 7 - 2;
    positions[positionIndex + 2] = (Math.random() - 0.5) * 18;
    colors[positionIndex] = color.r;
    colors[positionIndex + 1] = color.g;
    colors[positionIndex + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.38,
    size: 0.035,
    sizeAttenuation: true,
    transparent: true,
    vertexColors: true,
  });

  return new THREE.Points(geometry, material);
};

const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
};

const disposeScene = (scene: THREE.Scene) => {
  scene.traverse((object) => {
    const renderable = object as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };

    renderable.geometry?.dispose();

    if (renderable.material) {
      disposeMaterial(renderable.material);
    }
  });
};

export const GradientDescentBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!isWebGLAvailable()) {
      if (import.meta.env.DEV) {
        console.warn('GradientDescentBackground: WebGL is unavailable, so the decorative background was disabled.');
      }

      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80);
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('GradientDescentBackground: WebGL is unavailable, so the decorative background was disabled.', error);
      }

      return;
    }
    const startTime = performance.now();
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const scroll: ScrollState = {
      lastScrollY: window.scrollY || window.pageYOffset,
      lastUpdateTime: performance.now(),
      progress: 0,
      targetProgress: 0,
      targetVelocity: 0,
      velocity: 0,
    };
    const layout: SceneLayout = {
      cameraY: 8.05,
      cameraZ: 13.85,
      worldScale: 1,
      worldY: -2.65,
    };
    const world = new THREE.Group();
    const lookAtTarget = new THREE.Vector3(0, -0.95, -1.35);
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? MOBILE_SEGMENTS : DESKTOP_SEGMENTS;
    const surfaceData = createSurfaceData(segments);
    const { maxHeight, minHeight } = getSurfaceHeightRange(CONTOUR_SEGMENTS);
    const surface = new THREE.Mesh(
      surfaceData.geometry,
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#061311',
        emissiveIntensity: 0.24,
        metalness: 0.18,
        opacity: 0.78,
        roughness: 0.38,
        side: THREE.FrontSide,
        transparent: true,
        vertexColors: true,
      }),
    );
    const contourLines = new THREE.LineSegments(
      createContourGeometry(minHeight, maxHeight),
      new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.66,
        transparent: true,
        vertexColors: true,
      }),
    );
    const descentPoints = createDescentPoints();
    const pathCurve = new THREE.CatmullRomCurve3(descentPoints, false, 'catmullrom', 0.2);
    const pathMaterial = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: '#caffef',
      depthWrite: false,
      opacity: 0.22,
      transparent: true,
    });
    const path = new THREE.Mesh(
      new THREE.TubeGeometry(pathCurve, 220, 0.022, 8, false),
      pathMaterial,
    );
    const revealedPath = createRevealedPath(pathCurve);
    const descentMarkers = createDescentMarkers(descentPoints);
    const optimizer = createOptimizer();
    const trail = createTrail();
    const particles = createAmbientParticles(isMobile ? 120 : 220);
    const optimizerLight = new THREE.PointLight('#00ff9d', 3.8, 7.5, 1.9);
    let animationFrameId = 0;
    let normalFrame = 0;

    renderer.setClearColor(0x030303, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.width = '100%';

    scene.fog = new THREE.FogExp2(0x030303, 0.044);
    scene.add(new THREE.AmbientLight(0x7ce7ff, 0.55));

    const keyLight = new THREE.DirectionalLight(0x72fff0, 2.1);
    keyLight.position.set(-4, 9, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff2bd6, 1.15);
    rimLight.position.set(5, 4, -5);
    scene.add(rimLight);

    surface.renderOrder = 1;
    contourLines.renderOrder = 2;
    path.renderOrder = 3;
    revealedPath.line.renderOrder = 4;
    descentMarkers.markers.renderOrder = 5;
    trail.points.renderOrder = 6;
    optimizer.group.renderOrder = 7;
    particles.renderOrder = 0;

    world.rotation.y = -0.38;
    world.add(surface, contourLines, path, revealedPath.line, descentMarkers.markers, trail.points, particles, optimizer.group, optimizerLight);
    scene.add(world);
    container.appendChild(renderer.domElement);

    const updateScrollTarget = () => {
      const now = performance.now();
      const scrollY = Math.max(window.scrollY || window.pageYOffset, 0);
      const deltaTime = Math.max(now - scroll.lastUpdateTime, 16);
      const deltaY = scrollY - scroll.lastScrollY;

      scroll.targetProgress = clamp01(scrollY / getScrollRange());
      scroll.targetVelocity = THREE.MathUtils.clamp(deltaY / deltaTime / 1.6, -1.8, 1.8);
      scroll.lastScrollY = scrollY;
      scroll.lastUpdateTime = now;
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.35 : 1.7);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 768 ? 52 : 45;
      layout.cameraY = width < 768 ? 9.3 : 8.05;
      layout.cameraZ = width < 768 ? 16.4 : 13.85;
      layout.worldY = width < 768 ? -2.35 : -2.65;
      layout.worldScale = width < 768 ? 0.82 : 1;
      camera.position.set(0, layout.cameraY, layout.cameraZ);
      world.position.y = layout.worldY;
      world.scale.setScalar(layout.worldScale);
      camera.updateProjectionMatrix();
      updateScrollTarget();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateSurface = (elapsed: number, scrollProgress: number, scrollEnergy: number, optimizerPoint: THREE.Vector3) => {
      const position = surfaceData.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positionArray = position.array as Float32Array;
      const transitionWave = Math.sin(scrollProgress * Math.PI);
      const scrollPhase = scrollProgress * Math.PI * 7.2;

      for (let index = 0; index < surfaceData.baseHeights.length; index++) {
        const coordinateIndex = index * 2;
        const x = surfaceData.coordinates[coordinateIndex];
        const z = surfaceData.coordinates[coordinateIndex + 1];
        const wave =
          Math.sin(elapsed * 0.58 + x * 0.72 + z * 0.43) *
          Math.cos(elapsed * 0.31 + z * 0.62) *
          Math.exp(-(x * x + z * z) * 0.006) *
          0.055;
        const stream =
          Math.sin(scrollPhase + x * 0.34 - z * 0.22) *
          Math.exp(-(x * x + z * z) * 0.004) *
          transitionWave *
          (0.035 + scrollEnergy * 0.055);
        const optimizerDistance = (x - optimizerPoint.x) ** 2 + (z - optimizerPoint.z) ** 2;
        const optimizerWake =
          Math.exp(-optimizerDistance * 0.48) * Math.sin(elapsed * 5.2 + scrollPhase) * (0.07 + scrollEnergy * 0.16);
        const descentPressure = -Math.exp(-optimizerDistance * 0.78) * (0.035 + scrollEnergy * 0.07);

        positionArray[index * 3 + 1] = surfaceData.baseHeights[index] + wave + stream + optimizerWake + descentPressure;
      }

      position.needsUpdate = true;
      normalFrame++;

      if (normalFrame % 4 === 0) {
        surfaceData.geometry.computeVertexNormals();
      }
    };

    const updateTrail = (phase: number) => {
      for (let index = 0; index < TRAIL_POINTS; index++) {
        const samplePhase = Math.max(0, phase - index * 0.011);
        const point = pathCurve.getPointAt(samplePhase);
        const positionIndex = index * 3;

        trail.positions[positionIndex] = point.x;
        trail.positions[positionIndex + 1] = point.y;
        trail.positions[positionIndex + 2] = point.z;
      }

      (trail.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    };

    const updateScrollReveals = (phase: number, scrollEnergy: number) => {
      const visiblePathPoints = Math.max(2, Math.round(phase * (PATH_SAMPLE_COUNT - 1)) + 1);
      const visibleMarkers = Math.max(1, Math.round(phase * descentPoints.length));

      revealedPath.geometry.setDrawRange(0, visiblePathPoints);
      descentMarkers.geometry.setDrawRange(0, visibleMarkers);
      revealedPath.material.opacity = 0.78 + scrollEnergy * 0.16;
      descentMarkers.material.opacity = 0.68 + scrollEnergy * 0.22;
      pathMaterial.opacity = 0.16 + phase * 0.12;
    };

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const reducedMotion = reducedMotionQuery.matches;
      const activeTime = reducedMotion ? 12 : elapsed;
      const progressLerp = reducedMotion ? 1 : 0.082;

      scroll.progress = THREE.MathUtils.lerp(scroll.progress, scroll.targetProgress, progressLerp);
      scroll.velocity = THREE.MathUtils.lerp(scroll.velocity, scroll.targetVelocity, reducedMotion ? 1 : 0.12);
      scroll.targetVelocity *= 0.86;

      const scrollProgress = reducedMotion ? scroll.targetProgress : scroll.progress;
      const scrollEase = easeBetween(scrollProgress, 0.02, 0.96);
      const sectionSweep = Math.sin(scrollProgress * Math.PI);
      const scrollEnergy = reducedMotion ? 0 : Math.min(Math.abs(scroll.velocity), 1);
      const autoDrift = reducedMotion ? 0 : Math.sin(activeTime * 0.42) * 0.018;
      const phase = clamp01(0.035 + scrollProgress * 0.925 + autoDrift);
      const optimizerPoint = pathCurve.getPointAt(phase);
      const pulse = 1 + Math.sin(activeTime * 4.4) * 0.12 + scrollEnergy * 0.22;

      animationFrameId = window.requestAnimationFrame(animate);
      pointer.x = THREE.MathUtils.lerp(pointer.x, pointerTarget.x, 0.045);
      pointer.y = THREE.MathUtils.lerp(pointer.y, pointerTarget.y, 0.045);

      if (!reducedMotion) {
        updateSurface(elapsed, scrollProgress, scrollEnergy, optimizerPoint);
        particles.rotation.y = elapsed * 0.018 + scrollProgress * 1.45;
        particles.rotation.x = Math.sin(elapsed * 0.11) * 0.035;
        optimizer.group.rotation.y = elapsed * 1.7;
        optimizer.group.rotation.z = Math.sin(elapsed * 1.3) * 0.26;
      }

      world.rotation.y = -0.38 + scrollEase * 0.72 + pointer.x * 0.09 + Math.sin(activeTime * 0.08) * 0.035 + scroll.velocity * 0.055;
      world.rotation.x = pointer.y * 0.025 - easeBetween(scrollProgress, 0.16, 0.84) * 0.34;
      world.position.x = Math.sin(scrollProgress * Math.PI * 1.16) * (window.innerWidth < 768 ? -0.16 : -0.58);
      world.position.y = layout.worldY + sectionSweep * 0.48 - scrollEase * (window.innerWidth < 768 ? 0.14 : 0.34);
      world.position.z = -scrollEase * 1.16;
      world.scale.setScalar(layout.worldScale * (1 + scrollEase * (window.innerWidth < 768 ? 0.06 : 0.12)));

      updateTrail(phase);
      updateScrollReveals(phase, scrollEnergy);
      optimizer.group.position.copy(optimizerPoint);
      optimizer.halo.scale.setScalar(pulse);
      optimizer.ring.scale.setScalar(1.1 + Math.sin(activeTime * 3.2) * 0.12);
      optimizerLight.position.copy(optimizerPoint);
      optimizerLight.intensity = 3.5 + Math.sin(activeTime * 5.6) * 1.2 + scrollEnergy * 2.2;

      const cameraSweep = Math.sin(scrollProgress * Math.PI * 1.35);
      const cameraTargetX = pointer.x * 0.58 + cameraSweep * (window.innerWidth < 768 ? 0.36 : 0.94) + scroll.velocity * 0.28;
      const cameraTargetY = layout.cameraY + pointer.y * 0.25 + sectionSweep * (window.innerWidth < 768 ? 0.74 : 1.18) - scrollEase * 0.52;
      const cameraTargetZ = layout.cameraZ - scrollEase * (window.innerWidth < 768 ? 2.5 : 3.35) + scrollEnergy * 0.24;
      const targetLookAt = new THREE.Vector3(
        THREE.MathUtils.lerp(0, optimizerPoint.x * 0.12, scrollEase),
        THREE.MathUtils.lerp(-0.95, optimizerPoint.y - 0.45, scrollEase * 0.64),
        THREE.MathUtils.lerp(-1.35, optimizerPoint.z * 0.18 - 0.7, scrollEase),
      );

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraTargetX, reducedMotion ? 1 : 0.055);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraTargetY, reducedMotion ? 1 : 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraTargetZ, reducedMotion ? 1 : 0.05);
      lookAtTarget.lerp(targetLookAt, reducedMotion ? 1 : 0.07);
      camera.lookAt(lookAtTarget);
      renderer.render(scene, camera);
    };

    resize();
    updateScrollTarget();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', updateScrollTarget);
      disposeScene(scene);
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div ref={containerRef} className="absolute inset-0 opacity-95" style={{ filter: 'saturate(1.18) contrast(1.07)' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,3,3,0.2),rgba(3,3,3,0.04)_38%,rgba(3,3,3,0.78)),linear-gradient(to_right,rgba(3,3,3,0.74),rgba(3,3,3,0.06)_28%,rgba(3,3,3,0.06)_72%,rgba(3,3,3,0.74))]" />
    </div>
  );
};
