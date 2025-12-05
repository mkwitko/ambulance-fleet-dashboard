import { useState } from "react";

export default function useFilteringScopeHook(
  hasCompanyGroup = true,
  hasCompanies = true,
  hasUnits = true,
  hasBases = true
) {
  // ============ STATE PARA UI ============
  const [uiCompanyGroupId, setUiCompanyGroupId] = useState<
    string | undefined
  >();
  const [uiCompaniesId, setUiCompaniesId] = useState<string[] | undefined>();
  const [uiUnitsId, setUiUnitsId] = useState<string[] | undefined>();
  const [uiBasesId, setUiBasesId] = useState<string[] | undefined>();

  // ============ STATE PARA FILTROS APLICADOS ============
  const [appliedFilters, setAppliedFilters] = useState({
    companyGroupId: undefined as string | undefined,
    companiesId: undefined as string[] | undefined,
    unitsId: undefined as string[] | undefined,
    basesId: undefined as string[] | undefined,
  });

  // ============ APLICA OS FILTROS ============
  const applyFilters = () => {
    setAppliedFilters({
      companyGroupId: uiCompanyGroupId,
      companiesId: uiCompaniesId,
      unitsId: uiUnitsId,
      basesId: uiBasesId,
    });
  };

  const clearFilters = () => {
    setUiCompanyGroupId(undefined);
    setUiCompaniesId(undefined);
    setUiUnitsId(undefined);
    setUiBasesId(undefined);

    setAppliedFilters({
      companyGroupId: undefined,
      companiesId: undefined,
      unitsId: undefined,
      basesId: undefined,
    });
  };

  const hasAppliedFilters = () => {
    const { companyGroupId, companiesId, unitsId, basesId } = appliedFilters;

    return (
      companyGroupId !== undefined ||
      (companiesId !== undefined && companiesId.length > 0) ||
      (unitsId !== undefined && unitsId.length > 0) ||
      (basesId !== undefined && basesId.length > 0)
    );
  };

  const getTopPriorityFilter = () => {
    const { basesId, unitsId, companiesId, companyGroupId } = appliedFilters;

    if (basesId && basesId.length > 0) {
      return { basesId };
    }

    if (unitsId && unitsId.length > 0) {
      return { unitsId };
    }

    if (companiesId && companiesId.length > 0) {
      return { companiesId };
    }

    if (companyGroupId) {
      return { companyGroupId };
    }

    return undefined; // nada selecionado
  };

  return {
    // UI
    uiCompanyGroupId,
    setUiCompanyGroupId,
    uiCompaniesId,
    setUiCompaniesId,
    uiUnitsId,
    setUiUnitsId,
    uiBasesId,
    setUiBasesId,

    // Aplicados
    appliedFilters,
    hasAppliedFilters,
    getTopPriorityFilter,

    // Action
    applyFilters,
    clearFilters,

    // Config
    hasCompanyGroup,
    hasCompanies,
    hasUnits,
    hasBases,
  };
}

export type FilteringScopeHook = ReturnType<typeof useFilteringScopeHook>;
