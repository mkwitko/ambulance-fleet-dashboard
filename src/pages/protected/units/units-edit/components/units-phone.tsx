import { PhoneForm } from "@/components/phone-form/phone-form";
import {
  useCreateUnitPhoneNumber,
  useDeleteUnitPhoneNumber,
  useGetUnitsPhones,
} from "@/http/generated/unit/unit";
import { queryClient } from "@/lib/react-query";

export default function UnitsPhone({
  isEdit,
  id,
}: {
  isEdit: boolean;
  id: string;
}) {
  // Queries Phone
  const { data: unitPhones, queryKey: phonesQueryKey } = useGetUnitsPhones(
    id as string,
    {
      query: {
        enabled: isEdit,
      },
    }
  );
  const {
    mutateAsync: createPhoneNumbers,
    isPending: creatingPhoneNumbersPending,
  } = useCreateUnitPhoneNumber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: phonesQueryKey });
      },
    },
  });
  const {
    mutateAsync: deletePhoneNumber,
    isPending: deletingPhoneNumberPending,
  } = useDeleteUnitPhoneNumber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: phonesQueryKey });
      },
    },
  });
  return (
    <PhoneForm
      title="Telefones da Unidade"
      onPhoneCreate={async (phones) => {
        await createPhoneNumbers({
          unitId: id as string,
          data: phones,
        });
      }}
      onPhoneDelete={async (phoneId) => {
        await deletePhoneNumber({
          unitId: id as string,
          phoneId,
        });
      }}
      phones={unitPhones?.data.phones || []}
      creatingPhonePending={creatingPhoneNumbersPending}
      deletingPhonePending={deletingPhoneNumberPending}
      isEdit={isEdit}
      blockedMessage="Para adicionar ou remover telefones, crie a unidade primeiro."
    />
  );
}
