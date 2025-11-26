import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PresetRole } from "../@types/user-permissions-types";
import { resourceTranslations, actionTranslations } from "../data";

interface PresetCardProps {
  preset: PresetRole;
  newPermissions: string[];
  allSelected: boolean;
  onApply: (preset: PresetRole) => void;
}

export function PresetCard({
  preset,
  newPermissions,
  allSelected,
  onApply,
}: PresetCardProps) {
  const Icon = preset.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <button
              disabled={allSelected}
              onClick={() => onApply(preset)}
              className={`
                w-full rounded-2xl border border-white/70 bg-white shadow-lg p-5 text-left
                transition-all duration-300 group relative overflow-hidden
                hover:shadow-xl
                ${
                  allSelected
                    ? "border-primary/30 bg-primary/5 cursor-not-allowed"
                    : "border-gray-200 hover:border-primary/20"
                }
              `}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br from-primary to-primary-foreground opacity-0 group-hover:opacity-5 transition-opacity`}
              />

              <div className="flex items-start gap-3 relative z-10">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${preset.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="size-5" />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{preset.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10 mt-6">
                <span className="text-xs text-muted-foreground">
                  {preset.permissions.length} permissões
                </span>

                {allSelected ? (
                  <span className="flex items-center gap-1.5 text-xs text-primary/70 bg-primary/10 px-3 py-1.5 rounded-full font-medium">
                    <Check className="size-3.5" />
                    Aplicado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-white bg-primary px-3 py-1.5 rounded-full font-medium shadow-sm">
                    +{newPermissions.length}
                  </span>
                )}
              </div>
            </button>
          </motion.div>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="center"
          className="p-4 bg-white shadow-xl border rounded-xl"
        >
          <p className="font-medium text-gray-900">
            {preset.name} — {preset.permissions.length} permissões
          </p>
          <p className="mt-1 text-sm text-gray-600">{preset.description}</p>

          {newPermissions.length > 0 && (
            <>
              <div className="h-px w-full bg-gray-200 my-3" />

              <p className="text-xs font-semibold text-gray-800 mb-1">
                Novas permissões ao aplicar:
              </p>

              <ul className="text-xs max-h-32 overflow-auto space-y-1">
                {newPermissions.slice(0, 6).map((perm) => {
                  const [res, act] = perm.split(":");
                  return (
                    <li key={perm} className="flex gap-1 text-gray-700">
                      <span className="font-medium">
                        {resourceTranslations[res] || res}:
                      </span>
                      <span>{actionTranslations[act] || act}</span>
                    </li>
                  );
                })}

                {newPermissions.length > 6 && (
                  <li className="text-gray-500 italic">
                    … e mais {newPermissions.length - 6}
                  </li>
                )}
              </ul>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
