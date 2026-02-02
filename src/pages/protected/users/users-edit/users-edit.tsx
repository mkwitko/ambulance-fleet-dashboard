import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { useGetUnits } from "@/http/generated/unit/unit";
import { useGetCompanies } from "@/http/generated/company/company";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateUser,
  useGetAuthenticatedUserAssociations,
  useGetUser,
  useUpdateUser,
} from "@/http/generated/user/user";
import { Role } from "@/@types/roles";
import { AppMultiSelect } from "@/components/app-multi-select";
import { useHookFormMask } from "use-mask-input";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import { useEffect } from "react";
import { format } from "date-fns";
import { queryClient } from "@/lib/react-query";
import useUsersHook from "../users-listing/hooks/use-users";

// --- 🔒 Schema de validação ---
const usersSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  mail: z.string().refine((val) => val.includes("@"), {
    message: "O e-mail é obrigatório",
  }),
  document: z.string().optional(),
  companiesId: z.array(z.string()).min(1, "A empresa é obrigatória"),
  unitsId: z.array(z.string()).min(1, "A unidade é obrigatória"),
  birthDate: z.string({
    message: "A data de nascimento é obrigatória",
  }),
});

type UsersFormValues = z.infer<typeof usersSchema>;

export default function UsersEdit() {
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
  } = useForm<UsersFormValues>({
    resolver: zodResolver(usersSchema),
    mode: "all",
  });

  // Routing
  const navigate = useNavigate();

  const { queryKey } = useUsersHook();

  const { data: userAssociations } = useGetAuthenticatedUserAssociations();
  const { data: userToEdit, isFetching } = useGetUser(id as string, {
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

  const { data: units, isFetching: isFetchingUnits } = useGetUnits(
    {
      companiesId: watch("companiesId"),
    },
    {
      query: {
        enabled:
          !!userAssociations &&
          !!watch("companiesId")?.length &&
          watch("companiesId")?.length > 0,
      },
    },
  );

  const { mutateAsync: createUser } = useCreateUser({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey });
        toast.success("Usuário criada com sucesso!");
        navigate("/users/list");
      },
      onError: (error: any) => {
        toast.error(
          error.response.data.message ||
            "Houve um erro ao criar a usuário. Tente novamente.",
        );
      },
    },
  });

  const { mutateAsync: updateUser } = useUpdateUser({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey });
        toast.success("Usuário atualizado com sucesso!");
        navigate("/users/list");
      },
    },
  });

  useEffect(() => {
    if (isFetching) return;
    if (isEdit && userToEdit) {
      console.log({ userToEdit });
      reset({
        name: userToEdit?.data.name || "",
        mail: userToEdit?.data.mail || "",
        document: userToEdit?.data.document || "",
        companiesId:
          userToEdit?.data.companies?.map((company) => company.id) || [],
        unitsId: userToEdit?.data.units?.map((unit) => unit.id) || [],
        birthDate: userToEdit?.data.birthDate
          ? format(new Date(userToEdit.data.birthDate), "dd/MM/yyyy")
          : "",
      });
    }
  }, [isFetching]);

  // Submit
  const onSubmit = async (data: UsersFormValues) => {
    const [day, month, year] = data.birthDate.split("/");
    const birthDate = new Date(`${year}-${month}-${day}T00:00:00`);
    if (isEdit) {
      await updateUser({
        id: id as string,
        data: {
          name: data.name,
          document: data.document,
          birthDate,
          companyGroupId: userAssociations?.data.companyGroup?.id as string,
          companiesIds: data.companiesId,
          unitsIds: data.unitsId,
        },
      });
      return;
    }
    await createUser({
      data: {
        name: data.name,
        mail: data.mail,
        document: data.document,
        companyGroupId: userAssociations?.data.companyGroup?.id as string,
        companiesIds: data.companiesId,
        unitsIds: data.unitsId,
        birthDate,
        roles: [Role["chat:read"], Role["chat:sendMessage"], Role["unit:read"]],
      },
    });
  };

  // Mask
  const registerWithMask = useHookFormMask(register);

  return (
    <motion.div {...softEnter} className="h-full w-full flex justify-center">
      <Card className="w-full bg-connect">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {isEdit ? "Editar Usuário" : "Novo Usuário"}
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
                  <Label>Nome do Usuário *</Label>
                  <Input placeholder="Digite o nome" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Documento */}
                <div className="flex flex-col gap-2">
                  <Label>E-mail *</Label>
                  <Input placeholder="Digite o e-mail" {...register("mail")} />
                  {errors.mail && (
                    <p className="text-sm text-destructive">
                      {errors.mail.message}
                    </p>
                  )}
                </div>

                {/* Data nascimento */}
                <div className="flex flex-col gap-2">
                  <Label>Data de Nascimento *</Label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    {...registerWithMask("birthDate", ["99/99/9999"], {
                      showMaskOnFocus: false,
                      showMaskOnHover: false,
                    })}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-destructive">
                      {errors.birthDate.message}
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
                    onRemovedValue={(value) => {
                      const updatedUnits = units?.data
                        .filter((unit) => unit.company.id !== value)
                        .map((unit) => unit.id);

                      if (updatedUnits) {
                        setValue(
                          "unitsId",
                          watch("unitsId").filter((id) =>
                            updatedUnits.includes(id),
                          ),
                          { shouldValidate: true },
                        );
                      }
                    }}
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
                <div className="flex flex-col gap-2">
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
                </div>
              </div>
            </section>

            {/* --- AÇÕES ----------------------------------------------- */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/users/list")}
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
                {isEdit ? "Salvar alterações" : "Criar usuário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
