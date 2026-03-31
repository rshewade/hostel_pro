import * as React from "react";
import { cn } from "@/lib/utils";

export type ChipVariant = "default" | "success" | "warning" | "error" | "info";

const STATUS_CLASSES: Record<string, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: "sm" | "md" | "lg";
  onClose?: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
}

const Chip = ({
  className,
  variant = "default",
  size = "md",
  onClose,
  disabled = false,
  leftIcon,
  children,
  ...props
}: ChipProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border border-transparent rounded-full transition-colors duration-200",
        {
          "px-2 py-1 text-xs gap-1": size === "sm",
          "px-2.5 py-1 text-sm gap-1.5": size === "md",
          "px-3 py-1.5 text-base gap-2": size === "lg",
        },
        !disabled && !onClose && "cursor-default",
        !disabled && onClose && "cursor-pointer hover:opacity-80",
        disabled && "opacity-50 cursor-not-allowed",
        STATUS_CLASSES[variant],
        className
      )}
      {...props}
    >
      {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
      <span className="inline-flex items-center">{children}</span>
      {onClose && !disabled && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "inline-flex items-center justify-center rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
            { "w-3 h-3": size === "sm", "w-4 h-4": size === "md", "w-5 h-5": size === "lg" }
          )}
          aria-label="Remove"
        >
          <svg
            className={cn({ "w-2.5 h-2.5": size === "sm", "w-3 h-3": size === "md", "w-3.5 h-3.5": size === "lg" })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

Chip.displayName = "Chip";

export { Chip };
