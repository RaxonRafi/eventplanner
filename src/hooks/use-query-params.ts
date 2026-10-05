"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type ParamUpdates = Record<string, string | number | null | undefined>;

const toInt = (value: string | null, fallback: number) => {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Returns `value` if it is one of `allowed`, so a hand-edited URL can't produce an invalid filter. */
export function oneOf<T extends string>(value: string | null, allowed: readonly (T | undefined)[]): T | undefined {
  return value != null && allowed.includes(value as T) ? (value as T) : undefined;
}

/** Read and write the URL query string. Empty values are removed from the URL. */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefWith = useCallback(
    (updates: ParamUpdates) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") params.delete(key);
        else params.set(key, String(value));
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  /** Changing any filter goes back to the first page unless `page` is given explicitly. */
  const setParams = useCallback(
    (updates: ParamUpdates) => router.replace(hrefWith({ page: undefined, ...updates }), { scroll: false }),
    [router, hrefWith]
  );

  return { searchParams, hrefWith, setParams };
}

/** Current `?page=` and `?pageSize=` from the URL. */
export function usePageParams(defaultPageSize = 10) {
  const searchParams = useSearchParams();
  return {
    page: toInt(searchParams.get("page"), 1),
    pageSize: Math.min(100, toInt(searchParams.get("pageSize"), defaultPageSize)),
  };
}

/**
 * Search box state backed by the URL. `input` updates on every keystroke;
 * `q` is the URL value, written only once typing has paused for `delay` ms.
 */
export function useSearchParam(key = "q", delay = 400) {
  const { searchParams, setParams } = useQueryParams();
  const q = searchParams.get(key) ?? "";
  const [input, setInputState] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latestSetParams = useRef(setParams);

  useEffect(() => {
    latestSetParams.current = setParams;
  }, [setParams]);

  // Follow the URL (back/forward, cleared filters) unless the user is mid-typing
  useEffect(() => {
    if (!timer.current) setInputState(q);
  }, [q]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const setInput = useCallback(
    (value: string) => {
      setInputState(value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = undefined;
        latestSetParams.current({ [key]: value.trim() });
      }, delay);
    },
    [key, delay]
  );

  return { q, input, setInput };
}
