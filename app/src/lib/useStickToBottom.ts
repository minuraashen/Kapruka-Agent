import { useCallback, useEffect, useRef } from "react";

/**
 * Keeps a scroll container pinned to the bottom as its content grows — the way a
 * chat transcript should behave — but only while the user is already at the
 * bottom. If they scroll up to read history, auto-pinning pauses until they come
 * back down.
 *
 * The pin is an *instant* scroll driven by a ResizeObserver on the content
 * wrapper, so streaming text, cards mounting, and images loading never kick off
 * a smooth-scroll animation that fights the next size change. That competing-
 * animation loop was the old "vibrating" chat: one growth → one instant pin →
 * settled, with no animation left running to be interrupted.
 *
 * Wire it up as:
 *   const { scrollRef, contentRef, handleScroll } = useStickToBottom();
 *   <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto">
 *     <div ref={contentRef}>{messages}</div>
 *   </div>
 */
export function useStickToBottom() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const observerRef = useRef<ResizeObserver | null>(null);

  const pin = useCallback(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, []);

  // Re-evaluate whether we should keep sticking whenever the user scrolls. A
  // small threshold absorbs sub-pixel rounding so we don't unstick by accident.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  // Callback ref so the observer attaches the moment the content node mounts —
  // this matters because the chat view appears after the splash screen, well
  // after the parent component first renders.
  const contentRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;
      const observer = new ResizeObserver(pin);
      observer.observe(node);
      observerRef.current = observer;
      // Defer the first pin so the parent scroll container's ref is attached
      // (React commits child refs before parents).
      requestAnimationFrame(pin);
    },
    [pin]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { scrollRef, contentRef, handleScroll };
}
