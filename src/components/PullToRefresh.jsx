// PullToRefresh — custom pull-to-refresh wrapper.
// Listens to touch events on the scroll container, only triggers when
// scrollTop === 0, and renders a spinner that scales with drag distance.
// Prevents the native browser bounce/refresh via e.preventDefault() and
// overscroll-behavior-y: contain on the scroll element.

import { useEffect, useRef, useState } from "react";

const THRESHOLD = 64; // px — distance before "release to refresh" state
const MAX_PULL = 110; // px — visual cap for the spinner scale

function Spinner({ progress, releasing }) {
  const scale = Math.min(1, progress / THRESHOLD);
  const rotation = progress * 3; // spin faster the further you pull

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 overflow-hidden transition-[height] duration-150"
      style={{
        height: `${progress}px`,
        opacity: Math.min(1, progress / 24),
      }}
    >
      <div
        className="w-9 h-9 rounded-full border-2 border-(--line) border-t-(--brand)"
        style={{
          transform: `rotate(${rotation}deg) scale(${releasing ? 1 : scale})`,
          transition: releasing ? "transform 0.15s ease" : "transform 0.05s linear",
        }}
      />
      <span
        className={`text-[11px] font-semibold ${
          releasing ? "text-(--brand)" : "text-(--muted)"
        }`}
      >
        {releasing ? "Release to refresh" : "Pull to refresh"}
      </span>
    </div>
  );
}

export function PullToRefresh({ onRefresh, children }) {
  const scrollRef = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Track whether we're inside a touch sequence so we can ignore
  // synthetic events that fire after touchend.
  const touchStartY = useRef(0);
  const startedAtTop = useRef(false);

  // Derived state — no effect needed
  const releasing = !refreshing && pull >= THRESHOLD;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      // Only one finger
      if (e.touches.length !== 1) return;
      touchStartY.current = e.touches[0].clientY;
      startedAtTop.current = el.scrollTop === 0;
    };

    const onTouchMove = (e) => {
      if (!startedAtTop.current) return;
      const y = e.touches[0].clientY;
      const dy = y - touchStartY.current;
      if (dy <= 0) {
        // Scrolling up — reset and let normal scroll happen
        setPull(0);
        return;
      }
      // Prevent the native bounce/refresh
      e.preventDefault();
      setPull(Math.min(dy, MAX_PULL));
    };

    const onTouchEnd = () => {
      startedAtTop.current = false;
      const finalPull = pull;
      setPull(0);

      if (finalPull >= THRESHOLD) {
        setRefreshing(true);
        Promise.resolve(onRefresh())
          .catch(() => {})
          .finally(() => {
            setRefreshing(false);
          });
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pull]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4.5 pb-5
                 overscroll-y-contain scrollbar-none [&::-webkit-scrollbar]:hidden"
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="sticky top-0 z-10 bg-(--app)"
        style={{ marginTop: refreshing ? 0 : `-${pull}px` }}
      >
        <div className="pt-1.5">
          {refreshing || pull > 0 ? (
            <Spinner progress={pull} releasing={releasing} />
          ) : null}
        </div>
      </div>
      <div
        style={{
          transform: refreshing ? "none" : `translateY(${pull}px)`,
          transition: releasing || refreshing ? "transform 0.25s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}