"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("gap");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);
  return items;
}

const pageButton =
  "inline-flex size-8 items-center justify-center rounded-md border bg-background text-sm font-medium tabular-nums outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-40";

function PageLink({
  href,
  disabled,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={props["aria-label"]} className={cn(pageButton, className)}>
        {props.children}
      </span>
    );
  }
  return <Link href={href} scroll={false} prefetch={false} className={cn(pageButton, className)} {...props} />;
}

/**
 * URL-based pagination: every page is a link that sets `?page=`, and the
 * rows-per-page select sets `?pageSize=`. Read the current values with `usePageParams`.
 */
export function Pagination({
  page,
  pageSize,
  total,
  noun,
  pageSizes = [10, 25, 50],
  pageParam = "page",
  pageSizeParam = "pageSize",
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Plural label for the rows, e.g. "events". Omit to hide the "Showing x–y of z" summary. */
  noun?: string;
  /** Pass an empty array to hide the rows-per-page select. */
  pageSizes?: number[];
  pageParam?: string;
  pageSizeParam?: string;
  className?: string;
}) {
  const { hrefWith, setParams } = useQueryParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const hrefFor = (p: number) => hrefWith({ [pageParam]: p === 1 ? undefined : p });

  const showPageSize = pageSizes.length > 0;
  if (!showPageSize && !noun && totalPages <= 1) return null;

  const sizeOptions = pageSizes.includes(pageSize) ? pageSizes : [...pageSizes, pageSize].sort((a, b) => a - b);

  return (
    <div className={cn("flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between", className)}>
      {(showPageSize || noun) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
          {showPageSize && (
            <label className="flex items-center gap-2">
              <span className="font-medium text-foreground">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setParams({ [pageSizeParam]: e.target.value, [pageParam]: undefined })}
                className="h-8 rounded-md border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {sizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          {showPageSize && noun && <span className="hidden h-4 w-px bg-border sm:block" />}
          {noun && (
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {from}–{to}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span> {noun}
            </span>
          )}
        </div>
      )}

      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <PageLink href={hrefFor(current - 1)} disabled={current <= 1} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </PageLink>
        {pageItems(current, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <PageLink
              key={p}
              href={hrefFor(p)}
              aria-current={p === current ? "page" : undefined}
              className={cn(p === current && "border-primary bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              {p}
            </PageLink>
          )
        )}
        <PageLink href={hrefFor(current + 1)} disabled={current >= totalPages} aria-label="Next page">
          <ChevronRight className="size-4" />
        </PageLink>
      </nav>
    </div>
  );
}
