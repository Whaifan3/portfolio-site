import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./Prism.css";

export default function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const H = Math.max(0.001, height);
    const baseHalf = Math.max(0.001, baseWidth) * 0.5;
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const renderer = new Renderer({ dpr, alpha: transparent, antialias: true });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
    container.appendChild(gl.canvas);

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragment = /* glsl */ `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3 uRot;
      uniform int uUseBaseWobble;
      uniform float uGlow;
      uniform vec2 uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      vec4 tanh4(vec4 x) {
        vec4 e2x = exp(2.0 * x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p) {
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p) {
        return max(sdOctaAnisoInv(p), -p.y);
      }

      mat3 hueRotation(float a) {
        float c = cos(a), s = sin(a);
        mat3 W = mat3(0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114);
        mat3 U = mat3(0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.300, -0.588, 0.886);
        mat3 V = mat3(0.168, -0.331, 0.500, 0.328, 0.035, -0.500, -0.497, 0.296, 0.201);
        return W + U * c + V * s;
      }

      void main() {
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;
        float z = 5.0;
        float d = 0.0;
        vec3 p;
        vec4 o = vec4(0.0);
        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t);
          wob = mat2(c0, cos(t + 33.0), cos(t + 11.0), c0);
        }
        const int STEPS = 100;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += uCenterShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (sin((p.y + z) * uColorFreq + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }
        o = tanh4(o * o * (uGlow * uBloom) / 1e5);
        vec3 col = o.rgb;
        col += (rand(gl_FragCoord.xy + vec2(iTime)) - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);
        float luminance = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(luminance), col, uSaturation), 0.0, 1.0);
        if (abs(uHueShift) > 0.0001) col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        gl_FragColor = vec4(col, o.a);
      }
    `;

    const resolution = new Float32Array(2);
    const offsetPx = new Float32Array(2);
    const rotation = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: resolution },
        iTime: { value: 0 },
        uHeight: { value: H },
        uBaseHalf: { value: baseHalf },
        uUseBaseWobble: { value: animationType === "rotate" ? 1 : 0 },
        uRot: { value: rotation },
        uGlow: { value: Math.max(0, glow) },
        uOffsetPx: { value: offsetPx },
        uNoise: { value: Math.max(0, noise) },
        uSaturation: { value: transparent ? 1.5 : 1 },
        uScale: { value: Math.max(0.001, scale) },
        uHueShift: { value: hueShift || 0 },
        uColorFreq: { value: Math.max(0, colorFrequency || 1) },
        uBloom: { value: Math.max(0, bloom || 1) },
        uCenterShift: { value: H * 0.25 },
        uInvBaseHalf: { value: 1 / baseHalf },
        uInvHeight: { value: 1 / H },
        uMinAxis: { value: Math.min(baseHalf, H) },
        uPxScale: { value: 1 },
        uTimeScale: { value: Math.max(0, timeScale || 1) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const width = container.clientWidth || 1;
      const canvasHeight = container.clientHeight || 1;
      renderer.setSize(width, canvasHeight);
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      offsetPx[0] = (offset?.x ?? 0) * dpr;
      offsetPx[1] = (offset?.y ?? 0) * dpr;
      program.uniforms.uPxScale.value = 1 / ((gl.drawingBufferHeight || 1) * 0.1 * Math.max(0.001, scale));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const setEuler = (yaw, pitch, roll) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cx = Math.cos(pitch), sx = Math.sin(pitch);
      const cz = Math.cos(roll), sz = Math.sin(roll);
      rotation.set([
        cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz,
        -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz,
        sy * cx, -sx, cy * cx,
      ]);
    };

    let raf = 0;
    let visible = true;
    let targetYaw = 0;
    let targetPitch = 0;
    let yaw = 0;
    let pitch = 0;
    const startedAt = performance.now();
    const render = (now) => {
      const time = (now - startedAt) * 0.001;
      program.uniforms.iTime.value = time;
      if (animationType === "hover") {
        yaw += (targetYaw - yaw) * Math.min(1, Math.max(0, inertia));
        pitch += (targetPitch - pitch) * Math.min(1, Math.max(0, inertia));
        setEuler(yaw, pitch, 0);
      } else if (animationType === "3drotate") {
        const t = time * Math.max(0, timeScale);
        setEuler(t * 0.32, Math.sin(t * 0.43) * 0.42, Math.sin(t * 0.27) * 0.24);
      }
      renderer.render({ scene: mesh });
      raf = visible ? requestAnimationFrame(render) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(render); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

    const pointerSurface = container.closest(".hero") ?? container;
    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      targetYaw = -Math.max(-1, Math.min(1, x)) * 0.6 * hoverStrength;
      targetPitch = Math.max(-1, Math.min(1, y)) * 0.6 * hoverStrength;
      start();
    };
    if (animationType === "hover") pointerSurface.addEventListener("pointermove", onPointerMove, { passive: true });

    let intersectionObserver;
    if (suspendWhenOffscreen) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start(); else stop();
      });
      intersectionObserver.observe(container);
    }
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      pointerSurface.removeEventListener("pointermove", onPointerMove);
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
    };
  }, [height, baseWidth, animationType, glow, noise, offset?.x, offset?.y, scale, transparent, hueShift, colorFrequency, timeScale, hoverStrength, inertia, bloom, suspendWhenOffscreen]);

  return <div className="prism-container" ref={containerRef} />;
}
