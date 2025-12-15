import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// API
import { useGetCompanies } from "@/http/generated/company/company";
import { useGetUnits } from "@/http/generated/unit/unit";
import {
  useCreateIntegration,
  useGetIntegrationsId,
  useUpdateIntegration,
} from "@/http/generated/integrations/integrations";

// Components
import { AppSelect } from "@/components/app-select";
import { AppMultiSelect } from "@/components/app-multi-select";
import {
  GetIntegrationsId200DataIntegrationType,
  type CreateIntegrationBody,
  type GetIntegrationsId200Data,
  type UpdateIntegrationBody,
} from "@/http/generated/connectServer.schemas";
import { Role } from "@/@types/roles";
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import { translateIntegrationType } from "@/utils/integrations-types";
import useIntegrationshook from "../integrations-list/hooks/use-integrations";

//
// -----------------------
// Schema
// -----------------------
const integrationSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  url: z.string().min(1, "A URL é obrigatória"),

  login: z.string().optional(),
  password: z.string().optional(),

  tipoVinculo: z.enum(["GROUP", "COMPANY", "UNIT"], {
    message: "Selecione o tipo de vínculo",
  }),

  integrationType: z.enum(GetIntegrationsId200DataIntegrationType),

  companyGroupId: z.string().optional(),
  companiesId: z.array(z.string()).optional(),
  unitsId: z.array(z.string()).optional(),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

