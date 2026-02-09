import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type {
  GetAuthenticatedUserPermissions200Data,
  GetAuthenticatedUserPermissions200DataRolesItem,
} from "@/http/generated/connect-server.schemas";
import { hasPermission } from "@/utils/permissions";
import { useState } from "react";

export interface NavLinkItem {
  type: string;
  role: GetAuthenticatedUserPermissions200DataRolesItem;
  to: string;
  icon: LucideIcon;
  title: string;
  children?: NavLinkItem[];
  onlySuperAdmin?: boolean;
}

interface SidebarItemProps {
  item: NavLinkItem;
  handleClose: () => void;
  user?: GetAuthenticatedUserPermissions200Data;
  level?: number;
  children?: React.ReactNode;
}

export function SidebarItem({
  item,
  handleClose,
  user,
  level = 0,
  children,
}: SidebarItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!hasPermission(user, item.role, item.onlySuperAdmin)) return null;

  const isActive = location.pathname === item.to;
  const isParentActive = item.children?.some(
    (child) => location.pathname === child.to,
  );
  const hasChildren = item.children && item.children.length > 0;

  const handleNavigate = () => {
    navigate(item.to);
    handleClose();
  };

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      handleNavigate();
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "w-full group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
          "overflow-hidden backdrop-blur-sm",
          level > 0 && "ml-2 pl-6",
          isActive && [
            "bg-primary text-white shadow-lg shadow-primary/30",
            "before:absolute before:inset-0 before:bg-linear-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
          ],
          !isActive &&
            isParentActive && [
              "bg-primary/8 text-primary border border-primary/20",
            ],
          !isActive &&
            !isParentActive && [
              "text-slate-700 dark:text-slate-300",
              "hover:bg-slate-100/80 dark:hover:bg-slate-800/80",
              "hover:shadow-sm",
            ],
        )}
      >
        {/* Subtle shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        <div className="flex items-center gap-3 flex-1 relative z-10">
          {/* Icon with improved animation */}
          <motion.div
            whileHover={{
              scale: 1.1,
              rotate: isActive ? 0 : [0, -10, 10, 0],
            }}
            transition={{ duration: 0.3 }}
            className={cn("relative", isActive && "drop-shadow-sm")}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isActive && "text-white",
                !isActive && isParentActive && "text-primary",
                !isActive &&
                  !isParentActive && [
                    "text-slate-500 dark:text-slate-400",
                    "group-hover:text-slate-700 dark:group-hover:text-slate-200",
                    "group-hover:scale-110",
                  ],
              )}
              strokeWidth={isActive ? 2.5 : 2}
            />
          </motion.div>

          {/* Title with better typography */}
          <span
            className={cn(
              "flex-1 text-left truncate tracking-wide transition-all duration-300",
              isActive && "font-semibold",
              !isActive && "group-hover:translate-x-0.5",
            )}
          >
            {item.title}
          </span>
        </div>

        {/* Chevron with smooth rotation */}
        {hasChildren && (
          <motion.div
            animate={{
              rotate: open ? 180 : 0,
              scale: open ? 1.1 : 1,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative z-10"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-colors duration-300",
                isActive && "text-white",
                !isActive && isParentActive && "text-primary",
                !isActive &&
                  !isParentActive &&
                  "text-slate-400 dark:text-slate-500 group-hover:text-slate-600",
              )}
              strokeWidth={2}
            />
          </motion.div>
        )}

        {/* Pulse indicator for active items without children */}
        {!hasChildren && isActive && (
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-white rounded-full relative z-10"
          />
        )}
        {children && children}
      </motion.button>

      {/* Children with staggered animation */}
      {hasChildren && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  opacity: {
                    duration: 0.3,
                    delay: 0.1,
                  },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  opacity: {
                    duration: 0.2,
                  },
                },
              }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 space-y-1 pl-4 relative">
                {/* Decorative line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />

                {item.children!.map((child, idx) => (
                  <motion.div
                    key={child.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: idx * 0.08,
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                      },
                    }}
                    exit={{
                      opacity: 0,
                      x: -10,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                  >
                    <SidebarItem
                      item={child}
                      handleClose={handleClose}
                      user={user}
                      level={level + 1}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
