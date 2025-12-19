import { Check, Search } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import { PermissionGroup } from "./components/permission-group";
import { PresetCard } from "./components/preset-card";
import { SearchBar } from "./components/searchbar";
import { presetRoles } from "./data";
import { usePermissions } from "./hooks/use-permissions";
import { Role } from "@/@types/roles";
import { hasPermission } from "@/utils/permissions";
import {
  useGetAuthenticatedUserPermissions,
  useGetUser,
  useUpdateUserPermissions,
} from "@/http/generated/user/user";
import { useNavigate, useParams } from "react-router-dom";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";

export default function UsersPermissions() {
  const { data: user } = useGetAuthenticatedUserPermissions();

  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const {
    data: editUser,
    isFetching,
    queryKey,
  } = useGetUser(id as string, {
    query: {
      enabled: isEdit && !!id,
    },
  });

  const { mutateAsync: updateUserPermission } = useUpdateUserPermissions({
    mutation: {
      onSuccess: () => {
        toast.success("Permissões atualizadas com sucesso!");
      },
    },
  });

  const {
    selectedPermissions,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    filteredGroups,
    togglePermission,
    toggleGroup,
    toggleAllInGroup,
    applyPreset,
    selectAll,
    clearAll,
    getPresetNewPermissions,
  } = usePermissions({ editUser, isFetching });

  const handleSave = async () => {
    await updateUserPermission({
      data: {
        id: id as string,
        roleIds: selectedPermissions as Role[],
      },
    });
    queryClient.invalidateQueries({
      queryKey,
    });
    navigate("/users/list");
  };

  return (
    <motion.div {...softEnter} className="bg-connect">
      <div className="border-none shadow-none p-8 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle>Gerenciar Permissões</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure permissões personalizadas ou escolha um perfil
              pré-definido
            </p>
          </div>

          {selectedPermissions.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-medium"
            >
              <Check className="size-4" />
              {selectedPermissions.length} selecionadas
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          {/* Presets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Perfis Pré-definidos</p>
                <p className="text-sm text-muted-foreground">
                  Comece rápido com templates prontos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {presetRoles.map((preset) => {
                const newPermissions = getPresetNewPermissions(preset);
                const allSelected = newPermissions.length === 0;

                return (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    newPermissions={newPermissions}
                    allSelected={allSelected}
                    onApply={applyPreset}
                  />
                );
              })}
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-4 py-2 bg-gray-100 rounded-full">
              ou personalize
            </span>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Personalização */}
          <div className="space-y-6">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectAll={selectAll}
              onClearAll={clearAll}
              hasSelectedPermissions={selectedPermissions.length > 0}
            />

            {/* Groups */}
            <div className="space-y-4">
              {filteredGroups.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Search className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhuma permissão encontrada</p>
                </div>
              )}

              {filteredGroups
                .filter((group) => {
                  if (group.resource === "sys_admin") {
                    return hasPermission(
                      user?.data,
                      Role["sys_admin:accessAll"]
                    );
                  }
                  return group;
                })
                .map((group) => (
                  <PermissionGroup
                    key={group.resource}
                    group={group}
                    isOpen={expandedGroups.has(group.resource)}
                    selectedPermissions={selectedPermissions}
                    onToggleGroup={toggleGroup}
                    onToggleAllInGroup={toggleAllInGroup}
                    onTogglePermission={togglePermission}
                  />
                ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleSave} disabled={!selectedPermissions.length}>
              Salvar ({selectedPermissions.length})
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
