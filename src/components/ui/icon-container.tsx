import { cn } from "@/lib/utils";

export function IconContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-5 items-center justify-center gap-2 rounded-sm bg-primary/15",
        className
      )}
    >
      {children}
    </div>
  );
}
