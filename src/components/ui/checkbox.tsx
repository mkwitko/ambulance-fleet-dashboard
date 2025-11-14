import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer relative flex items-center justify-center size-5 rounded-md border border-accent-foreground bg-background shadow-sm transition-all duration-200",
        "hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center justify-center text-current"
        >
          <CheckIcon className="w-3.5 h-3.5" />
        </motion.div>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
