import type { Transition } from "framer-motion";

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: -5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.25, delay } as Transition,
});

export const fadeDown = (delay = 0) => ({
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 5 },
  transition: { duration: 0.25, delay } as Transition,
});

export const fadeOut = (delay = 0) => ({
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, delay } as Transition,
});

export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, delay } as Transition,
});
