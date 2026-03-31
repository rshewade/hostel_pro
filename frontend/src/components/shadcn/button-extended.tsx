"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 rounded px-2 text-xs",
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  active?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  truncate?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      active = false,
      iconOnly = false,
      fullWidth = false,
      truncate = false,
      leftIcon,
      rightIcon,
      icon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isIconOnly = iconOnly || (icon && !children);
    const isDisabled = disabled || loading;

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
          ref={ref}
          {...props}
        />
      );
    }

    const iconSizeClass = size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

    return (
      <button
        type={type}
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          loading && "cursor-wait",
          active && "ring-2 ring-offset-1 ring-ring"
        )}
        ref={ref}
        disabled={isDisabled}
        aria-pressed={active ? "true" : undefined}
        {...props}
      >
        {loading && (
          <svg
            className={cn("animate-spin", iconSizeClass, !isIconOnly && "-ml-1 mr-2")}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && isIconOnly && icon && (
          <span className={cn("inline-flex items-center", iconSizeClass)}>{icon}</span>
        )}

        {!loading && !isIconOnly && (
          <>
            {leftIcon && (
              <span className={cn("mr-2 inline-flex items-center", iconSizeClass)}>{leftIcon}</span>
            )}
            <span className={cn("inline-flex items-center", truncate && "truncate max-w-[200px]")}>
              {children}
            </span>
            {rightIcon && (
              <span className={cn("ml-2 inline-flex items-center", iconSizeClass)}>{rightIcon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { VariantProps };
