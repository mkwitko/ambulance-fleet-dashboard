import type { GetAuthenticatedUser200Data } from "@/http/generated/connect-server.schemas";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: GetAuthenticatedUser200Data;
}

export function UserCard({ user }: UserCardProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative mx-3 mt-3 mb-4 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative flex items-center gap-4 px-4 py-4 backdrop-blur-sm">
        {/* Avatar with ring */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/40 to-primary/20 rounded-full blur-md" />
          <Avatar
            className={cn(
              "w-14 h-14 relative border-2 border-white dark:border-slate-800 shadow-lg",
              "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
            )}
          >
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white font-semibold text-lg">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </motion.div>

        {/* User info */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Greeting */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-xs font-medium text-primary tracking-wide"
          >
            {getGreeting()}! 👋
          </motion.span>

          {/* Name */}
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm font-bold text-foreground truncate leading-tight"
          >
            {user.name}
          </motion.h3>
        </div>

        {/* Status indicator */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
          title="Online"
        />
      </div>

      {/* Bottom border accent */}
      <div className="h-0.5 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}
