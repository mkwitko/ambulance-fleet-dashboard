import type { Transition } from "framer-motion";

export const jumpingEnter = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    delay: 0.2,
    type: "spring" as const,
    stiffness: 200,
  } as Transition,
};
