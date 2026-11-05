import { useEffect, useRef, useState } from "react";

const THRESHOLD = 64; // px of visual pull needed to trigger
const MAX_PULL = 120; // visual pull never exceeds this
const DEAD_ZONE = 8; // finger travel before we take over from native scroll
const RESISTANCE = 130; // higher = lighter pull
const MIN_SPIN_MS = 500; // keep the spinner up at least this long
const EASE = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease";

// Rubber band: ~0.9x finger speed at first, flattening toward MAX_PULL
const dampen = (dy) => MAX_PULL * (1 - Math.exp(-dy / RESISTANCE));

export function PullToRefresh({ onRefresh, children }) {
  const scrollRef = useRef(null);
  const indicatorRef = useRef(null);
  const ringRef = useRef(null);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  // "pull" | "ready" | "refreshing" — only changes at a few moments,
  // so it's safe to be state. The pull distance itself is NOT state.
  const [status, setStatus] = useState("pull");

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const indicator = indicatorRef.current;
    const ring = ringRef.current;
    if (!scroller || !indicator || !ring) return;

    let startY = 0;
    let armed = false; // gesture began at scrollTop 0
    let dragging = false; // we've taken over from native scroll
    let pull = 0;
    let dead = false;

    // Direct DOM writes: transform/opacity only, no React render, no layout
    const apply = (y, animate) => {
      const transition = animate ? EASE : "none";
      scroller.style.transition = transition;
      scroller.style.transform = y ? `translate3d(0, ${y}px, 0)` : ""; // "" at rest so fixed-position children aren't affected

      indicator.style.transition = transition;
      indicator.style.transform = `translate3d(0, ${y - THRESHOLD}px, 0)`;
      indicator.style.opacity = refreshingRef.current
        ? 1
        : Math.min(1, y / (THRESHOLD * 0.6));

      if (!refreshingRef.current) ring.style.transform = `rotate(${y * 4}deg)`;
    };

    const startRefresh = () => {
      refreshingRef.current = true;
      setStatus("refreshing");
      apply(THRESHOLD, true); // hold here while loading

      const t0 = performance.now();
      Promise.resolve()
        .then(() => onRefreshRef.current?.())
        .catch(() => {})
        .then(
          () =>
            new Promise((r) =>
              setTimeout(
                r,
                Math.max(0, MIN_SPIN_MS - (performance.now() - t0)),
              ),
            ),
        )
        .then(() => {
          if (dead) return;
          pull = 0;
          apply(0, true);
          // let the slide-out finish before resetting state
          setTimeout(() => {
            if (dead) return;
            refreshingRef.current = false;
            setStatus("pull");
          }, 300);
        });
    };

    const onTouchStart = (e) => {
      if (refreshingRef.current || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      armed = scroller.scrollTop <= 0;
      dragging = false;
    };

    const onTouchMove = (e) => {
      if (!armed) return;
      const dy = e.touches[0].clientY - startY;

      if (dy < 0) {
        // Finger moved up: user is scrolling content, hand over to native scroll
        if (dragging) {
          pull = 0;
          apply(0, false);
          setStatus("pull");
        }
        armed = dragging = false;
        return;
      }

      const d = dy - DEAD_ZONE;
      if (d <= 0) {
        if (dragging) {
          dragging = false;
          pull = 0;
          apply(0, false);
          setStatus("pull");
        }
        return;
      }

      dragging = true;
      if (e.cancelable) e.preventDefault(); // block native bounce/refresh
      pull = dampen(d);
      apply(pull, false);
      setStatus(pull >= THRESHOLD ? "ready" : "pull"); // no re-render unless it changes
    };

    const onTouchEnd = () => {
      const shouldRefresh = dragging && pull >= THRESHOLD;
      armed = dragging = false;

      if (shouldRefresh) {
        startRefresh();
      } else {
        pull = 0;
        apply(0, true);
        setStatus("pull");
      }
    };

    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: false });
    scroller.addEventListener("touchend", onTouchEnd, { passive: true });
    scroller.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      dead = true;
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []); // runs once: handlers read refs, not state

  const active = status === "ready" || status === "refreshing";

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      {/* Sits behind the scroller; slides in as the scroller is pulled down */}
      <div
        ref={indicatorRef}
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-2"
        style={{
          height: THRESHOLD,
          opacity: 0,
          transform: `translate3d(0, ${-THRESHOLD}px, 0)`,
        }}
      >
        <div
          ref={ringRef}
          className={`w-9 h-9 rounded-full border-2 border-(--line) border-t-(--brand) ${
            status === "refreshing" ? "animate-spin" : ""
          }`}
        />
        <span
          className={`text-[11px] font-semibold ${
            active ? "text-(--brand)" : "text-(--muted)"
          }`}
        >
          {status === "refreshing"
            ? "Refreshing…"
            : status === "ready"
              ? "Release to refresh"
              : "Pull to refresh"}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto overflow-x-hidden bg-(--app) px-4.5 pb-5
                   overscroll-y-contain scrollbar-none [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </div>
    </div>
  );
}
