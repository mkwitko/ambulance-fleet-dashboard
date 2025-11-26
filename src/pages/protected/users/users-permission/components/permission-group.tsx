import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { PermissionGroup as PermissionGroupType } from "../@types/user-permissions-types";

interface PermissionGroupProps {
  group: PermissionGroupType;
  isOpen: boolean;
  selectedPermissions: string[];
  onToggleGroup: (resource: string) => void;
  onToggleAllInGroup: (group: PermissionGroupType) => void;
  onTogglePermission: (permissionKey: string) => void;
}

export function PermissionGroup({
  group,
  isOpen,
  selectedPermissions,
  onToggleGroup,
  onToggleAllInGroup,
  onTogglePermission,
}: PermissionGroupProps) {
  const keys = group.permissions.map((p) => p.key);
  const allSelected = keys.every((k) => selectedPermissions.includes(k));
  const someSelected = keys.some((k) => selectedPermissions.includes(k));

  return (
    <motion.div
      layout
      className={`
        bg-white shadow-md border-2 rounded-xl transition-all duration-300
        ${someSelected ? "border-primary/30" : "border-white/50"}
      `}
    >
      <button
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-t-2xl"
        onClick={() => onToggleGroup(group.resource)}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <ChevronDown className="size-4 text-muted-foreground" />
          </motion.div>

          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm">{group.displayName}</h3>
            <Badge className="text-[0.625rem]">
              {group.permissions.length}
            </Badge>
          </div>
        </div>

        <Button
          variant={allSelected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleAllInGroup(group);
          }}
        >
          <Check className="size-3.5 mr-1.5" />
          {allSelected
            ? "Selecionadas"
            : someSelected
            ? "Parcial"
            : "Selecionar"}
        </Button>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.permissions.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.key);
                return (
                  <motion.button
                    key={perm.key}
                    onClick={() => onTogglePermission(perm.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl text-left
                      border-2 transition-all duration-200
                      ${
                        isSelected
                          ? "border-primary/40 bg-primary/5 shadow-sm"
                          : "bg-gray-50 border-gray-200 hover:border-primary/30 hover:bg-primary/5"
                      }
                    `}
                  >
                    <Checkbox checked={isSelected} />
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-primary" : "text-gray-700"
                      }`}
                    >
                      {perm.displayAction}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
