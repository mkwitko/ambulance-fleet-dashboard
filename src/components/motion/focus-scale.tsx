import type { Transition } from "framer-motion";

export const focusScale = {
  whileFocus: { scale: 1.01 },
  transition: { type: "spring" as const, stiffness: 400 } as Transition,
};
