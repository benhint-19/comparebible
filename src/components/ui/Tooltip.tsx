"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // If there's not enough space above, show below
    setAbove(rect.top > 120);
  }, []);

  useEffect(() => {
    if (visible) reposition();
  }, [visible, reposition]);

  // Close on outside click (mobile-friendly)
  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent | TouchEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [visible]);

  return (
    <span className="relative inline-flex items-center" ref={triggerRef}>
      {children}
      <button
        type="button"
        aria-label="More info"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setVisible((v) => !v);
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full
          border border-[var(--color-border)] text-[10px] leading-none font-semibold
          text-[var(--color-muted-foreground,#888)] hover:text-[var(--color-foreground)]
          hover:border-[var(--color-accent)] transition-colors cursor-help flex-shrink-0"
      >
        ?
      </button>
      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-64 px-3 py-2
            rounded-lg shadow-lg text-xs leading-relaxed
            bg-[var(--color-foreground)] text-[var(--color-background)]
            pointer-events-auto
            ${above ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {text}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0
              border-x-[6px] border-x-transparent
              ${
                above
                  ? "top-full border-t-[6px] border-t-[var(--color-foreground)]"
                  : "bottom-full border-b-[6px] border-b-[var(--color-foreground)]"
              }`}
          />
        </div>
      )}
    </span>
  );
}
