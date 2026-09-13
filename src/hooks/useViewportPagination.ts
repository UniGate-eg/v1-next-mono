"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function nextVisibleCount(current: number, pageSize: number, total: number): number {
  return Math.min(current + pageSize, total);
}

export interface UseViewportPaginationResult<T> {
  visibleItems: T[];
  hasMore: boolean;
  isLoadingMore: boolean;
  /** How many of `visibleItems` (counting from the end) were just revealed, for entrance animations. */
  newlyRevealedCount: number;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

const LOAD_MORE_DELAY_MS = 300;

/**
 * Reusable viewport-based pagination for any array of items.
 * Reveals `pageSize` more items whenever a sentinel element scrolls into view,
 * and resets back to the first page whenever the `items` reference changes
 * (e.g. a new filter/search/sort result set).
 */
export function useViewportPagination<T>(items: T[], pageSize = 24): UseViewportPaginationResult<T> {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(pageSize, items.length));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevVisibleCountRef = useRef(0);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsLoadingMore(false);
    prevVisibleCountRef.current = 0;
    setVisibleCount(Math.min(pageSize, items.length));
  }, [items, pageSize]);

  useEffect(() => {
    prevVisibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsLoadingMore((alreadyLoading) => {
            if (alreadyLoading) return alreadyLoading;
            loadTimeoutRef.current = setTimeout(() => {
              setVisibleCount((current) => nextVisibleCount(current, pageSize, items.length));
              setIsLoadingMore(false);
            }, LOAD_MORE_DELAY_MS);
            return true;
          });
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [items, pageSize]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return {
    visibleItems,
    hasMore: visibleCount < items.length,
    isLoadingMore,
    newlyRevealedCount: Math.max(0, visibleCount - prevVisibleCountRef.current),
    sentinelRef,
  };
}
