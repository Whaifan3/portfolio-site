import { Children, cloneElement, createRef, forwardRef, isValidElement, useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import "./CardSwap.css";

export const Card = forwardRef(function Card({ customClass = "", className = "", ...rest }, ref) {
  return <div ref={ref} {...rest} className={`card-swap-card ${customClass} ${className}`.trim()} />;
});

function makeSlot(index, distanceX, distanceY, total) {
  return {
    x: index * distanceX,
    y: -index * distanceY,
    z: -index * distanceX * 1.5,
    zIndex: total - index,
  };
}

function placeNow(element, slot, skew) {
  if (!element) return;
  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });
}

export default function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) {
  const childArray = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => childArray.map(() => createRef()), [childArray.length]);
  const orderRef = useRef(Array.from({ length: childArray.length }, (_, index) => index));
  const timelineRef = useRef(null);
  const intervalRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    orderRef.current = Array.from({ length: refs.length }, (_, index) => index);
    refs.forEach((ref, index) => placeNow(ref.current, makeSlot(index, cardDistance, verticalDistance, refs.length), skewAmount));

    const config = easing === "elastic"
      ? { ease: "elastic.out(0.58,0.88)", drop: 1.65, move: 1.55, back: 1.7, overlap: 0.88, returnDelay: 0.06 }
      : { ease: "power2.inOut", drop: 0.75, move: 0.78, back: 0.82, overlap: 0.46, returnDelay: 0.18 };

    const swap = () => {
      if (orderRef.current.length < 2 || timelineRef.current?.isActive()) return;
      const [front, ...remaining] = orderRef.current;
      const frontElement = refs[front].current;
      if (!frontElement) return;
      const timeline = gsap.timeline();
      timelineRef.current = timeline;
      timeline.to(frontElement, { y: "+=520", opacity: 0.78, duration: config.drop, ease: config.ease });
      timeline.addLabel("promote", `-=${config.drop * config.overlap}`);
      remaining.forEach((cardIndex, slotIndex) => {
        const element = refs[cardIndex].current;
        const slot = makeSlot(slotIndex, cardDistance, verticalDistance, refs.length);
        timeline.set(element, { zIndex: slot.zIndex }, "promote");
        timeline.to(
          element,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.move, ease: config.ease },
          `promote+=${slotIndex * 0.12}`,
        );
      });
      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      timeline.addLabel("return", `promote+=${config.move * config.returnDelay}`);
      timeline.set(frontElement, { zIndex: backSlot.zIndex }, "return");
      timeline.to(
        frontElement,
        { x: backSlot.x, y: backSlot.y, z: backSlot.z, opacity: 1, duration: config.back, ease: config.ease },
        "return",
      );
      timeline.call(() => { orderRef.current = [...remaining, front]; });
    };

    intervalRef.current = window.setInterval(swap, delay);
    const container = containerRef.current;
    const pause = () => {
      timelineRef.current?.pause();
      window.clearInterval(intervalRef.current);
    };
    const resume = () => {
      timelineRef.current?.play();
      window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };
    if (pauseOnHover && container) {
      container.addEventListener("mouseenter", pause);
      container.addEventListener("mouseleave", resume);
    }

    return () => {
      window.clearInterval(intervalRef.current);
      timelineRef.current?.kill();
      refs.forEach((ref) => gsap.killTweensOf(ref.current));
      if (pauseOnHover && container) {
        container.removeEventListener("mouseenter", pause);
        container.removeEventListener("mouseleave", resume);
      }
    };
  }, [cardDistance, delay, easing, pauseOnHover, refs, skewAmount, verticalDistance]);

  const renderedCards = childArray.map((child, index) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: index,
          ref: refs[index],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (event) => {
            child.props.onClick?.(event);
            onCardClick?.(index);
          },
        })
      : child,
  );

  return (
    <div ref={containerRef} className="card-swap-container" style={{ width, height }}>
      {renderedCards}
    </div>
  );
}
