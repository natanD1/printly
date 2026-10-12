import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  indicatorClassName?: string;
  value: number;
}

function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress"
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          indicatorClassName
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export { Progress };
