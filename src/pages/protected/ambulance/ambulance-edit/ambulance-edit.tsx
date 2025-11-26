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
import { useGetAuthenticatedUser } from "@/http/generated/user/user";
import { Role } from "@/@types/roles";
import { useGetCompanyGroups } from "@/http/generated/company-group/company-group";
import { hasPermission } from "@/utils/permissions";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  useCreateAmbulance,
  useCreateAmbulanceDocuments,
  useDeleteAmbulanceDocument,
  useGetAmbulance,
  useUpdateAmbulance,
  useUpdateAmbulanceDocumentsInBulk,
} from "@/http/generated/ambulance/ambulance";
import { useGetBases } from "@/http/generated/base/base";
import { useAmbulanceResolver } from "./form/ambulance-resolver";
import type { AmbulanceFormValues } from "./form/ambulance-schema";
import { DocumentField } from "@/components/document-picker";
import useDocumentsHook from "./hooks/use-documents-hook";
import useUploadDocuments from "./hooks/upload-documents";

export default function AmbulanceEdit() {
  // Params
  const { id } = useParams<string>();
  const isEdit = Boolean(id);

  // Routing
  const navigate = useNavigate();

  const { data: ambulance, isFetching } = useGetAmbulance(id as string, {
    query: {
      enabled: isEdit && !!id,
    },
  });

  const formMethods = useAmbulanceResolver();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = formMethods;

  const {
    documents,
    initialDocuments,
    addDocument,
    removeDocument,
    updateDocument,
  } = useDocumentsHook({ formMethods });

  const { handleUploadDocuments } = useUploadDocuments();

  // Queries
  const { data: user } = useGetAuthenticatedUser();

  const isAdmin = hasPermission(user?.data, Role["sys_admin:accessAll"]);

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
        enabled: !!user && isAdmin ? !!watch("companyGroupId") : true,
      },
    }
  );

  const { data: units, isFetching: isFetchingUnits } = useGetUnits(
    {
      companyId: watch("companyId"),
    },
    {
      query: {
        enabled: !!user && !!watch("companyId"),
      },
    }
  );

  const { data: bases, isFetching: isFetchingBases } = useGetBases(
    {
      unitId: watch("unitId"),
    },
    {
      query: {
        enabled: !!user && !!watch("unitId"),
      },
    }
  );

  const { mutateAsync: createAmbulance } = useCreateAmbulance({
    mutation: {
      onError: (error: any) => {
        toast.error(
          error.response.data.message ||
            "Houve um erro ao criar a ambulância. Tente novamente."
        );
      },
    },
  });

  const { mutateAsync: updateAmbulance } = useUpdateAmbulance({
    mutation: {
      onSuccess: () => {
        toast.success("Ambulância atualizada com sucesso!");
        navigate("/ambulances/list");
      },
    },
  });

  const { mutateAsync: createAmbulanceDocuments } =
    useCreateAmbulanceDocuments();

  const { mutateAsync: updateAmbulanceDocuments } =
    useUpdateAmbulanceDocumentsInBulk();

  const { mutateAsync: deleteAmbulanceDocument } = useDeleteAmbulanceDocument();

  // Submit
  const onSubmit = async (data: AmbulanceFormValues) => {
    if (isEdit) {
      const ambulanceDocuments = ambulance?.data.documents || [];
      const addedDocuments = data.documents?.filter(
        (doc) => !ambulanceDocuments.some((ad) => ad.id === doc.id)
      );
      const removedDocuments = ambulanceDocuments.filter(
        (ad) => !data.documents?.some((doc) => doc.id === ad.id)
      );
      const updatedDocuments =
        data.documents?.filter((doc) => {
          const originalDoc = ambulanceDocuments.find((ad) => ad.id === doc.id);
          return (
            originalDoc &&
            (originalDoc.title !== doc.title ||
              originalDoc.content !== doc.content ||
              originalDoc.validUntil !== doc.validUntil ||
              doc.file)
          );
        }) || [];

      if (addedDocuments && addedDocuments.length > 0) {
        const uploadedDocuments = await handleUploadDocuments(
          addedDocuments,
          ambulance?.data.id as string
        );
        await createAmbulanceDocuments({
          id: ambulance?.data.id as string,
          data: {
            documents: uploadedDocuments,
            baseId: ambulance?.data.base.id as string,
          },
        });
      }

      if (updatedDocuments && updatedDocuments.length > 0) {
        const uploadedDocuments = await handleUploadDocuments(
          updatedDocuments,
          ambulance?.data.id as string
        );
        await updateAmbulanceDocuments({
          data: {
            documents: uploadedDocuments,
            baseId: ambulance?.data.base.id as string,
          },
        });
      }

      if (removedDocuments && removedDocuments.length > 0) {
        await Promise.all(
          removedDocuments.map(async (doc) => {
            await deleteAmbulanceDocument({
              id: doc.id,
              baseId: ambulance?.data.base.id as string,
            });
          })
        );
      }

      await updateAmbulance({
        id: id as string,
        data: {
          name: data.name,
          licensePlate: data.licensePlate,
          ambulanceCode: data.ambulanceCode,
          companyGroupId: data.companyGroupId,
          companyId: data.companyId,
          unitId: data.unitId,
          baseId: data.baseId,
        },
      });

      toast.success("Ambulância atualizada com sucesso!");
      navigate("/ambulances/list");
      return;
    }
    const response = await createAmbulance({
      data: {
        name: data.name,
        licensePlate: data.licensePlate,
        ambulanceCode: data.ambulanceCode,
        companyGroupId: data.companyGroupId,
        companyId: data.companyId,
        unitId: data.unitId,
        baseId: data.baseId,
      },
    });
    const uploadedDocuments = await handleUploadDocuments(
      data.documents,
      response.id
    );
    await createAmbulanceDocuments({
      id: response.id,
      data: {
        documents: uploadedDocuments,
        baseId: response.baseId,
      },
    });
    toast.success("Ambulância criada com sucesso!");
    navigate("/ambulances/list");
  };

  // Effects
  useEffect(() => {
    if (isFetching) return;

    if (isEdit) {
      if (!ambulance?.data) return;

      const docs = ambulance.data.documents.map((d) => ({
        id: d.id,
        type: d.type as "DOCUMENT" | "TEXT" | "CRLV" | "ALVARA",
        title: d.title,
        content: d.content,
        validUntil: d.validUntil,
      }));

      // Garantir CRLV
      const hasCRLV = docs.some((d) => d.type === "CRLV");
      if (!hasCRLV) {
        docs.push({
          id: crypto.randomUUID(),
          type: "CRLV",
          title: "CRLV",
          content: "",
          validUntil: null,
        });
      }

      // Garantir ALVARA
      const hasAlvara = docs.some((d) => d.type === "ALVARA");
      if (!hasAlvara) {
        docs.push({
          id: crypto.randomUUID(),
          type: "ALVARA",
          title: "Alvará",
          content: "",
          validUntil: null,
        });
      }

      reset({
        name: ambulance.data.name,
        licensePlate: ambulance.data.licensePlate,
        ambulanceCode: ambulance.data.ambulanceCode,
        companyGroupId: ambulance.data.companyGroup.id,
        companyId: ambulance.data.company.id,
        unitId: ambulance.data.unit.id,
        baseId: ambulance.data.base.id,
        documents: docs,
      });
    } else {
      setValue(
        "documents",
        initialDocuments().map((doc) => ({
          ...doc,
          type: doc.type as "DOCUMENT" | "TEXT" | "CRLV" | "ALVARA",
        }))
      );
    }
  }, [
    isEdit,
    isFetching,
    isFetchingCompanies,
    isFetchingUnits,
    isFetchingBases,
  ]);

  return (
    <motion.div {...softEnter} className="h-full w-full flex justify-center">
      <Card className="w-full bg-connect">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {isEdit ? "Editar Ambulância" : "Nova Ambulância"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* --- DADOS DA AMBULÂNCIA ------------------------------------- */}
            <section className="space-y-6">
              <h3 className="font-medium">Dados da Ambulância</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nome */}
                <div className="flex flex-col gap-2">
                  <Label>Nome da Ambulância *</Label>
                  <Input placeholder="Digite o nome" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Placa */}
                <div className="flex flex-col gap-2">
                  <Label>Placa *</Label>
                  <Input
                    placeholder="Digite a placa"
                    {...register("licensePlate")}
                    maxLength={8}
                  />
                  {errors.licensePlate && (
                    <p className="text-sm text-destructive">
                      {errors.licensePlate.message}
                    </p>
                  )}
                </div>

                {/* Código da Ambulância */}
                <div className="flex flex-col gap-2">
                  <Label>Código da Ambulância *</Label>
                  <Input
                    placeholder="Código da Ambulância"
                    {...register("ambulanceCode")}
                  />
                  {errors.ambulanceCode && (
                    <p className="text-sm text-destructive">
                      {errors.ambulanceCode.message}
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
                  <AppSelect
                    value={watch("companyId")}
                    onValueChange={(value) =>
                      setValue("companyId", value, { shouldValidate: true })
                    }
                    placeholder="Selecione a Empresa"
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
                  {errors.companyId && (
                    <p className="text-sm text-destructive">
                      {errors.companyId.message}
                    </p>
                  )}
                </div>

                {/* Unidades */}
                <div className="flex flex-col gap-2">
                  <Label>Unidades *</Label>
                  <AppSelect
                    value={watch("unitId")}
                    onValueChange={(value) =>
                      setValue("unitId", value, { shouldValidate: true })
                    }
                    placeholder="Selecione a Unidade"
                    disabled={!units || units.data.length === 0}
                    disabledMessage={
                      !watch("companyId") || watch("companyId")?.length === 0
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
                  {errors.unitId && (
                    <p className="text-sm text-destructive">
                      {errors.unitId.message}
                    </p>
                  )}
                </div>

                {/* Base */}
                <div className="flex flex-col gap-2">
                  <Label>Base *</Label>
                  <AppSelect
                    value={watch("baseId")}
                    onValueChange={(value) =>
                      setValue("baseId", value, { shouldValidate: true })
                    }
                    placeholder="Selecione a Base"
                    disabled={!bases || bases.data.length === 0}
                    disabledMessage={
                      !watch("unitId") || watch("unitId")?.length === 0
                        ? "Selecione a unidade primeiro."
                        : bases?.data.length === 0
                        ? "Nenhuma base disponível."
                        : undefined
                    }
                    items={
                      bases?.data?.map((base) => ({
                        label: base.name,
                        value: base.id,
                      })) || []
                    }
                    loading={isFetchingBases}
                  />
                  {errors.baseId && (
                    <p className="text-sm text-destructive">
                      {errors.baseId.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* --- DOCUMENTOS ------------------------------------- */}
            <section className="space-y-6">
              <h3 className="font-medium">Documentos</h3>

              <DocumentField
                documents={documents}
                addDocument={addDocument}
                removeDocument={removeDocument}
                updateDocument={updateDocument}
                errors={errors.documents}
              />
            </section>

            {/* --- AÇÕES ----------------------------------------------- */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/ambulances/list")}
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
                {isEdit ? "Salvar alterações" : "Criar Ambulância"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
