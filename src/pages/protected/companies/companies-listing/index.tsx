import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetCompanies200DataItem,
  GetCompanyModules200,
  GetCompanyModules200DataItem,
} from "@/http/generated/connectServer.schemas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useCompaniesHook from "./hooks/use-companies";
import useCompaniesData from "./data/use-companies-data";
import { useState } from "react";
import {
  useGetCompanyModules,
  useUpdateCompanyModule,
} from "@/http/generated/company/company";
import { queryClient } from "@/lib/react-query";
import { Role } from "@/@types/roles";
import { useGetAuthenticatedUserPermissions } from "@/http/generated/user/user";
import { hasPermission } from "@/utils/permissions";
import CompanyModulesChildren from "./components/company-modules-listing";

export default function CompaniesListing() {
  const { companies, handleDelete } = useCompaniesHook();
  const { columns, actions } = useCompaniesData({ handleDelete });

  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] =
    useState<GetCompanies200DataItem | null>(null);

  const { data: userPermissions } = useGetAuthenticatedUserPermissions();

  const isAdmin = hasPermission(
    userPermissions?.data,
    Role["sys_admin:accessAll"],
    true,
  );

  const { data: companyModules, queryKey } = useGetCompanyModules(
    selectedRow?.id as string,
    {
      query: { enabled: !!selectedRow?.id && isAdmin },
    },
  );

  const { mutateAsync: updateCompanyModule } = useUpdateCompanyModule({
    mutation: {
      onSuccess: async (response) => {
        queryClient.setQueryData(
          queryKey,
          (oldData: GetCompanyModules200 | undefined) => {
            if (!oldData) return oldData;

            const updatedModules = oldData.data.map(
              (module: GetCompanyModules200DataItem) =>
                module.id === response.data.id
                  ? { ...module, ...response.data }
                  : module,
            );

            return {
              ...oldData,
              data: updatedModules,
            };
          },
        );
      },
    },
  });

  return (
    <motion.div {...softEnter}>
      <DataTable<GetCompanies200DataItem>
        title="Empresas"
        data={companies?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={[
          { key: "name", label: "Nome" },
          { key: "document", label: "Documento" },
        ]}
        onNew={() => navigate("new")}
        addingRole={Role["company:create"]}
        getChildren={(row) => {
          setSelectedRow(row);

          if (!companyModules?.data) return null;

          return (
            <CompanyModulesChildren
              modules={companyModules.data}
              onUpdateModule={async (id, data) => {
                await updateCompanyModule({
                  id,
                  data: {
                    customBillingType: data.customBillingType,
                    customBillingValue: data.customBillingValue,
                  },
                });
              }}
              onActiveChange={async (id, active) => {
                await updateCompanyModule({
                  id,
                  data: {
                    active,
                  },
                });
              }}
            />
          );
        }}
        hasChildren={!!isAdmin}
      />
    </motion.div>
  );
}
