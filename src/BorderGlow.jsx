import { forwardRef, useCallback, useEffect, useRef } from "react";
import "./BorderGlow.css";

function parseHsl(value) {
  const match = String(value).match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 221, s: 100, l: 66 };
  return { h: Number.parseFloat(match[1]), s: Number.parseFloat(match[2]), l: Number.parseFloat(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHsl(glowColor);
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const suffixes = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  return opacities.reduce((vars, opacity, index) => {
    vars[`--border-glow-color${suffixes[index]}`] = `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * intensity, 100)}%)`;
    return vars;
  }, {});
}

const gradientPositions = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const gradientKeys = ["--border-gradient-one", "--border-gradient-two", "--border-gradient-three", "--border-gradient-four", "--border-gradient-five", "--border-gradient-six", "--border-gradient-seven"];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors) {
  const palette = colors.length ? colors : ["#2866ff"];
  const vars = {};
  gradientKeys.forEach((key, index) => {
    const color = palette[Math.min(colorMap[index], palette.length - 1)];
    vars[key] = `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`;
  });
  vars["--border-gradient-base"] = `linear-gradient(${palette[0]} 0 100%)`;
  return vars;
}

const BorderGlow = forwardRef(function BorderGlow(
  {
    children,
    className = "",
    edgeSensitivity = 30,
    glowColor = "221 100 66",
    backgroundColor = "#050506",
    borderRadius = 28,
    glowRadius = 34,
    glowIntensity = 0.7,
    coneSpread = 22,
    animated = false,
    colors = ["#2866ff", "#7b9cff", "#e6ecff"],
    fillOpacity = 0,
    style,
    ...rest
  },
  forwardedRef,
) {
  const cardRef = useRef(null);
  const animationFrames = useRef([]);
  const timers = useRef([]);

  const setRefs = useCallback(
    (node) => {
      cardRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const kx = dx === 0 ? Number.POSITIVE_INFINITY : centerX / Math.abs(dx);
    const ky = dy === 0 ? Number.POSITIVE_INFINITY : centerY / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
    card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    cardRef.current?.style.setProperty("--edge-proximity", "0");
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card) return undefined;
    card.classList.add("sweep-active");
    const start = performance.now();
    const duration = 2600;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const proximity = Math.sin(progress * Math.PI) * 100;
      const angle = 110 + progress * 355;
      card.style.setProperty("--edge-proximity", proximity.toFixed(2));
      card.style.setProperty("--cursor-angle", `${angle.toFixed(2)}deg`);
      if (progress < 1) animationFrames.current.push(requestAnimationFrame(tick));
      else card.classList.remove("sweep-active");
    };
    const timer = window.setTimeout(() => animationFrames.current.push(requestAnimationFrame(tick)), 120);
    timers.current.push(timer);
    return () => {
      timers.current.forEach(window.clearTimeout);
      animationFrames.current.forEach(cancelAnimationFrame);
      card.classList.remove("sweep-active");
    };
  }, [animated]);

  const radiusValue = typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

  return (
    <div
      {...rest}
      ref={setRefs}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`border-glow-card ${className}`.trim()}
      style={{
        "--border-card-bg": backgroundColor,
        "--edge-sensitivity": edgeSensitivity,
        "--border-radius": radiusValue,
        "--glow-padding": `${glowRadius}px`,
        "--cone-spread": coneSpread,
        "--fill-opacity": fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
        ...style,
      }}
    >
      <span className="border-edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
});

export default BorderGlow;
