/** The on-screen image in `container` most in view — for a swipeable gallery, the photo showing. */
const visibleImage = (container: Element) => {
  const box = container.getBoundingClientRect();
  let best: HTMLImageElement | null = null;
  let bestWidth = 0;
  container.querySelectorAll("img").forEach((img) => {
    const r = img.getBoundingClientRect();
    const width = Math.min(r.right, box.right) - Math.max(r.left, box.left);
    if (width > bestWidth) {
      best = img;
      bestWidth = width;
    }
  });
  return best as HTMLImageElement | null;
};

/** The cart icon the shopper can see right now: the floating cart, or the phone tab bar's. */
const visibleCartTarget = () =>
  [...document.querySelectorAll("[data-cart-target]")].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });

/**
 * A copy of the product photo arcs into the cart icon, so adding to the cart is seen
 * rather than read in a toast. Purely decorative: skipped with reduced motion, without
 * a visible photo or cart icon, or where the Web Animations API is missing.
 */
export const flyToCart = (container: Element | null) => {
  if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const img = visibleImage(container);
  const target = visibleCartTarget();
  if (!img || !target || typeof img.animate !== "function") return;

  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 220);
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const dx = to.left + to.width / 2 - (startX + size / 2);
  const dy = to.top + to.height / 2 - (startY + size / 2);
  const endScale = 24 / size;

  const ghost = document.createElement("img");
  ghost.src = img.currentSrc || img.src;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "contain",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 12px 30px -8px rgba(19, 62, 43, 0.35)",
    pointerEvents: "none",
    zIndex: "60",
  });
  document.body.append(ghost);

  // Up and over, then down into the icon: the arc reads as "into the bag", not a slide
  ghost
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(0.55)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(${endScale})`, opacity: 0.35 },
      ],
      { duration: 720, easing: "cubic-bezier(0.55, 0, 0.35, 1)" },
    )
    .finished.catch(() => undefined)
    .finally(() => ghost.remove());
};
