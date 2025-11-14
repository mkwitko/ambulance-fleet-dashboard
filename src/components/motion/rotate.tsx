import type { Transition } from "framer-motion";

export const rotatingScale: {
  animate: {
    rotate: number[];
    scale: number[];
  };
  transition: Transition;
} = {
  animate: {
    rotate: [0, 10, -10, 0],
    scale: [1, 1.2, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut", // TS aceita string literal "easeInOut"
  },
};
