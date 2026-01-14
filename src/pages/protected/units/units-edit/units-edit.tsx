import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { useGetAuthenticatedUserAssociations } from "@/http/generated/user/user";
import {
  useCreateUnit,
  useGetUnit,
  useGetUnits,
  useUpdateUnit,
} from "@/http/generated/unit/unit";
import { useGetCompanies } from "@/http/generated/company/company";
import UnitsPhone from "./components/units-phone";
import type { UnitFormValues } from "./form/units-schema";
import useUnitsForm from "./form/use-units-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";
import { AppSelect } from "@/components/app-select";

export default function UnitEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  // Routing
  const navigate = useNavigate();

  // Queries
  const { data: user } = useGetAuthenticatedUserAssociations({
    query: {
      enabled: !isEdit,
    },
  });

  const { data: companies, isFetching: isFetchingCompanies } =
    useGetCompanies();

  const {
    data: unit,
    isFetching: isFetchingUnit,
    queryKey: unitByIdQueryKey,
  } = useGetUnit(id as string, {
    query: {
      enabled: isEdit,
    },
  });

  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { queryKey: unitsQueryKey } = useGetUnits(queryParams, {
    query: {
      enabled: !!hasSomePermission,
    },
  });

  const { mutateAsync: createUnit } = useCreateUnit({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: unitsQueryKey });
        toast.success("Unidade criada com sucesso!");
        navigate("/units/list/");
      },
    },
  });
  const { mutateAsync: updateUnit } = useUpdateUnit({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: unitsQueryKey });
        await queryClient.invalidateQueries({ queryKey: unitByIdQueryKey });
        toast.success("Unidade atualizada com sucesso!");
        navigate("/units/list/");
      },
    },
  });

  // Form
  const formMethods = useUnitsForm();
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = formMethods;

  // Submit
  const onSubmit = async (data: UnitFormValues) => {
    if (isEdit) {
      await updateUnit({
        unitId: unit?.data.id as string,
        data: {
          name: data.name,
          companyId: data.companyId,
        },
      });
      return;
    }
    await createUnit({
      data: {
        name: data.name,
        companyGroupId: user?.data.companyGroup?.id as string,
        companyId: data.companyId,
      },
    });
  };

  // Effects
  useEffect(() => {
    if (isFetchingUnit) return;
    if (unit && isEdit) {
      setValue("name", unit.data.name);
      setValue("companyId", unit.data.company.id);
    }
  }, [isFetchingUnit, isEdit, unit, companies]);

  return (
    <motion.div {...softEnter} className="space-y-8 h-full">
      <Card className="bg-connect">
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Unidade" : "Nova Unidade"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Nome da Unidade *</Label>
                <Input placeholder="Digite o nome" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Empresa *</Label>
                <AppSelect
                  value={watch("companyId")}
                  onValueChange={(value) =>
                    setValue("companyId", value, { shouldValidate: true })
                  }
                  placeholder="Selecione a Empresa"
                  disabled={!companies || companies?.data.length === 0}
                  disabledMessage={
                    !companies
                      ? "Selecione um grupo empresa primeiro."
                      : companies?.data.length === 0
                      ? "Nenhuma empresa encontrada."
                      : undefined
                  }
                  items={
                    companies?.data?.map((company) => ({
                      label: company.name,
                      value: company.id,
                    })) || []
                  }
                  loading={isFetchingCompanies}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/units/list")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  console.log(errors);
                }}
                type="submit"
                animated
                isSubmitting={isSubmitting}
              >
                {isEdit ? "Salvar alterações" : "Criar unidade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UnitsPhone isEdit={isEdit} id={id as string} />
    </motion.div>
  );
}
