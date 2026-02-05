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
import { toast } from "sonner";
import { AppSelect } from "@/components/app-select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateModule,
  useGetModule,
  useUpdateModule,
} from "@/http/generated/module/module";
import {
  GetModule200DataBillingType,
  type UpdateModuleBodyBillingType,
} from "@/http/generated/connect-server.schemas";
import { Modules } from "@/@types/modules";
import { currencyMask, removeCurrencyMask } from "@/utils/masks";

// --- 🔒 Schema de validação ---
const moduleSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  billingValue: z.string(),
  billingType: z.enum(GetModule200DataBillingType),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

export default function ModulesEdit() {
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
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
  });

  const { data: module, isFetching } = useGetModule(id as string, {
    query: {
      enabled: isEdit && !!id,
    },
  });

  const { mutateAsync: createModule } = useCreateModule({
    mutation: {
      onSuccess: async () => {
        toast.success("Módulo criado com sucesso!");
        navigate("/modules/list");
      },
    },
  });

  const { mutateAsync: updateModule } = useUpdateModule({
    mutation: {
      onSuccess: () => {
        navigate("/modules/list");
      },
    },
  });

  // Submit
  const onSubmit = async (data: ModuleFormValues) => {
    if (isEdit) {
      await updateModule({
        moduleId: id as string,
        data: {
          name: data.name,
          billingValue: parseFloat(removeCurrencyMask(data.billingValue)),
          billingType: data.billingType as UpdateModuleBodyBillingType,
        },
      });
      return;
    }
    await createModule({
      data: {
        name: data.name,
        billingValue: parseFloat(removeCurrencyMask(data.billingValue)),
        billingType: data.billingType as UpdateModuleBodyBillingType,
      },
    });
  };

  // Effects
  useEffect(() => {
    if (isFetching) return;
    if (module?.data && isEdit) {
      setValue("name", module.data?.name);
      setValue(
        "billingValue",
        currencyMask(String(module.data.billingValue * 100)),
      );
      setValue("billingType", module.data.billingType);
    }
  }, [isFetching, isEdit]);

  return (
    <motion.div {...softEnter} className="space-y-8 h-full">
      <Card className="bg-connect">
        <CardHeader>
          <CardTitle>{isEdit ? "Editar Módulo" : "Novo Módulo"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label>Nome do Módulo *</Label>
              <Input placeholder="Digite o nome" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Valor do Módulo *</Label>
              <Input
                placeholder="Digite o valor"
                value={watch("billingValue")}
                onChange={(value) => {
                  const numericValue = value.target.value.replace(
                    /[^\d,.]/g,
                    "",
                  );
                  setValue("billingValue", currencyMask(numericValue));
                }}
              />
              {errors.billingValue && (
                <p className="text-sm text-destructive">
                  {errors.billingValue.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Cobrança *</Label>
              <AppSelect
                value={watch("billingType")}
                onValueChange={(value) => {
                  setValue("billingType", value as Modules);
                }}
                placeholder="Selecione o Tipo de Cobrança"
                items={[
                  {
                    value: "FIXED",
                    label: "Fixo",
                  },
                  {
                    value: "BY_AMBULANCE",
                    label: "Por Ambulância",
                  },
                  {
                    value: "BY_BASE",
                    label: "Por Base",
                  },
                ]}
                emptyMessage="Nenhuma empresa encontrada."
              />
              {errors.billingType && (
                <p className="text-sm text-destructive">
                  {errors.billingType.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/modules/list")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" animated isSubmitting={isSubmitting}>
                {isEdit ? "Salvar alterações" : "Criar Módulo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
