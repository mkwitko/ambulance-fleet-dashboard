import { PhoneForm } from "@/components/phone-form/phone-form";
import {
  useGetCompanyGroupPhones,
  useCreateCompanyGroupPhoneNumber,
  useDeleteCompanyGroupPhoneNumber,
} from "@/http/generated/company-group/company-group";
import { queryClient } from "@/lib/react-query";

export default function CompanyGroupAdminPhone({
  isEdit,
  id,
}: {
  isEdit: boolean;
  id: string;
}) {
  // Queries Phone
  const { data: companyGroupPhones, queryKey: companyGroupPhonesQueryKey } =
    useGetCompanyGroupPhones(id as string, {
      query: {
        enabled: isEdit,
      },
    });
  const {
    mutateAsync: createPhoneNumbers,
    isPending: creatingPhoneNumbersPending,
  } = useCreateCompanyGroupPhoneNumber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: companyGroupPhonesQueryKey });
      },
    },
  });
  const {
    mutateAsync: deletePhoneNumber,
    isPending: deletingPhoneNumberPending,
  } = useDeleteCompanyGroupPhoneNumber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: companyGroupPhonesQueryKey });
      },
    },
  });
  return (
    <PhoneForm
      title="Telefones do Grupo Empresarial"
      onPhoneCreate={async (phones) => {
        await createPhoneNumbers({
          companyGroupId: id as string,
          data: phones,
        });
      }}
      onPhoneDelete={async (phoneId) => {
        await deletePhoneNumber({
          companyGroupId: id as string,
          phoneId,
        });
      }}
      phones={companyGroupPhones?.data.phones || []}
      creatingPhonePending={creatingPhoneNumbersPending}
      deletingPhonePending={deletingPhoneNumberPending}
      isEdit={isEdit}
      blockedMessage="Para adicionar ou remover telefones, crie o grupo empresarial primeiro."
    />
  );
}
