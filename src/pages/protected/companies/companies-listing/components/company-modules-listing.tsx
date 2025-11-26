import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type {
  GetCompanyModules200DataItem,
  GetModules200DataItemBillingType,
} from "@/http/generated/connectServer.schemas";
import {
  ModulesBillingType,
  TranslatedModulesBillingType,
} from "@/utils/modules-billing-type";
import { AppSelect } from "@/components/app-select";
import { Label } from "@/components/ui/label";
import { currencyMask, removeCurrencyMask } from "@/utils/masks";

export default function CompanyModulesChildren({
  modules,
  onUpdateModule,
  onActiveChange,
}: {
  modules?: GetCompanyModules200DataItem[];
  onUpdateModule?: (
    id: string,
    data: {
      customBillingValue?: number | null;
      customBillingType?: GetModules200DataItemBillingType | null;
    }
  ) => void;
  onActiveChange?: (id: string, active: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("name");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editBillingType, setEditBillingType] =
    useState<GetModules200DataItemBillingType>("FIXED");

  const searched = useMemo(() => {
    if (!search) return modules;
    return modules?.filter((m) =>
      m.module.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, modules]);

  const sorted = useMemo(() => {
    return [...(searched ?? [])].sort((a, b) => {
      const va = a.customBillingValue ?? a.module.billingValue;
      const vb = b.customBillingValue ?? b.module.billingValue;

      switch (sortType) {
        case "price-asc":
          return va - vb;
        case "price-desc":
          return vb - va;
        case "active":
          return Number(b.active) - Number(a.active);
        default:
          return a.module.name.localeCompare(b.module.name);
      }
    });
  }, [searched, sortType]);

  const handleStartEdit = (mod: GetCompanyModules200DataItem) => {
    setEditingId(mod.id);
    setEditValue(
      mod.customBillingValue
        ? currencyMask(String(mod.customBillingValue * 100))
        : currencyMask(String(mod.module.billingValue * 100))
    );
    setEditBillingType(mod.customBillingType || mod.module.billingType);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateModule?.(id, {
      customBillingValue: Number(removeCurrencyMask(editValue)),
      customBillingType: editBillingType,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleResetCustomization = (mod: GetCompanyModules200DataItem) => {
    onUpdateModule?.(mod.id, {
      customBillingValue: null,
      customBillingType: null,
    });
  };

  return (
    <div className="mt-2">
      <CardContent className="p-0">
        {/* Barra de busca e ordenação */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Pesquisar módulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                Ordenar <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortType("name")}>
                Nome
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType("price-asc")}>
                Menor preço
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType("price-desc")}>
                Maior preço
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType("active")}>
                Ativos primeiro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lista de módulos */}
        <div className="space-y-4">
          {sorted.map((mod) => {
            const effectiveBillingType =
              mod.customBillingType || mod.module.billingType;
            const effectiveBillingValue =
              mod.customBillingValue ?? mod.module.billingValue;
            const isEditing = editingId === mod.id;
            const isCustomized =
              mod.customBillingValue !== null || mod.customBillingType !== null;

            return (
              <div
                key={mod.id}
                className={`bg-white/70 shadow-md border border-white/50 rounded-xl p-4 transition-all ${
                  isEditing ? "ring ring-input" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Informações do módulo */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {mod.module.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-1">
                        {mod.module.name}
                      </div>

                      {!isEditing ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            Tipo de Cobrança:{" "}
                            {TranslatedModulesBillingType[effectiveBillingType]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm font-medium">
                            {currencyMask(String(effectiveBillingValue * 100))}
                          </span>
                          {isCustomized && (
                            <>
                              <span className="px-2 py-0.5 bg-primary/10 text-primary/60 text-xs rounded-full font-medium">
                                Customizado
                              </span>
                              <button
                                onClick={() => handleResetCustomization(mod)}
                                className="text-xs text-muted-foreground hover:text-foreground underline"
                              >
                                Restaurar padrão
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 mt-2">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Tipo de cobrança */}
                            <div className="grid gap-2">
                              <Label className="text-xs text-muted-foreground">
                                Tipo de Cobrança
                              </Label>
                              <AppSelect
                                value={editBillingType}
                                onValueChange={(value) => {
                                  setEditBillingType(
                                    value as GetModules200DataItemBillingType
                                  );
                                }}
                                items={ModulesBillingType}
                              />
                            </div>

                            {/* Valor */}
                            <div className="grid gap-2">
                              <Label className="text-xs text-muted-foreground">
                                Valor do Módulo
                              </Label>
                              <Input
                                placeholder="Digite o valor"
                                value={editValue}
                                onChange={(value) => {
                                  const numericValue =
                                    value.target.value.replace(/[^\d,.]/g, "");
                                  setEditValue(currencyMask(numericValue));
                                }}
                              />
                            </div>
                          </div>

                          {/* Botões de ação */}
                          <div className="flex gap-2 mt-8 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(mod.id)}
                              animated
                            >
                              Salvar Alterações
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações à direita */}
                  {!isEditing && (
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(mod)}
                        className="h-8 px-3"
                      >
                        Editar
                      </Button>
                      <Switch
                        checked={mod.active}
                        onCheckedChange={(cheked) => {
                          onActiveChange && onActiveChange?.(mod.id, cheked);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum módulo encontrado</p>
          </div>
        )}
      </CardContent>
    </div>
  );
}
