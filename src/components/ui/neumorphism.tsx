import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const buttonVariants: Record<Variant, string> = {
  primary: "btn-neu-primary text-white",
  secondary: "btn-neu-secondary text-[#4e6785]",
  success:
    "text-[#d78484] border border-white/50 bg-[#e6e7ee] shadow-[4px_4px_8px_rgba(193,145,145,0.24),-4px_-4px_8px_rgba(255,255,255,0.58)]",
  danger:
    "text-[#b86a6a] border border-white/50 bg-[#e6e7ee] shadow-[4px_4px_8px_rgba(190,160,160,0.22),-4px_-4px_8px_rgba(255,255,255,0.58)]",
};

const buttonSizes: Record<Size, string> = {
  sm: "min-h-10 px-3 py-2 text-xs rounded-xl",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-2xl",
  lg: "min-h-12 px-6 py-3.5 text-sm rounded-2xl",
};

export function NeuCard({
  className,
  inset = false,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <div
      className={cn(
        inset ? "neu-inset" : "glass",
        "rounded-3xl border border-white/50 text-[#2c3d52]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NeuButton({
  className,
  variant = "secondary",
  size = "md",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold tracking-[-0.01em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function NeuInput({
  className,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div className="relative">
      {icon ? (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4e6785]/55">
          {icon}
        </div>
      ) : null}
      <input
        className={cn(
          "input-neu w-full rounded-2xl px-4 py-3 text-sm text-[#2c3d52] outline-none transition-all",
          "placeholder:text-[#7f91a6]",
          icon ? "pl-10" : "",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function NeuTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "input-neu w-full rounded-2xl px-4 py-3 text-sm text-[#2c3d52] outline-none transition-all resize-none",
        "placeholder:text-[#7f91a6]",
        className
      )}
      {...props}
    />
  );
}

export function NeuSelect({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "input-neu w-full rounded-2xl px-4 py-3 text-sm text-[#2c3d52] outline-none transition-all",
        "placeholder:text-[#7f91a6]",
        className
      )}
      {...props}
    />
  );
}

export function NeuChip({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("chip-neu inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold tracking-[0.01em]", className)} {...props}>
      {children}
    </span>
  );
}

export function NeuAlert({
  className,
  tone = "secondary",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Variant }) {
  const tones: Record<Variant, string> = {
    primary: "bg-[linear-gradient(145deg,#ffe1e1_0%,#f7c8c8_100%)] text-[#b86a6a]",
    secondary: "bg-[#e6e7ee] text-[#4e6785]",
    success: "bg-[#e6e7ee] text-[#d78484]",
    danger: "bg-[#e6e7ee] text-[#b86a6a]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/50 px-4 py-3 text-sm shadow-[4px_4px_8px_rgba(164,177,193,0.18),-4px_-4px_8px_rgba(255,255,255,0.58)]",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NeuIconTile({
  className,
  children,
  tone = "secondary",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: "primary" | "secondary" | "accent" }) {
  const tones = {
    primary: "bg-[linear-gradient(145deg,#f0aaaa_0%,#dd9090_100%)] text-white",
    secondary: "bg-[#e6e7ee] text-[#4e6785]",
    accent: "bg-[#e6e7ee] text-[#cf7e7e]",
  };

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl border border-white/50 shadow-[4px_4px_8px_rgba(164,177,193,0.24),-4px_-4px_8px_rgba(255,255,255,0.58)]",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
