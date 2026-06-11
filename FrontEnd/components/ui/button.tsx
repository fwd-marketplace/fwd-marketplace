import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "rounded-full border border-transparent",
    "font-body text-sm font-semibold whitespace-nowrap",
    "transition-[background-color,opacity,transform]",
    "duration-[var(--duration-fast)] ease-[var(--ease-out)]",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/85",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/85",
        highlight:
          "bg-highlight text-highlight-foreground hover:bg-highlight/85",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/85",
        magenta:
          "bg-magenta text-magenta-foreground hover:bg-magenta/85",
        outline:
          "border-border bg-transparent text-ink hover:bg-surface-sunken",
        ghost:
          "bg-transparent text-ink hover:bg-surface-sunken",
        link:
          "text-primary underline-offset-4 hover:underline border-transparent bg-transparent",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        default: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
