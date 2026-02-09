import { useState, useMemo, useEffect } from "react";
import { Role, RolesData } from "@/@types/roles";
import {
  resourceTranslations,
  actionTranslations,
  resourceModules,
} from "../data";
import type {
  PermissionGroup,
  PresetRole,
} from "../@types/user-permissions-types";
import type { GetUser200 } from "@/http/generated/connect-server.schemas";
import { useGetAuthenticatedUserPermissions } from "@/http/generated/user/user";
import { useHasDriversIntegrationByUser } from "@/http/generated/drivers/drivers";
import { useGetUserModules } from "@/http/generated/module/module";
import { hasModule } from "@/utils/modules";

export function usePermissions({
  editUser,
  isFetching,
}: {
  editUser?: GetUser200 | undefined;
  isFetching: boolean;
}) {
  const { data: user } = useGetAuthenticatedUserPermissions();
  const { data: userModules } = useGetUserModules(
    {
      userId: editUser?.data.id as string,
    },
    {
      query: {
        enabled: !!editUser?.data.id,
      },
    },
  );

  const { data: hasDriverIntegration } = useHasDriversIntegrationByUser({
    query: {
      enabled: !!user,
    },
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const hasResourceModule = (resource: string) => {
    // descobrir quais módulos habilitam esse resource
    const requiredModules = Object.entries(resourceModules)
      .filter(([, resources]) => resources.includes(resource))
      .map(([moduleName]) => moduleName);

    // se o resource não depende de nenhum módulo, mostra sempre
    if (requiredModules.length === 0) return true;

    return hasModule(requiredModules, userModules);
  };

  useEffect(() => {
    if (isFetching) return;
    if (editUser?.data.roles) {
      setSelectedPermissions(editUser.data.roles);
    }
  }, [isFetching]);

  const permissionGroups = useMemo(() => {
    const groups: Record<string, PermissionGroup> = {};
    const roles = user?.data.roles ?? [];

    RolesData.forEach((permission) => {
      const [resource, action] = permission.split(":");

      // sys_admin: só aparece se tiver sys_admin
      if (
        permission === Role["sys_admin:accessAll"] &&
        !roles.includes(Role["sys_admin:accessAll"])
      ) {
        return;
      }

      // companyGroup_admin: aparece se tiver companyGroup OU sys_admin
      if (
        (permission === Role["companyGroup_admin:accessAll"] ||
          permission === Role["company_admin:accessAll"]) &&
        !roles.includes(Role["companyGroup_admin:accessAll"]) &&
        !roles.includes(Role["sys_admin:accessAll"])
      ) {
        return;
      }

      if (!hasResourceModule(resource)) {
        return;
      }

      if (resource === "driver" && !hasDriverIntegration) {
        return;
      }

      if (!groups[resource]) {
        groups[resource] = {
          resource,
          displayName: resourceTranslations[resource] || resource,
          permissions: [],
        };
      }
      groups[resource].permissions.push({
        key: permission,
        action,
        displayAction: actionTranslations[action] || action,
      });
    });
    return Object.values(groups).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }, [user, userModules]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return permissionGroups;
    const query = searchQuery.toLowerCase();
    return permissionGroups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (perm) =>
            perm.displayAction.toLowerCase().includes(query) ||
            group.displayName.toLowerCase().includes(query) ||
            perm.key.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [permissionGroups, searchQuery]);

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey],
    );
  };

  const toggleGroup = (resource: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.has(resource) ? newSet.delete(resource) : newSet.add(resource);
      return newSet;
    });
  };

  const toggleAllInGroup = (group: PermissionGroup) => {
    const keys = group.permissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));
    setSelectedPermissions((prev) =>
      allSelected ? prev.filter((p) => !keys.includes(p)) : [...prev, ...keys],
    );
  };

  const applyPreset = (preset: PresetRole) => {
    const newOnes = preset.permissions.filter(
      (p) => !selectedPermissions.includes(p),
    );
    setSelectedPermissions((prev) => [...prev, ...newOnes]);
  };

  const selectAll = () => setSelectedPermissions(RolesData);
  const clearAll = () => setSelectedPermissions([]);

  const getPresetNewPermissions = (preset: PresetRole) =>
    preset.permissions.filter((p) => !selectedPermissions.includes(p));

  return {
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
    hasModule,
    userModules,
    hasResourceModule,
  };
}
