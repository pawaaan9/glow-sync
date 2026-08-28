"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "glowsync:sidebar-expanded";

/**
 * Shared dashboard-sidebar state: the desktop expanded/collapsed rail
 * (persisted to localStorage so it survives navigation and reloads) and
 * the transient mobile drawer. Used by both the platform-admin and
 * salon-owner shells so the two behave identically.
 */
export function useSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hydrate the persisted rail state on mount. This is the standard
  // read-from-localStorage-once pattern (one extra render, client-only) —
  // it can't run during render without risking an SSR/client mismatch.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydration from storage
      if (stored != null) setIsExpanded(stored === "1");
    } catch {
      // Private mode / storage disabled — fall back to the default.
    }
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore — the toggle still works for this session.
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return { isExpanded, isMobileOpen, toggleExpand, openMobile, closeMobile };
}
