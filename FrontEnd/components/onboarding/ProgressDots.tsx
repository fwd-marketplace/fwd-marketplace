interface ProgressDotsProps {
  current: number;
  total: number;
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < current;
        const isCurrent = stepNumber === current;
        return (
          <span
            key={stepNumber}
            className={[
              "block transition-all duration-[--duration-base]",
              isCurrent
                ? "h-2 w-6 rounded-full bg-primary"
                : isCompleted
                  ? "h-2 w-2 rounded-full bg-primary"
                  : "h-2 w-2 rounded-full bg-secondary-foreground/25",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
