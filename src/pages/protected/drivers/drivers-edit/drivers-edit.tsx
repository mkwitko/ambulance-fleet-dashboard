import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { useGetCompanies } from "@/http/generated/company/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetAuthenticatedUserAssociations } from "@/http/generated/user/user";
import { AppMultiSelect } from "@/components/app-multi-select";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import { useEffect } from "react";
import { queryClient } from "@/lib/react-query";
import useUsersHook from "../drivers-listing/hooks/use-drivers";
import {
  useCreateDriver,
  useGetDriverById,
  useUpdateDriver,
} from "@/http/generated/drivers/drivers";

// --- 🔒 Schema de validação ---
const driversSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  logFrotaId: z.string(),
  document: z.string().optional(),
  companiesId: z.array(z.string()).min(1, "A empresa é obrigatória"),
  unitsId: z.array(z.string()).min(1, "A unidade é obrigatória"),
});

type DriversFormValues = z.infer<typeof driversSchema>;

export default function DriversEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DriversFormValues>({
    resolver: zodResolver(driversSchema),
    mode: "all",
  });

  // Routing
  const navigate = useNavigate();

  const { queryKey } = useUsersHook();

  const { data: userAssociations } = useGetAuthenticatedUserAssociations();
  const { data: driverToEdit, isFetching } = useGetDriverById(id as string, {
    query: {
      enabled: isEdit && !!id,
    },
  });

  const { data: companies, isFetching: isFetchingCompanies } = useGetCompanies(
    {},
    {
      query: {
        enabled: !!userAssociations,
      },
    },
  );

  // const { data: units, isFetching: isFetchingUnits } = useGetUnits(
  //   {
  //     companiesId: watch("companiesId"),
  //   },
  //   {
  //     query: {
  //       enabled:
  //         !!userAssociations &&
  //         !!watch("companiesId")?.length &&
  //         watch("companiesId")?.length > 0,
  //     },
  //   },
  // );

  const { mutateAsync: createDriver } = useCreateDriver({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey });
        toast.success("Motorista criada com sucesso!");
        navigate("/drivers/list");
      },
      onError: (error: any) => {
        toast.error(
          error.response.data.message ||
            "Houve um erro ao criar o motorista. Tente novamente.",
        );
      },
    },
  });

  const { mutateAsync: updateDriver } = useUpdateDriver({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey });
        toast.success("Motorista atualizado com sucesso!");
        navigate("/drivers/list");
      },
    },
  });

  useEffect(() => {
    if (isFetching) return;
    if (isEdit && driverToEdit) {
      reset({
        name: driverToEdit?.data?.name || "",
        logFrotaId: driverToEdit?.data?.logFrotaId || "",
        document: driverToEdit?.data?.cpf || "",
        companiesId:
          driverToEdit?.data?.companies?.map((company) => company.id) || [],
        unitsId: driverToEdit?.data?.units?.map((unit) => unit.id) || [],
      });
    }
  }, [isFetching]);

  // Submit
  const onSubmit = async (data: DriversFormValues) => {
    if (isEdit) {
      await updateDriver({
        id: id as string,
        data: {
          name: data.name,
          logFrotaId: data.logFrotaId,
          document: data.document,
          companyGroupId: userAssociations?.data.companyGroup?.id as string,
          companiesIds: data.companiesId,
          unitsIds: data.unitsId,
        },
      });
      return;
    }
    await createDriver({
      data: {
        name: data.name,
        logFrotaId: data.logFrotaId,
        document: data.document as string,
        companyGroupId: userAssociations?.data.companyGroup?.id as string,
        companiesIds: data.companiesId,
        unitsIds: data.unitsId,
      },
    });
  };

  return (
    <motion.div {...softEnter} className="h-full w-full flex justify-center">
      <Card className="w-full bg-connect">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {isEdit ? "Editar Motorista" : "Novo Motorista"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* --- DADOS PESSOAIS ------------------------------------- */}
            <section className="space-y-6">
              <h3 className="font-medium">Dados pessoais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nome */}
                <div className="flex flex-col gap-2">
                  <Label>Nome do Motorista *</Label>
                  <Input placeholder="Digite o nome" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Documento */}
                <div className="flex flex-col gap-2">
                  <Label>CPF *</Label>
                  <Input placeholder="Digite o CPF" {...register("document")} />
                  {errors.document && (
                    <p className="text-sm text-destructive">
                      {errors.document.message}
                    </p>
                  )}
                </div>

                {/* Log Frota */}
                <div className="flex flex-col gap-2">
                  <Label>ID Log Frota *</Label>
                  <Input
                    placeholder="Digite o ID do Log Frota"
                    {...register("logFrotaId")}
                  />
                  {errors.logFrotaId && (
                    <p className="text-sm text-destructive">
                      {errors.logFrotaId.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* --- VÍNCULOS ------------------------------------------- */}
            <section className="space-y-6">
              <h3 className="font-medium">Vínculos</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Empresas */}
                <div className="flex flex-col gap-2">
                  <Label>Empresas *</Label>
                  <AppMultiSelect
                    value={watch("companiesId")}
                    onValueChange={(value) =>
                      setValue("companiesId", value, { shouldValidate: true })
                    }
                    // onRemovedValue={(value) => {
                    //   const updatedUnits = units?.data
                    //     .filter((unit) => unit.company.id !== value)
                    //     .map((unit) => unit.id);

                    //   if (updatedUnits) {
                    //     setValue(
                    //       "unitsId",
                    //       watch("unitsId").filter((id) =>
                    //         updatedUnits.includes(id),
                    //       ),
                    //       { shouldValidate: true },
                    //     );
                    //   }
                    // }}
                    placeholder="Selecione as Empresas"
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
                  {errors.companiesId && (
                    <p className="text-sm text-destructive">
                      {errors.companiesId.message}
                    </p>
                  )}
                </div>

                {/* Unidades */}
                {/* <div className="flex flex-col gap-2">
                  <Label>Unidades *</Label>
                  <AppMultiSelect
                    value={watch("unitsId")}
                    onValueChange={(value) =>
                      setValue("unitsId", value, { shouldValidate: true })
                    }
                    placeholder="Selecione as Unidades"
                    disabled={!units || units.data.length === 0}
                    disabledMessage={
                      !watch("companiesId") ||
                      watch("companiesId")?.length === 0
                        ? "Selecione empresas primeiro."
                        : units?.data.length === 0
                          ? "Nenhuma unidade disponível."
                          : undefined
                    }
                    items={
                      units?.data?.map((unit) => ({
                        label: unit.name,
                        value: unit.id,
                      })) || []
                    }
                    loading={isFetchingUnits}
                  />
                  {errors.unitsId && (
                    <p className="text-sm text-destructive">
                      {errors.unitsId.message}
                    </p>
                  )}
                </div> */}
              </div>
            </section>

            {/* --- AÇÕES ----------------------------------------------- */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/drivers/list")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                animated
                isSubmitting={isSubmitting}
              >
                {isEdit ? "Salvar alterações" : "Criar Motorista"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
