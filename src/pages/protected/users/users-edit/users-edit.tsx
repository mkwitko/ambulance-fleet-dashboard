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
import { AppSelect } from "@/components/app-select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateUser,
  useGetAuthenticatedUser,
  useGetUser,
  useUpdateUser,
} from "@/http/generated/user/user";
import { Role } from "@/@types/roles";
import { useGetCompanyGroups } from "@/http/generated/company-group/company-group";
import { hasPermission } from "@/utils/permissions";
import { AppMultiSelect } from "@/components/app-multi-select";
import { useHookFormMask } from "use-mask-input";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import { useEffect } from "react";
import { format } from "date-fns";

// --- 🔒 Schema de validação ---
const usersSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  mail: z.string().refine((val) => val.includes("@"), {
    message: "O e-mail é obrigatório",
  }),
  document: z.string().optional(),
  companyGroupId: z.string({
    message: "O grupo empresa é obrigatório",
  }),
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

  // Routing
  const navigate = useNavigate();

  const { data: userToEdit, isFetching } = useGetUser(id as string, {
    query: {
      enabled: isEdit && !!id,
    },
  });

  useEffect(() => {
    if (isFetching) return;
    if (isEdit && userToEdit) {
      reset({
        name: userToEdit?.data.name || "",
        document: userToEdit?.data.document || "",
        companyGroupId: userToEdit?.data.companyGroupId || "",
        companiesId:
          userToEdit?.data.companies?.map((company) => company.id) || [],
        unitsId: userToEdit?.data.units?.map((unit) => unit.id) || [],
        birthDate: userToEdit?.data.birthDate
          ? format(new Date(userToEdit.data.birthDate), "dd/MM/yyyy")
          : "",
      });
    }
  }, [isFetching]);

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

  // Queries
  const { data: user } = useGetAuthenticatedUser();

  const isAdmin = hasPermission(user?.data, Role["sys_admin:accessAll"]);
  hasPermission(user?.data, Role["sys_admin:accessAll"]);

  const { data: companyGroups, isFetching: isFetchingCompanyGroup } =
    useGetCompanyGroups(
      {},
      {
        query: {
          enabled: user && isAdmin,
        },
      }
    );

  const { data: companies, isFetching: isFetchingCompanies } = useGetCompanies(
    {
      companyGroupId: isAdmin
        ? watch("companyGroupId")
        : user?.data.companyGroup?.id,
    },
    {
      query: {
        enabled: !!user && (isAdmin ? !!watch("companyGroupId") : true),
      },
    }
  );

  const { data: units, isFetching: isFetchingUnits } = useGetUnits(
    {
      companiesId: watch("companiesId"),
    },
    {
      query: {
        enabled:
          !!user &&
          !!watch("companiesId")?.length &&
          watch("companiesId")?.length > 0,
      },
    }
  );

  const { mutateAsync: createUser } = useCreateUser({
    mutation: {
      onSuccess: async () => {
        // await queryClient.invalidateQueries({ queryKey: userQueryKey });
        toast.success("Usuário criada com sucesso!");
        navigate("/users/list");
      },
      onError: (error: any) => {
        toast.error(
          error.response.data.message ||
            "Houve um erro ao criar a usuário. Tente novamente."
        );
      },
    },
  });

  const { mutateAsync: updateUser } = useUpdateUser({
    mutation: {
      onSuccess: () => {
        toast.success("Usuário atualizado com sucesso!");
        navigate("/users/list");
      },
    },
  });

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
          companyGroupId: data.companyGroupId,
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
        companyGroupId: data.companyGroupId,
        companiesIds: data.companiesId,
        unitsIds: data.unitsId,
        birthDate,
        roles: [Role["chat:read"], Role["chat:sendMessage"]],
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
                  <Label>Documento *</Label>
                  <Input
                    placeholder="Digite o documento"
                    {...registerWithMask("document", "cpf", {
                      showMaskOnFocus: false,
                      showMaskOnHover: false,
                      autoUnmask: true,
                    })}
                  />
                  {errors.document && (
                    <p className="text-sm text-destructive">
                      {errors.document.message}
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
                {/* Grupo empresa */}
                {isAdmin && (
                  <div className="flex flex-col gap-2">
                    <Label>Grupo Empresa *</Label>
                    <AppSelect
                      value={watch("companyGroupId")}
                      onValueChange={(value) =>
                        setValue("companyGroupId", value, {
                          shouldValidate: true,
                        })
                      }
                      placeholder="Selecione o Grupo Empresa"
                      disabled={companyGroups?.data.length === 0}
                      items={
                        companyGroups?.data?.map((g) => ({
                          label: g.name,
                          value: g.id,
                        })) || []
                      }
                      emptyMessage="Nenhum grupo encontrado."
                      loading={isFetchingCompanyGroup}
                    />
                    {errors.companyGroupId && (
                      <p className="text-sm text-destructive">
                        {errors.companyGroupId.message}
                      </p>
                    )}
                  </div>
                )}

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
                            updatedUnits.includes(id)
                          ),
                          { shouldValidate: true }
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
                disabled={!isValid}
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
