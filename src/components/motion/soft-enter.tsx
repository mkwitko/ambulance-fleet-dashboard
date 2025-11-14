import type { Transition } from "framer-motion";

export const softEnter = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, delay } as Transition,
});
