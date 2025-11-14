import { motion } from "framer-motion";
import { fadeUp } from "../motion/faders";

export default function ErrorText({
  message,
}: {
  message: string | undefined;
}) {
  return (
    <motion.p {...fadeUp} className="text-xs text-destructive font-medium">
      {message}
    </motion.p>
  );
}
