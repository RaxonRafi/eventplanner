"use client";
import { cn } from "@/lib/utils";

export const EvervaultCard = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/50 p-20",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-5xl font-bold text-white">{text || "hover"}</div>
      </div>
    </div>
  );
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
