import type { MotionProps, Transition } from "framer-motion";

export const hoverTap: MotionProps = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 },
  transition: { type: "spring" as const, stiffness: 400 } as Transition,
};
