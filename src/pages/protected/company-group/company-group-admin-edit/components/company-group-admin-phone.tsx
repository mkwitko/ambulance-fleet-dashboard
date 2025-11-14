import { PhoneForm } from "@/components/phone-form/phone-form";
import {
  useGetCompanyGroupPhones,
  useCreateCompanyGroupPhoneNumber,
} from "@/http/generated/company-group/company-group";
import { useDeleteCompanyPhoneNumber } from "@/http/generated/company/company";
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
  } = useDeleteCompanyPhoneNumber({
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
          companyId: id as string,
          phoneId,
        });
      }}
      phones={companyGroupPhones?.data.phones || []}
      creatingPhonePending={creatingPhoneNumbersPending}
      deletingPhonePending={deletingPhoneNumberPending}
    />
  );
}
