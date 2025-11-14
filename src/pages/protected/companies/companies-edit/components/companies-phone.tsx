import { PhoneForm } from "@/components/phone-form/phone-form";
import {
  useCreateCompanyPhoneNumber,
  useDeleteCompanyPhoneNumber,
  useGetCompaniesPhones,
} from "@/http/generated/company/company";
import { queryClient } from "@/lib/react-query";

export default function CompaniesPhone({
  isEdit,
  id,
}: {
  isEdit: boolean;
  id: string;
}) {
  // Queries Phone
  const { data: companyPhones, queryKey: phonesQueryKey } =
    useGetCompaniesPhones(id as string, {
      query: {
        enabled: isEdit,
      },
    });
  const {
    mutateAsync: createPhoneNumbers,
    isPending: creatingPhoneNumbersPending,
  } = useCreateCompanyPhoneNumber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: phonesQueryKey });
      },
    },
  });
  const {
    mutateAsync: deletePhoneNumber,
    isPending: deletingPhoneNumberPending,
  } = useDeleteCompanyPhoneNumber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: phonesQueryKey });
      },
    },
  });
  return (
    <PhoneForm
      title="Telefones da Empresa"
      onPhoneCreate={async (phones) => {
        await createPhoneNumbers({
          companyId: id as string,
          data: phones,
        });
      }}
      onPhoneDelete={async (phoneId) => {
        await deletePhoneNumber({
          companyId: id as string,
          phoneId,
        });
      }}
      phones={companyPhones?.data.phones || []}
      creatingPhonePending={creatingPhoneNumbersPending}
      deletingPhonePending={deletingPhoneNumberPending}
      isEdit={isEdit}
      blockedMessage="Para adicionar ou remover telefones, crie o grupo empresarial primeiro."
    />
  );
}
