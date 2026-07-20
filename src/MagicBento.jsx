import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import BorderGlow from "./BorderGlow";
import "./MagicBento.css";

const MOBILE_BREAKPOINT = 768;

function createParticle(x, y, color) {
  const particle = document.createElement("span");
  particle.className = "magic-bento-particle";
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.setProperty("--particle-color", color);
  return particle;
}

function MagicBentoCard({
  card,
  index,
  disableAnimations,
  enableStars,
  enableTilt,
  enableMagnetism,
  clickEffect,
  particleCount,
  glowColor,
  textAutoHide,
  enableBorderGlow,
  cardLabel,
}) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timersRef = useRef([]);

  const clearParticles = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  useEffect(() => {
    const element = cardRef.current;
    if (!element || disableAnimations) return undefined;

    if (!enableTilt && !enableMagnetism) {
      gsap.set(element, { clearProps: "transform" });
    }

    const showParticles = () => {
      if (!enableStars) return;
      const { width, height } = element.getBoundingClientRect();
      Array.from({ length: particleCount }).forEach((_, particleIndex) => {
        const timer = window.setTimeout(() => {
          if (!element.matches(":hover")) return;
          const particle = createParticle(Math.random() * width, Math.random() * height, glowColor);
          element.appendChild(particle);
          particlesRef.current.push(particle);
          gsap.fromTo(
            particle,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 0.9, duration: 0.3, ease: "back.out(1.8)" },
          );
          gsap.to(particle, {
            x: (Math.random() - 0.5) * 84,
            y: (Math.random() - 0.5) * 84,
            rotation: Math.random() * 240,
            opacity: 0.24,
            duration: 1.8 + Math.random() * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }, particleIndex * 65);
        timersRef.current.push(timer);
      });
    };

    const resetCard = () => {
      clearParticles();
      gsap.to(element, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.42,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const moveCard = (event) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = element.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(element, {
        x: enableMagnetism ? normalizedX * 10 : 0,
        y: enableMagnetism ? normalizedY * 10 : 0,
        rotateX: enableTilt ? normalizedY * -5 : 0,
        rotateY: enableTilt ? normalizedX * 5 : 0,
        transformPerspective: 1100,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const addRipple = (event) => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement("span");
      ripple.className = "magic-bento-ripple";
      ripple.style.cssText = `left:${x - radius}px;top:${y - radius}px;width:${radius * 2}px;height:${radius * 2}px;--ripple-color:${glowColor};`;
      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 0.72 },
        { scale: 1, opacity: 0, duration: 0.78, ease: "power2.out", onComplete: () => ripple.remove() },
      );
    };

    element.addEventListener("mouseenter", showParticles);
    element.addEventListener("mousemove", moveCard);
    element.addEventListener("mouseleave", resetCard);
    element.addEventListener("click", addRipple);

    return () => {
      element.removeEventListener("mouseenter", showParticles);
      element.removeEventListener("mousemove", moveCard);
      element.removeEventListener("mouseleave", resetCard);
      element.removeEventListener("click", addRipple);
      gsap.killTweensOf(element);
      clearParticles();
    };
  }, [clickEffect, clearParticles, disableAnimations, enableMagnetism, enableStars, enableTilt, glowColor, particleCount]);

  const classes = [
    "magic-bento-card",
    textAutoHide ? "magic-bento-card--text-autohide" : "",
    enableBorderGlow ? "magic-bento-card--border-glow" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className="magic-bento-card__header">
        <span className="magic-bento-card__label">{cardLabel}</span>
        <span className="magic-bento-card__index">{card.index}</span>
      </div>
      <div className="magic-bento-card__content">
        <h3 className="magic-bento-card__title">{card.title}</h3>
        <p className="magic-bento-card__description">{card.description}</p>
      </div>
    </>
  );

  const cardStyle = { "--glow-color": glowColor, backgroundColor: card.color ?? "#090a0d" };
  if (enableBorderGlow) {
    return (
      <BorderGlow
        ref={cardRef}
        className={classes}
        edgeSensitivity={34}
        glowColor="221 100 66"
        backgroundColor={card.color ?? "#090a0d"}
        glowRadius={30}
        glowIntensity={0.62}
        coneSpread={19}
        colors={["#2866ff", "#7b9cff", "#e6ecff"]}
        fillOpacity={0}
        style={cardStyle}
      >
        {content}
      </BorderGlow>
    );
  }

  return <article ref={cardRef} className={classes} style={cardStyle}>{content}</article>;
}

export default function MagicBento({
  cards = [],
  textAutoHide = false,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 320,
  particleCount = 10,
  enableTilt = true,
  glowColor = "40, 102, 255",
  clickEffect = true,
  enableMagnetism = true,
  cardLabel = "CAPABILITY",
}) {
  const gridRef = useRef(null);
  const entrancePlayedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const shouldDisableAnimations = disableAnimations || isMobile;

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || shouldDisableAnimations || !enableSpotlight) return undefined;
    const spotlight = document.createElement("div");
    spotlight.className = "magic-bento-spotlight";
    spotlight.style.setProperty("--spotlight-color", glowColor);
    document.body.appendChild(spotlight);

    const handlePointerMove = (event) => {
      const gridRect = grid.getBoundingClientRect();
      const inside =
        event.clientX >= gridRect.left &&
        event.clientX <= gridRect.right &&
        event.clientY >= gridRect.top &&
        event.clientY <= gridRect.bottom;
      const cardsInGrid = grid.querySelectorAll(".magic-bento-card");

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.35, ease: "power2.out" });
        cardsInGrid.forEach((card) => card.style.setProperty("--glow-intensity", "0"));
        return;
      }

      let closestDistance = Number.POSITIVE_INFINITY;
      cardsInGrid.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.max(0, Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(rect.width, rect.height) / 2);
        closestDistance = Math.min(closestDistance, distance);
        const intensity = Math.max(0, Math.min(1, 1 - distance / (spotlightRadius * 0.78)));
        card.style.setProperty("--glow-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty("--glow-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
        card.style.setProperty("--glow-intensity", intensity.toFixed(3));
        card.style.setProperty("--glow-radius", `${spotlightRadius}px`);
      });

      gsap.to(spotlight, {
        left: event.clientX,
        top: event.clientY,
        opacity: Math.max(0.18, 0.72 - closestDistance / spotlightRadius),
        duration: 0.16,
        ease: "power2.out",
        overwrite: true,
      });
    };

    let rafId;
    const throttledMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        handlePointerMove(e);
      });
    };
    document.addEventListener("pointermove", throttledMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", throttledMove);
      if (rafId) cancelAnimationFrame(rafId);
      gsap.killTweensOf(spotlight);
      spotlight.remove();
      const cards = gridRef.current?.querySelectorAll('.magic-bento-card');
      if (cards) {
        cards.forEach(c => {
          c.style.removeProperty('--glow-intensity');
          c.style.removeProperty('--glow-x');
          c.style.removeProperty('--glow-y');
        });
      }
    };
  }, [enableSpotlight, glowColor, shouldDisableAnimations, spotlightRadius]);

  // Use the site-wide data-reveal pattern for entrance animation
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll(".magic-bento-card");
    
    // Add data-reveal + stagger delay to each card
    cards.forEach((card, i) => {
      card.setAttribute("data-reveal", "bento");
      card.style.setProperty("--reveal-delay", i * 80 + "ms");
    });

    // Create observer matching the global reveal (threshold 0.08, -12% rootMargin)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [cards]);

  return (
    <div className="magic-bento-grid bento-section" ref={gridRef}>
      {cards.map(([index, title, description], cardIndex) => (
        <MagicBentoCard
          key={index}
          card={{ index, title, description }}
          index={cardIndex}
          disableAnimations={shouldDisableAnimations}
          enableStars={enableStars}
          enableTilt={enableTilt}
          enableMagnetism={enableMagnetism}
          clickEffect={clickEffect}
          particleCount={particleCount}
          glowColor={glowColor}
          textAutoHide={textAutoHide}
          enableBorderGlow={enableBorderGlow}
          cardLabel={cardLabel}
        />
      ))}
    </div>
  );
}
