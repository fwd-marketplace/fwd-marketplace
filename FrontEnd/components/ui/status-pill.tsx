import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold",
  {
    variants: {
      variant: {
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        magenta: "bg-magenta/15 text-magenta",
        secondary: "bg-secondary/15 text-secondary",
        "new-talent": "bg-accent/15 text-accent",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

interface StatusPillProps extends VariantProps<typeof statusPillVariants> {
  label: string;
  className?: string;
}

export function StatusPill({ label, variant, className }: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ variant }), className)}>
      {label}
    </span>
  );
}
