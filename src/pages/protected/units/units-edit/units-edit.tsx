import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import {
  useCreateUnit,
  useGetUnit,
  useUpdateUnit,
} from "@/http/generated/unit/unit";
import { useGetCompanies } from "@/http/generated/company/company";
import UnitsPhone from "./components/units-phone";
import type { UnitFormValues } from "./form/units-schema";
import useUnitsForm from "./form/use-units-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UnitEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  // Routing
  const navigate = useNavigate();

  // Queries
  const { data: user } = useGetAuthenticatedUser({
    query: {
      enabled: !isEdit,
    },
  });

  const { data: companies } = useGetCompanies();

  const {
    data: unit,
    isFetching: isFetchingUnit,
    queryKey: unitQueryKey,
  } = useGetUnit(id as string, {
    query: {
      enabled: isEdit,
    },
  });

  const { mutateAsync: createUnit } = useCreateUnit({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({ queryKey: unitQueryKey });
        toast.success("Unidade criada com sucesso!");
        navigate("/units/list/" + response.id);
      },
    },
  });
  const { mutateAsync: updateUnit } = useUpdateUnit({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: unitQueryKey });
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
  }, [isFetchingUnit, isEdit]);

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
                <Select
                  value={watch("companyId")}
                  onValueChange={(value) => setValue("companyId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Empresas</SelectLabel>
                      {companies?.data?.map((company) => {
                        return (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                onClick={() => navigate("/companies/list")}
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
