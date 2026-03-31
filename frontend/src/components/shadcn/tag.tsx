import * as React from "react";
import { cn } from "@/lib/utils";

export type TagVariant = "default" | "success" | "warning" | "error" | "info";

const STATUS_CLASSES: Record<string, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: "sm" | "md" | "lg";
}

const Tag = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: TagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border border-transparent rounded-md",
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-2.5 py-0.5 text-sm": size === "md",
          "px-3 py-1 text-base": size === "lg",
        },
        STATUS_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

Tag.displayName = "Tag";

export { Tag };
