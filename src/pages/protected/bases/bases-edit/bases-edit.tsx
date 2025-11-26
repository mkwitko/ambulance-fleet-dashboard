import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { useGetUnits } from "@/http/generated/unit/unit";
import { useGetCompanies } from "@/http/generated/company/company";
import {
  useCreateBase,
  useGetBase,
  useUpdateBase,
} from "@/http/generated/base/base";
import BasePhone from "./components/base-phone";
import { AppSelect } from "@/components/app-select";
import { zodResolver } from "@hookform/resolvers/zod";

// --- 🔒 Schema de validação ---
const baseSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  companyId: z.string().min(1, "A empresa é obrigatória"),
  unitId: z.string().min(1, "A unidade é obrigatória"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type BaseFormValues = z.infer<typeof baseSchema>;

export default function BaseEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  // Routing
  const navigate = useNavigate();

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BaseFormValues>({
    resolver: zodResolver(baseSchema),
  });

  // Queries
  const { data: companies, isFetching: isFetchingCompanies } = useGetCompanies(
    {}
  );

  const { data: units, isFetching: isFetchingUnits } = useGetUnits(
    {
      companyId: watch("companyId"),
    },
    {
      query: {
        enabled: !!watch("companyId"),
      },
    }
  );

  const {
    data: base,
    isFetching: isFetchingBase,
    queryKey: baseQueryKey,
  } = useGetBase(id as string, {
    query: {
      enabled: isEdit,
    },
  });

  const { mutateAsync: createBase } = useCreateBase({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({ queryKey: baseQueryKey });
        toast.success("Base criada com sucesso!");
        navigate("/units/list/" + response.id);
      },
    },
  });

  const { mutateAsync: updateBase } = useUpdateBase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: baseQueryKey });
      },
    },
  });

  // Submit
  const onSubmit = async (data: BaseFormValues) => {
    if (isEdit) {
      await updateBase({
        baseId: base?.data.id as string,
        data: {
          name: data.name,
        },
      });
      return;
    }
    await createBase({
      data: {
        name: data.name,
        unitId: data.unitId,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      },
    });
  };

  // Effects
  useEffect(() => {
    if (isFetchingBase || isFetchingCompanies) return;
    if (base && isEdit) {
      setValue("name", base.data.name);
      setValue("companyId", base.data.unit.company.id);
      setValue("unitId", base.data.unit.id);
      setValue(
        "latitude",
        base.data.latitude ? String(base.data.latitude) : ""
      );
      setValue(
        "longitude",
        base.data.longitude ? String(base.data.longitude) : ""
      );
    }
  }, [isFetchingBase, isFetchingCompanies, isFetchingUnits, isEdit]);

  return (
    <motion.div {...softEnter} className="space-y-8 h-full">
      <Card className="bg-connect">
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Base" : "Nova Base"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1">
              <div className="grid gap-2">
                <Label>Nome da Base *</Label>
                <Input placeholder="Digite o nome" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Empresa *</Label>
                <AppSelect
                  value={watch("companyId")}
                  onValueChange={(value) => {
                    setValue("companyId", value);
                  }}
                  placeholder="Selecione a Empresa"
                  disabled={companies?.data.length === 0}
                  disabledMessage={
                    companies?.data.length === 0
                      ? "Nenhuma empresa disponível. Crie uma empresa primeiro."
                      : undefined
                  }
                  items={
                    companies?.data?.map((company) => ({
                      label: company.name,
                      value: company.id,
                    })) || []
                  }
                  emptyMessage="Nenhuma empresa encontrada."
                  loading={isFetchingCompanies}
                />
                {errors.companyId && (
                  <p className="text-sm text-destructive">
                    {errors.companyId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Unidade *</Label>
                <AppSelect
                  value={watch("unitId")}
                  onValueChange={(value) => {
                    setValue("unitId", value);
                  }}
                  placeholder="Selecione a Unidade"
                  disabled={
                    !watch("companyId") || !units || units.data.length === 0
                  }
                  disabledMessage={
                    !watch("companyId")
                      ? "Selecione uma empresa primeiro."
                      : !units || units.data.length === 0
                      ? "Nenhuma unidade disponível para esta empresa."
                      : undefined
                  }
                  items={
                    units?.data?.map((unit) => ({
                      label: unit.name,
                      value: unit.id,
                    })) || []
                  }
                  emptyMessage="Nenhuma unidade encontrada."
                  loading={isFetchingUnits}
                />
                {errors.unitId && (
                  <p className="text-sm text-destructive">
                    {errors.unitId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-2 flex-1">
                <Label>Latitude</Label>
                <Input
                  placeholder="Digite o latitude"
                  {...register("latitude")}
                />
                {errors.latitude && (
                  <p className="text-sm text-destructive">
                    {errors.latitude.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 flex-1">
                <Label>Longitude</Label>
                <Input
                  placeholder="Digite a longitude"
                  {...register("longitude")}
                />
                {errors.longitude && (
                  <p className="text-sm text-destructive">
                    {errors.longitude.message}
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
              <Button type="submit" animated isSubmitting={isSubmitting}>
                {isEdit ? "Salvar alterações" : "Criar base"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <BasePhone isEdit={isEdit} id={id as string} />
    </motion.div>
  );
}
