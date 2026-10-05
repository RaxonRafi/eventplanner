"use client";

import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, Search, type LucideIcon } from "lucide-react";

/** Card shell shared by every dashboard table: toolbar, bordered table, pagination footer. */
export function TableCard({
  toolbar,
  footer,
  fetching,
  children,
}: {
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  fetching?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-4 p-4 md:p-5">
      {toolbar}
      <div className={cn("overflow-hidden rounded-xl border transition-opacity", fetching && "opacity-60")}>
        {children}
      </div>
      {footer}
    </Card>
  );
}

/** Search on its own row, filters wrapping underneath. */
export function TableToolbar({ search, children }: { search?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {search}
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function TableSearch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="rounded-full pl-10" {...props} />
    </div>
  );
}

export type FilterOption<T extends string> = { label: string; value?: T; count?: number };

const ALL = "__all__";

/** Pill-shaped dropdown filter. The option without a value is the "all" choice. */
export function FilterPill<T extends string>({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon?: LucideIcon;
  options: FilterOption<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}) {
  const selected = options.find((o) => o.value === value) ?? options[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border bg-background px-3.5 text-sm font-medium shadow-xs outline-none transition-colors hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
            value != null && "border-primary/40 bg-primary/5 hover:bg-primary/10"
          )}
        >
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {selected.label}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuRadioGroup
          value={value ?? ALL}
          onValueChange={(v) => onChange(v === ALL ? undefined : (v as T))}
        >
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.label} value={o.value ?? ALL}>
              {o.label}
              {o.count != null && (
                <span className="ml-auto pl-4 text-xs tabular-nums text-muted-foreground">{o.count}</span>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SKELETON_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-1/3"];

export function TableSkeletonRows({ rows = 5, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}>
              <Skeleton className={cn("h-4", SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length])} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/** Full-width row for empty and error states. */
export function TableMessage({
  colSpan,
  error,
  children,
}: {
  colSpan: number;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className={cn("py-14 text-center", error ? "text-destructive" : "text-muted-foreground")}>
        {children}
      </TableCell>
    </TableRow>
  );
}

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
  "inline-flex size-8 items-center justify-center rounded-md border bg-background text-sm font-medium tabular-nums outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40";

export function TablePagination({
  page,
  pageSize,
  total,
  noun,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Plural label for the rows, e.g. "events". */
  noun: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizes?: number[];
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
        <label className="flex items-center gap-2">
          <span className="font-medium text-foreground">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <span>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {from}–{to}
          </span>{" "}
          of <span className="font-semibold text-foreground">{total}</span> {noun}
        </span>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <button
          type="button"
          className={pageButton}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageItems(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                pageButton,
                p === page && "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className={pageButton}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
