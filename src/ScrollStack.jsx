import { useCallback, useLayoutEffect, useRef } from "react";
import "./ScrollStack.css";
import BorderGlow from "./BorderGlow";

export function ScrollStackItem({ children, itemClassName = "", borderGlow }) {
  const className = `scroll-stack-card ${itemClassName}`.trim();
  if (borderGlow) {
    return (
      <BorderGlow className={className} {...borderGlow}>
        {children}
      </BorderGlow>
    );
  }
  return <article className={className}>{children}</article>;
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 120,
  itemScale = 0.025,
  itemStackDistance = 22,
  stackPosition = "13%",
  scaleEndPosition = "5%",
  baseScale = 0.94,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete,
}) {
  const scrollerRef = useRef(null);
  const frameRef = useRef(0);
  const completedRef = useRef(false);

  const parsePosition = useCallback((value, viewportHeight) => {
    if (typeof value === "string" && value.includes("%")) {
      return (Number.parseFloat(value) / 100) * viewportHeight;
    }
    return Number.parseFloat(value) || 0;
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const cards = Array.from(scroller.querySelectorAll(".scroll-stack-card"));
    const endMarker = scroller.querySelector(".scroll-stack-end");
    const scrollTarget = useWindowScroll ? window : scroller;

    cards.forEach((card, index) => {
      card.style.marginBottom = index < cards.length - 1 ? `${itemDistance}px` : "0px";
      card.style.transformOrigin = "top center";
    });

    const update = () => {
      frameRef.current = 0;
      const viewportHeight = useWindowScroll ? window.innerHeight : scroller.clientHeight;
      const stackingDisabled = window.matchMedia("(max-width: 900px)").matches;
      const scrollTop = useWindowScroll ? window.scrollY : scroller.scrollTop;
      const scrollerTop = useWindowScroll
        ? scroller.getBoundingClientRect().top + window.scrollY
        : 0;
      const stackPositionPx = parsePosition(stackPosition, viewportHeight);
      const scaleEndPx = parsePosition(scaleEndPosition, viewportHeight);
      const endTop = scrollerTop + (endMarker?.offsetTop ?? scroller.scrollHeight);
      const pinEnd = Math.max(0, endTop - viewportHeight * 0.58);

      if (stackingDisabled) {
        cards.forEach((card) => {
          card.style.transform = "none";
          card.style.filter = "none";
        });

        // Use IntersectionObserver to add is-stack-active only when a card approaches the viewport
        if (!scroller._mobileObserver) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("is-stack-active");
                  observer.unobserve(entry.target);
                }
              });
            },
            { rootMargin: "0px 0px 120px 0px", threshold: 0 }
          );
          cards.forEach((card) => observer.observe(card));
          scroller._mobileObserver = observer;
        }

        // Also check immediately: cards already in or near viewport get is-stack-active right away
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          if (rect.top < window.innerHeight + 120) {
            card.classList.add("is-stack-active");
          }
        });
        return;
      }

      let topCardIndex = 0;
      cards.forEach((card, index) => {
        const cardTop = scrollerTop + card.offsetTop;
        const pinStart = cardTop - stackPositionPx - itemStackDistance * index;
        if (scrollTop >= pinStart) topCardIndex = index;
      });

      cards.forEach((card, index) => {
        const cardTop = scrollerTop + card.offsetTop;
        const pinStart = cardTop - stackPositionPx - itemStackDistance * index;
        const scaleEnd = Math.max(pinStart + 1, cardTop - scaleEndPx);
        const scaleProgress = Math.max(0, Math.min(1, (scrollTop - pinStart) / (scaleEnd - pinStart)));
        const targetScale = Math.min(1, baseScale + index * itemScale);
        const scale = 1 - scaleProgress * (1 - targetScale);
        const rotation = index * rotationAmount * scaleProgress;
        const blur = index < topCardIndex ? (topCardIndex - index) * blurAmount : 0;

        let translateY = 0;
        if (scrollTop >= pinStart && scrollTop <= pinEnd) {
          translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * index;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * index;
        }

        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(2)}deg)`;
        card.style.filter = blur > 0 ? `blur(${blur.toFixed(2)}px)` : "none";
        card.style.setProperty("--stack-depth", String(Math.max(0, topCardIndex - index)));
        card.classList.toggle(
          "is-stack-active",
          index === topCardIndex && scrollTop >= pinStart - viewportHeight * 0.12,
        );
      });

      const lastCard = cards.at(-1);
      if (lastCard) {
        const lastStart = scrollerTop + lastCard.offsetTop - stackPositionPx - itemStackDistance * (cards.length - 1);
        const completed = scrollTop >= lastStart && scrollTop <= pinEnd;
        if (completed !== completedRef.current) {
          completedRef.current = completed;
          if (completed) onStackComplete?.();
        }
      }
    };

    const schedule = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(update);
    };

    scrollTarget.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      scrollTarget.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cards.forEach((card) => card.classList.remove("is-stack-active"));
      if (scroller._mobileObserver) {
        scroller._mobileObserver.disconnect();
        delete scroller._mobileObserver;
      }
    };
  }, [baseScale, blurAmount, itemDistance, itemScale, itemStackDistance, onStackComplete, parsePosition, rotationAmount, scaleEndPosition, stackPosition, useWindowScroll]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
}
