import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { AppSelect } from "@/components/app-select";

import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

import { toast } from "sonner";

import {
  useCreateCommsUser,
  useGetCommsUserById,
  useUpdateCommsUser,
} from "@/http/generated/comms-user/comms-user";

import { useGetBases } from "@/http/generated/base/base";
import useGetUserPermissions from "@/hooks/use-get-user-permissions";

// --- Schema ---
const usersSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  mail: z.string().refine((val) => /\S+@\S+\.\S+/.test(val), {
    message: "Email inválido",
  }),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  baseId: z.string().min(1, "A base é obrigatória"),
});

type UsersFormValues = z.infer<typeof usersSchema>;

export default function UsersCommsEdit() {
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  // Get user to edit
  const { data: userToEdit, isFetching } = useGetCommsUserById(id as string, {
    query: { enabled: isEdit && !!id },
  });

  // Permissions + bases
  const { queryParams, hasSomePermission } = useGetUserPermissions();

  const { data: bases, isLoading: isFetchingBases } = useGetBases(queryParams, {
    query: { enabled: hasSomePermission },
  });

  useEffect(() => {
    if (isFetching || isFetchingBases) return;
    if (isEdit && userToEdit && bases?.data && bases?.data.length > 0) {
      reset({
        name: userToEdit.name,
        mail: userToEdit.mail,
        baseId: userToEdit.base.id,
        password: userToEdit.password,
      });
    }
  }, [isFetching, isFetchingBases]);

  useEffect(() => {
    console.log("base id - ", watch("baseId"));
  }, [watch("baseId")]);

  // Mutations
  const { mutateAsync: createUser } = useCreateCommsUser({
    mutation: {
      onSuccess: async () => {
        toast.success("Usuário criado com sucesso!");
        navigate("/comms/list");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message ||
            "Houve um erro ao criar o usuário. Tente novamente."
        );
      },
    },
  });

  const { mutateAsync: updateUser } = useUpdateCommsUser({
    mutation: {
      onSuccess: () => {
        toast.success("Usuário atualizado com sucesso!");
        navigate("/comms/list");
      },
    },
  });

  // Submit
  const onSubmit = async (data: UsersFormValues) => {
    if (isEdit) {
      await updateUser({
        id: id as string,
        data,
      });
      return;
    }

    await createUser({ data });
  };

  return (
    <motion.div {...softEnter} className="h-full w-full flex justify-center">
      <Card className="w-full bg-connect">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {isEdit
              ? "Editar Usuário de Intercomunicação"
              : "Novo Usuário de Intercomunicação"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* --- Dados Pessoais --------------------------------------- */}
            <section className="space-y-6">
              <h3 className="font-medium">Dados pessoais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nome */}
                <div className="flex flex-col gap-2">
                  <Label>Nome *</Label>
                  <Input placeholder="Digite o nome" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label>Email *</Label>
                  <Input placeholder="Digite o email" {...register("mail")} />
                  {errors.mail && (
                    <p className="text-sm text-destructive">
                      {errors.mail.message}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div className="flex flex-col gap-2">
                  <Label>Senha *</Label>

                  <InputGroup>
                    <InputGroupAddon>
                      <LockIcon />
                    </InputGroupAddon>

                    <InputGroupInput
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Digite a senha"
                      autoComplete="new-password"
                      {...register("password")}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                      >
                        {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* --- Base -------------------------------------------------- */}
            <section className="space-y-6">
              <h3 className="font-medium">Base</h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <Label>Base *</Label>

                  <AppSelect
                    value={watch("baseId")}
                    onValueChange={(value) =>
                      setValue("baseId", value, { shouldValidate: true })
                    }
                    placeholder="Selecione a Base"
                    disabled={!bases || bases?.data.length === 0}
                    emptyMessage="Nenhuma base encontrada."
                    loading={isFetchingBases}
                    items={
                      bases?.data?.map((b) => ({
                        label: b.name,
                        value: b.id,
                      })) || []
                    }
                  />

                  {errors.baseId && (
                    <p className="text-sm text-destructive">
                      {errors.baseId.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* --- Ações -------------------------------------------------- */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/comms/list")}
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
