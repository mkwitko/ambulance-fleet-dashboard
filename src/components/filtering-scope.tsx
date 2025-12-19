import { Role } from "@/@types/roles";
import { useGetBases } from "@/http/generated/base/base";
import { useGetCompanyGroups } from "@/http/generated/company-group/company-group";
import { useGetCompanies } from "@/http/generated/company/company";
import { useGetUnits } from "@/http/generated/unit/unit";
import {
  useGetAuthenticatedUserAssociations,
  useGetAuthenticatedUserRoles,
} from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/app-select";
import { AppMultiSelect } from "./app-multi-select";
import type { FilteringScopeHook } from "@/hooks/use-filtering-scope-hook";

export default function FilteringScope({
  filteringScopeHook,
}: {
  filteringScopeHook: FilteringScopeHook;
}) {
  const {
    // UI STATES (do seu filteringScopeHook)
    uiCompanyGroupId,
    setUiCompanyGroupId,
    uiCompaniesId,
    setUiCompaniesId,
    uiUnitsId,
    setUiUnitsId,
    uiBasesId,
    setUiBasesId,

    // filtos aplicados — não são usados no modal, só quando abro
    appliedFilters,

    // ação principal
    applyFilters,
    clearFilters,

    hasCompanyGroup,
    hasCompanies,
    hasUnits,
    hasBases,
  } = filteringScopeHook;

  const { data: user } = useGetAuthenticatedUserRoles();
  const { data: userAssociations } = useGetAuthenticatedUserAssociations();
  const userData = user?.data;

  // Permissions
  const perms = {
    isAdmin: hasPermission(userData, Role["sys_admin:accessAll"]),
    canCompanyGroup: hasPermission(userData, Role["companyGroup:read"]),
    canCompany: hasPermission(userData, Role["company:read"]),
    canUnit: hasPermission(userData, Role["unit:read"]),
  };

  const [open, setOpen] = useState(false);

  // Carregar valores quando abre o modal
  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (value) {
      // Quando abrir o modal — carregar appliedFilters → UI filters
      setUiCompanyGroupId(appliedFilters.companyGroupId);
      setUiCompaniesId(appliedFilters.companiesId);
      setUiUnitsId(appliedFilters.unitsId);
      setUiBasesId(appliedFilters.basesId);
    }
  };

  const { data: companyGroups, isFetching: isFetchingCompanyGroup } =
    useGetCompanyGroups(
      {},
      {
        query: {
          enabled: !!hasCompanyGroup && !!user && perms.isAdmin,
        },
      }
    );

  const { data: companies, isFetching: isFetchingCompanies } = useGetCompanies(
    {
      companyGroupId: perms.isAdmin
        ? (uiCompanyGroupId as string)
        : userAssociations?.data.companyGroup?.id,
    },
    {
      query: {
        enabled:
          !!hasCompanies &&
          !!user &&
          (perms.isAdmin ? !!uiCompanyGroupId : true),
      },
    }
  );

  const { data: units, isFetching: isFetchingUnits } = useGetUnits(
    {
      companiesId: uiCompaniesId as string[],
    },
    {
      query: {
        enabled: !!hasUnits && !!user && !!uiCompaniesId?.length,
      },
    }
  );

  const { data: bases, isFetching: isFetchingBases } = useGetBases(
    {
      unitsId: uiUnitsId as string[],
    },
    {
      query: {
        enabled: !!hasBases && !!user && !!uiUnitsId?.length,
      },
    }
  );

  // APLICAR FILTROS → envia somente para appliedFilters
  const onApplyFilters = () => {
    applyFilters();

    setOpen(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" animated>
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filtros de Escopo</DialogTitle>
          <DialogDescription>
            Selecione os filtros para refinar sua busca
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {perms.isAdmin && hasCompanyGroup && (
            <div className="flex flex-col gap-2">
              <Label>Grupo Empresa</Label>
              <AppSelect
                value={uiCompanyGroupId || ""}
                onValueChange={(value) => {
                  setUiCompanyGroupId(value);
                  setUiCompaniesId(undefined);
                  setUiUnitsId(undefined);
                  setUiBasesId(undefined);
                }}
                placeholder="Selecione o Grupo Empresa"
                disabled={!companyGroups?.data.length}
                items={
                  companyGroups?.data?.map((g) => ({
                    label: g.name,
                    value: g.id,
                  })) || []
                }
                emptyMessage="Nenhum grupo encontrado."
                loading={isFetchingCompanyGroup}
              />
            </div>
          )}

          {perms.canCompany && hasCompanies && (
            <div className="flex flex-col gap-2">
              <Label>Empresas</Label>
              <AppMultiSelect
                value={uiCompaniesId}
                onValueChange={(value) => {
                  setUiCompaniesId(value);
                  setUiUnitsId(undefined);
                  setUiBasesId(undefined);
                }}
                placeholder="Selecione a Empresa"
                disabled={
                  !companies?.data.length ||
                  (perms.isAdmin && !uiCompanyGroupId)
                }
                items={
                  companies?.data?.map((c) => ({
                    label: c.name,
                    value: c.id,
                  })) || []
                }
                emptyMessage="Nenhuma empresa encontrada."
                loading={isFetchingCompanies}
              />
            </div>
          )}

          {perms.canUnit && hasUnits && (
            <div className="flex flex-col gap-2">
              <Label>Unidades</Label>
              <AppMultiSelect
                value={uiUnitsId}
                onValueChange={(value) => {
                  setUiUnitsId(value);
                  setUiBasesId(undefined);
                }}
                placeholder="Selecione a Unidade"
                disabled={!units?.data.length || !uiCompaniesId?.length}
                items={
                  units?.data?.map((u) => ({
                    label: u.name,
                    value: u.id,
                  })) || []
                }
                emptyMessage="Nenhuma unidade encontrada."
                loading={isFetchingUnits}
              />
            </div>
          )}

          {hasBases && (
            <div className="flex flex-col gap-2">
              <Label>Bases</Label>
              <AppMultiSelect
                value={uiBasesId}
                onValueChange={setUiBasesId}
                placeholder="Selecione a Base"
                disabled={!bases?.data.length || !uiUnitsId?.length}
                items={
                  bases?.data?.map((b) => ({
                    label: b.name,
                    value: b.id,
                  })) || []
                }
                emptyMessage="Nenhuma base encontrada."
                loading={isFetchingBases}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={handleClearFilters}>
            Limpar
          </Button>

          <Button
            disabled={!uiCompaniesId}
            type="button"
            onClick={onApplyFilters}
          >
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
