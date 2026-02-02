import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCreateCompanyGroup,
  useGetCompanyGroup,
  useGetCompanyGroups,
  useUpdateCompanyGroup,
} from "@/http/generated/company-group/company-group";
import { useEffect } from "react";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/react-query";
import { useHookFormMask } from "use-mask-input";
import CompanyGroupAdminPhone from "./components/company-group-admin-phone";
import { toast } from "sonner";

// --- 🔒 Schema de validação ---
const companySchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  document: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "CNPJ inválido")
    .or(z.string().min(14, "CNPJ é obrigatório")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyGroupAdminEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  // Routing
  const navigate = useNavigate();

  // Queries
  const {
    data: companyGroup,
    isFetching: isFetchingCompanyGroup,
    queryKey: companyGroupQueryKey,
  } = useGetCompanyGroup(id as string, {
    query: {
      enabled: isEdit,
    },
  });

  const { queryKey } = useGetCompanyGroups();

  const { mutateAsync: createCompanyGroup } = useCreateCompanyGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: companyGroupQueryKey });
        await queryClient.invalidateQueries({ queryKey });
        toast.success("Grupo empresarial criado com sucesso!");
        navigate("/company-group/admin/");
      },
    },
  });
  const { mutateAsync: updateCompanyGroup } = useUpdateCompanyGroup({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: companyGroupQueryKey });
        await queryClient.invalidateQueries({ queryKey });
        toast.success("Grupo empresarial atualizado com sucesso!");
        navigate("/company-group/admin");
      },
    },
  });

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  // Submit
  const onSubmit = async (data: CompanyFormValues) => {
    if (isEdit) {
      await updateCompanyGroup({
        companyGroupId: companyGroup?.data.id as string,
        data: {
          name: data.name,
          document: data.document,
        },
      });
      return;
    }
    await createCompanyGroup({
      data: {
        name: data.name,
        document: data.document,
      },
    });
  };

  // Effects
  useEffect(() => {
    if (isFetchingCompanyGroup) return;
    if (companyGroup && isEdit) {
      setValue("name", companyGroup.data.name);
      setValue("document", companyGroup.data.document);
    }
  }, [isFetchingCompanyGroup, isEdit]);

  // Mask
  const registerWithMask = useHookFormMask(register);

  return (
    <motion.div {...softEnter} className="space-y-8 h-full">
      <Card className="bg-connect">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Editar Grupo Empresarial" : "Novo Grupo Empresarial"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label>Nome do Grupo Empresarial *</Label>
              <Input placeholder="Digite o nome" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>CNPJ *</Label>
              <Input
                placeholder="00.000.000/0001-00"
                {...registerWithMask("document", "cnpj", {
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

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/company-group/admin")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" animated isSubmitting={isSubmitting}>
                {isEdit ? "Salvar alterações" : "Criar empresa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CompanyGroupAdminPhone isEdit={isEdit} id={id as string} />
    </motion.div>
  );
}
