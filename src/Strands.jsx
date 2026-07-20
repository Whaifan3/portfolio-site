import { Color, Mesh, Program, Renderer, RenderTarget, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import "./Strands.css";

const MAX_STRANDS = 12;
const MAX_COLORS = 8;

const vertexShader = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const strandShader = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;
out vec4 fragColor;
const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);
  float energy = 0.06 + uIntensity * 0.94;
  float envelope = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);
  vec3 color = vec3(0.0);

  for (int i = 0; i < ${MAX_STRANDS}; i++) {
    if (i >= uStrandCount) break;
    float fi = float(i);
    float phase = fi * 1.7 * uSpread;
    float frequency = (2.0 + fi * 0.35) * uWaviness;
    float strandSpeed = 1.4 + fi * 1.2;
    float time = uTime * uSpeed;
    float wave = sin(uv.x * frequency + time * strandSpeed + phase) * 0.60
      + sin(uv.x * frequency * 1.1 - time * strandSpeed * 0.7 + phase * 1.7) * 0.40;
    float amplitude = (0.1 + 0.02 * energy) * envelope * uAmplitude;
    float y = wave * amplitude;
    float distanceToStrand = abs(uv.y - y);
    float strandWidth = (0.001 + 0.05 * energy) * (0.35 + envelope) * uThickness;
    float strand = strandWidth / (distanceToStrand + strandWidth * 0.45);
    strand *= strand;
    float hue = fi / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    color += strandColor(hue) * strand * envelope;
  }

  color *= 0.45 + 0.7 * energy;
  color = 1.0 - exp(-color * uGlow);
  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = max(mix(vec3(gray), color, uSaturation), 0.0);
  float luminance = max(max(color.r, color.g), color.b);
  float alpha = clamp(luminance, 0.0, 1.0) * uOpacity;
  fragColor = vec4(color * uOpacity, alpha);
}
`;

const glassShader = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uRefraction;
uniform float uDispersion;
out vec4 fragColor;

vec2 toUv(vec2 p) { return p * (uResolution.y / uResolution) + 0.5; }

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float distanceFromCenter = length(p);
  float radius = uRadius;
  float edge = fwidth(distanceFromCenter) * 1.5;
  float mask = 1.0 - smoothstep(radius - edge, radius + edge, distanceFromCenter);
  if (mask <= 0.0) { fragColor = vec4(0.0); return; }
  float z = sqrt(max(radius * radius - distanceFromCenter * distanceFromCenter, 0.0)) / radius;
  float normalizedDistance = distanceFromCenter / radius;
  vec2 direction = distanceFromCenter > 0.0 ? p / distanceFromCenter : vec2(0.0);
  float lens = smoothstep(0.85, 1.0, normalizedDistance) * pow(normalizedDistance, 6.0);
  vec2 offset = -direction * lens * uRefraction * 0.15;
  vec2 dispersion = -direction * lens * uDispersion * 0.012;
  vec3 light;
  light.r = texture(uScene, toUv(p + offset - dispersion)).r;
  light.g = texture(uScene, toUv(p + offset)).g;
  light.b = texture(uScene, toUv(p + offset + dispersion)).b;
  float fresnel = pow(1.0 - z, 3.0);
  vec3 rim = vec3(1.0) * fresnel * 0.18;
  vec2 lightDirection = normalize(vec2(-0.55, 0.6));
  float specular = pow(max(dot(p / max(radius, 0.0001), lightDirection), 0.0), 6.0);
  specular *= smoothstep(radius, radius * 0.55, distanceFromCenter);
  vec3 emissive = light + rim + vec3(specular) * 0.4;
  float emissiveAlpha = clamp(max(max(emissive.r, emissive.g), emissive.b), 0.0, 1.0);
  float bodyAlpha = 0.05 + fresnel * 0.05;
  float alpha = emissiveAlpha + bodyAlpha * (1.0 - emissiveAlpha);
  fragColor = vec4(emissive * mask, alpha * mask);
}
`;

function buildPalette(colors) {
  const source = colors?.length ? colors : ["#ffffff"];
  return Array.from({ length: MAX_COLORS }, (_, index) => {
    const color = new Color(source[index] ?? source[source.length - 1]);
    return [color.r, color.g, color.b];
  });
}