//
// -----------------------
// Component
// -----------------------
export default function IntegrationsEdit() {
  const { id } = useParams<string>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  //
  // -----------------------
  // Form
  // -----------------------
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
  });

  const { refetch } = useIntegrationshook();

  //
  // -----------------------
  // Queries
  // -----------------------
  const { data: user } = useGetAuthenticatedUser();
  const isAdmin = hasPermission(user?.data, Role["sys_admin:accessAll"]);
  hasPermission(user?.data, Role["sys_admin:accessAll"]);

  const { data: companies, isFetching: isFetchingCompanies } = useGetCompanies(
    {
      companyGroupId: user?.data.companyGroup?.id,
    },
    {
      query: {
        enabled: !!user && watch("tipoVinculo") !== "GROUP",
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
          watch("tipoVinculo") === "UNIT" &&
          Array.isArray(watch("companiesId")) &&
          (watch("companiesId")?.length ?? 0) > 0,
      },
    }
  );

  const { data: integration } = useGetIntegrationsId(id!, {
    query: { enabled: isEdit },
  });

  const { mutateAsync: createIntegration } = useCreateIntegration({
    mutation: {
      onSuccess: async () => {
        toast.success("Integração criada com sucesso!");
        await refetch();
        navigate("/integrations/list");
      },
    },
  });

  const { mutateAsync: updateIntegration } = useUpdateIntegration({
    mutation: {
      onSuccess: async () => {
        await refetch();
        navigate("/integrations/list");
      },
    },
  });

  //
  // -----------------------
  // Submit
  // -----------------------
  const onSubmit = async (data: IntegrationFormValues) => {
    const payload: CreateIntegrationBody | UpdateIntegrationBody = {
      name: data.name,
      url: data.url,
      login: data.login,
      password: data.password,
      integrationType: data.integrationType,
      companyGroupId: user?.data.companyGroup?.id,
    };

    if (data.tipoVinculo === "COMPANY") {
      payload.companiesId = data.companiesId;
    }
    if (data.tipoVinculo === "UNIT") {
      payload.companiesId = data.companiesId;
      payload.unitsId = data.unitsId;
    }
    if (isEdit) {
      await updateIntegration({
        id: id as string,
        data: payload as UpdateIntegrationBody,
      });
      return;
    }
    await createIntegration({ data: payload as CreateIntegrationBody });
  };

  //
  // -----------------------
  // Preenchimento de edição
  // -----------------------
  useEffect(() => {
    if (!integration || !isEdit) return;

    const integrationData: GetIntegrationsId200Data = integration.data;

    setValue("name", integrationData.name);
    setValue("url", integrationData.url);
    setValue("login", integrationData.login || "");
    setValue("password", integrationData.password || "");
    setValue("integrationType", integrationData.integrationType);

    if (integrationData.companyGroup) {
      setValue("tipoVinculo", "GROUP");
      setValue("companyGroupId", integrationData.companyGroup.id);
    }

    if (integrationData.companies?.length) {
      setValue("tipoVinculo", "COMPANY");
      setValue(
        "companiesId",
        integrationData.companies.map((c) => c.id)
      );
    }

    if (integrationData.units?.length) {
      const companiesId = Array.from(
        new Set(integrationData.units.map((u) => u.companyId))
      );
      setValue("tipoVinculo", "UNIT");
      setValue("companiesId", companiesId);
      setValue(
        "unitsId",
        integrationData.units.map((u) => u.id)
      );
    }
  }, [integration, isEdit]);

  //
  // -----------------------
  // JSX
  // -----------------------
  return (
    <motion.div {...softEnter} className="space-y-8 h-full">
      <Card className="bg-connect">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Editar Integração" : "Nova Integração"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Nome */}
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input placeholder="Digite o nome" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* URL */}
            <div className="grid gap-2">
              <Label>URL *</Label>
              <Input placeholder="Digite a URL" {...register("url")} />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            {/* Login */}
            <div className="grid gap-2">
              <Label>Login</Label>
              <Input placeholder="Digite o Login" {...register("login")} />
              {errors.login && (
                <p className="text-sm text-destructive">
                  {errors.login.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="grid gap-2">
              <Label>Senha *</Label>
              <Input placeholder="Digite a senha" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Integration Type */}
            <div className="grid gap-2">
              <Label>Tipo de Integração *</Label>

              <AppSelect
                value={watch("integrationType")}
                onValueChange={(v: GetIntegrationsId200DataIntegrationType) =>
                  setValue("integrationType", v)
                }
                placeholder="Selecione o tipo"
                items={Object.entries(
                  GetIntegrationsId200DataIntegrationType
                ).map(([k, v]) => ({
                  label: translateIntegrationType(
                    k as GetIntegrationsId200DataIntegrationType
                  ),
                  value: v,
                }))}
              />

              {errors.integrationType && (
                <p className="text-sm text-destructive">
                  {errors.integrationType.message}
                </p>
              )}
            </div>

            {/* Tipo de vínculo */}
            <div className="grid gap-2">
              <Label>Tipo de Vínculo *</Label>

              <AppSelect
                value={watch("tipoVinculo")}
                onValueChange={(v: "GROUP" | "COMPANY" | "UNIT") => {
                  setValue("tipoVinculo", v);
                  setValue("companyGroupId", undefined);
                  setValue("companiesId", []);
                  setValue("unitsId", []);

                  if (v === "GROUP" && !isAdmin) {
                    setValue("companyGroupId", user?.data.companyGroup?.id);
                  }
                }}
                placeholder="Selecione"
                items={[
                  { label: "Grupo Empresarial", value: "GROUP" },
                  { label: "Empresas", value: "COMPANY" },
                  { label: "Unidades", value: "UNIT" },
                ]}
              />

              {errors.tipoVinculo && (
                <p className="text-sm text-destructive">
                  {errors.tipoVinculo.message}
                </p>
              )}
            </div>

            {/* COMPANY */}
            {watch("tipoVinculo") === "COMPANY" && (
              <div className="grid gap-2">
                <Label>Empresas *</Label>
                <AppMultiSelect
                  value={watch("companiesId")}
                  onValueChange={(v) => setValue("companiesId", v)}
                  placeholder="Selecione Empresas"
                  items={
                    companies?.data?.map((c) => ({
                      label: c.name,
                      value: c.id,
                    })) ?? []
                  }
                  loading={isFetchingCompanies}
                />
              </div>
            )}

            {/* UNIT */}
            {watch("tipoVinculo") === "UNIT" && (
              <>
                <div className="grid gap-2">
                  <Label>Empresa *</Label>

                  <AppMultiSelect
                    value={watch("companiesId")}
                    onValueChange={(v) => {
                      setValue("companiesId", v);
                    }}
                    placeholder="Selecione as Empresas"
                    items={
                      companies?.data?.map((c) => ({
                        label: c.name,
                        value: c.id,
                      })) ?? []
                    }
                    loading={isFetchingCompanies}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Unidades *</Label>

                  <AppMultiSelect
                    value={watch("unitsId") || []}
                    onValueChange={(v) => setValue("unitsId", v)}
                    placeholder="Selecione Unidades"
                    items={
                      units?.data?.map((u) => ({
                        label: u.name,
                        value: u.id,
                      })) ?? []
                    }
                    loading={isFetchingUnits}
                  />
                </div>
              </>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/integrations/list")}
              >
                Cancelar
              </Button>

              <Button type="submit" animated isSubmitting={isSubmitting}>
                {isEdit ? "Salvar alterações" : "Criar integração"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
