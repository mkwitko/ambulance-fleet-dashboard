import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { softEnter } from "@/components/motion/soft-enter";
import { motion } from "framer-motion";
import { useHookFormMask } from "use-mask-input";
import { toast } from "sonner";
import {
  useCreateCompany,
  useGetCompanies,
  useGetCompany,
  useUpdateCompany,
} from "@/http/generated/company/company";
import CompaniesPhone from "./components/companies-phone";
import { useGetAuthenticatedUserAssociations } from "@/http/generated/user/user";
import { queryClient } from "@/lib/react-query";

// --- 🔒 Schema de validação ---
const companySchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  document: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, "CNPJ inválido")
    .or(z.string().min(14, "CNPJ é obrigatório")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);
  const { data: user } = useGetAuthenticatedUserAssociations({
    query: {
      enabled: !isEdit,
    },
  });

  // Routing
  const navigate = useNavigate();

  // Queries
  const {
    data: company,
    isFetching: isFetchingCompany,
    queryKey: getCompanyByIdQueryKey,
  } = useGetCompany(id as string, {
    query: {
      enabled: isEdit,
    },
  });
  const { queryKey: getCompaniesQueryKey } = useGetCompanies();

  const { mutateAsync: createCompany } = useCreateCompany({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getCompaniesQueryKey });
        toast.success("Empresa criado com sucesso!");
        navigate("/companies/list");
      },
    },
  });
  const { mutateAsync: updateCompany } = useUpdateCompany({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getCompaniesQueryKey });
        await queryClient.invalidateQueries({
          queryKey: getCompanyByIdQueryKey,
        });

        toast.success("Empresa atualizada com sucesso!");
        navigate("/companies/list");
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
      await updateCompany({
        companyId: company?.data.id as string,
        data: {
          name: data.name,
          document: data.document,
        },
      });
      return;
    }
    await createCompany({
      data: {
        name: data.name,
        document: data.document,
        companyGroupId: user?.data.companyGroup?.id as string,
      },
    });
  };

  // Effects
  useEffect(() => {
    if (isFetchingCompany) return;
    if (company && isEdit) {
      setValue("name", company.data.name);
      setValue("document", company.data.document);
    }
  }, [isFetchingCompany, isEdit]);

  // Mask
  const registerWithMask = useHookFormMask(register);

  return (
    <motion.div {...softEnter} className="space-y-8 h-full">
      <Card className="bg-connect">
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Empresa" : "Nova Empresa"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label>Nome da Empresa *</Label>
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
                onClick={() => navigate("/companies/list")}
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

      <CompaniesPhone isEdit={isEdit} id={id as string} />
    </motion.div>
  );
}
