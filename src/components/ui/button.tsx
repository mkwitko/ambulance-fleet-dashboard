import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { hoverTap } from "../motion/hover-tap";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-primary/60 text-white hover:bg-primary/50",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:scale-105 transition-all duration-200",
        outline: cn(
          // Base
          "border border-border bg-transparent text-foreground shadow-sm",
          // Hover
          "hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200",
          // Focus
          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        ),
        ghost: "hover:scale-102 transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
  animated = false,
  isSubmitting = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    animated?: boolean;
    isSubmitting?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const [minLoading, setMinLoading] = React.useState(false);

  React.useEffect(() => {
    if (isSubmitting) {
      setMinLoading(true);
      const timer = setTimeout(() => {
        if (!isSubmitting) {
          setMinLoading(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Quando isSubmitting volta a false, aguarda o tempo mínimo
      const timer = setTimeout(() => {
        setMinLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitting]);

  const isLoading = isSubmitting || minLoading;

  const classes = cn(buttonVariants({ variant, size, className }));

  if (animated) {
    return (
      <motion.div {...hoverTap}>
        <Comp
          data-slot="button"
          className={cn(classes, "relative overflow-hidden")}
          disabled={isLoading || props.disabled}
          {...props}
        >
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-primary/10 dark:bg-primary/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
          {isLoading && (
            <motion.svg
              className="size-4 animate-spin"
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
          )}
          {props.children}
        </Comp>
      </motion.div>
    );
  }

  // ✅ Regular static button with loading
  return (
    <Comp
      data-slot="button"
      className={classes}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="size-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {props.children}
    </Comp>
  );
}

export { Button, buttonVariants };