export default function Strands({
  colors = ["#2866ff", "#7b9cff", "#e6ecff"],
  count = 3,
  speed = 0.5,
  amplitude = 1,
  waviness = 1,
  thickness = 0.7,
  glow = 2.6,
  taper = 3,
  spread = 1,
  hueShift = 0,
  intensity = 0.6,
  saturation = 1.2,
  opacity = 1,
  scale = 1.5,
  glass = false,
  refraction = 1,
  dispersion = 1,
  glassSize = 1,
  className = "",
  style,
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { colors, count, speed, amplitude, waviness, thickness, glow, taper, spread, hueShift, intensity, saturation, opacity, scale, glass, refraction, dispersion, glassSize };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr: Math.min(1.5, window.devicePixelRatio || 1) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const current = propsRef.current;
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: strandShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uColors: { value: buildPalette(current.colors) },
        uColorCount: { value: Math.min(current.colors.length, MAX_COLORS) },
        uStrandCount: { value: Math.min(current.count, MAX_STRANDS) },
        uSpeed: { value: current.speed },
        uAmplitude: { value: current.amplitude },
        uWaviness: { value: current.waviness },
        uThickness: { value: current.thickness },
        uGlow: { value: current.glow },
        uTaper: { value: current.taper },
        uSpread: { value: current.spread },
        uHueShift: { value: current.hueShift },
        uIntensity: { value: current.intensity },
        uOpacity: { value: current.opacity },
        uScale: { value: current.scale },
        uSaturation: { value: current.saturation },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const renderTarget = new RenderTarget(gl, { width: 1, height: 1 });
    const glassProgram = new Program(gl, {
      vertex: vertexShader,
      fragment: glassShader,
      uniforms: {
        uScene: { value: renderTarget.texture },
        uResolution: { value: [1, 1] },
        uRadius: { value: 0.46 * current.glassSize },
        uRefraction: { value: current.refraction },
        uDispersion: { value: current.dispersion },
      },
    });
    const glassMesh = new Mesh(gl, { geometry, program: glassProgram });
    container.appendChild(gl.canvas);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      renderTarget.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      glassProgram.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let animationFrame = 0;
    let visible = true;
    const update = (time) => {
      if (!visible) { animationFrame = 0; return; }
      animationFrame = requestAnimationFrame(update);
      const values = propsRef.current;
      program.uniforms.uTime.value = time * 0.001;
      program.uniforms.uColors.value = buildPalette(values.colors);
      program.uniforms.uColorCount.value = Math.min(values.colors.length, MAX_COLORS);
      program.uniforms.uStrandCount.value = Math.min(Math.max(Math.round(values.count), 1), MAX_STRANDS);
      program.uniforms.uSpeed.value = values.speed;
      program.uniforms.uAmplitude.value = values.amplitude;
      program.uniforms.uWaviness.value = values.waviness;
      program.uniforms.uThickness.value = values.thickness;
      program.uniforms.uGlow.value = values.glow;
      program.uniforms.uTaper.value = values.taper;
      program.uniforms.uSpread.value = values.spread;
      program.uniforms.uHueShift.value = values.hueShift;
      program.uniforms.uIntensity.value = values.intensity;
      program.uniforms.uOpacity.value = values.opacity;
      program.uniforms.uScale.value = values.scale;
      program.uniforms.uSaturation.value = values.saturation;
      if (values.glass) {
        renderer.render({ scene: mesh, target: renderTarget });
        glassProgram.uniforms.uScene.value = renderTarget.texture;
        glassProgram.uniforms.uRefraction.value = values.refraction;
        glassProgram.uniforms.uDispersion.value = values.dispersion;
        glassProgram.uniforms.uRadius.value = 0.46 * values.glassSize;
        renderer.render({ scene: glassMesh });
      } else renderer.render({ scene: mesh });
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !animationFrame) animationFrame = requestAnimationFrame(update);
      else if (!visible && animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = 0; }
    });
    visibilityObserver.observe(container);
    animationFrame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={`strands-container ${className}`.trim()} style={style} />;
}
