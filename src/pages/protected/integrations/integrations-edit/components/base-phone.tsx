// import { PhoneForm } from "@/components/phone-form/phone-form";
// import {
//   useCreateBasePhoneNumber,
//   useDeleteBasePhoneNumber,
//   useGetBasePhones,
// } from "@/http/generated/base/base";
// import { queryClient } from "@/lib/react-query";

// export default function BasePhone({
//   isEdit,
//   id,
// }: {
//   isEdit: boolean;
//   id: string;
// }) {
//   // Queries Phone
//   const { data: basePhones, queryKey: phonesQueryKey } = useGetBasePhones(
//     id as string,
//     {
//       query: {
//         enabled: isEdit,
//       },
//     }
//   );
//   const {
//     mutateAsync: createPhoneNumbers,
//     isPending: creatingPhoneNumbersPending,
//   } = useCreateBasePhoneNumber({
//     mutation: {
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: phonesQueryKey });
//       },
//     },
//   });
//   const {
//     mutateAsync: deletePhoneNumber,
//     isPending: deletingPhoneNumberPending,
//   } = useDeleteBasePhoneNumber({
//     mutation: {
//       onSuccess: () => {
//         queryClient.invalidateQueries({ queryKey: phonesQueryKey });
//       },
//     },
//   });
//   return (
//     <PhoneForm
//       title="Telefones da Base"
//       onPhoneCreate={async (phones) => {
//         await createPhoneNumbers({
//           baseId: id as string,
//           data: phones,
//         });
//       }}
//       onPhoneDelete={async (phoneId) => {
//         await deletePhoneNumber({
//           baseId: id as string,
//           phoneId,
//         });
//       }}
//       phones={basePhones?.data.phones || []}
//       creatingPhonePending={creatingPhoneNumbersPending}
//       deletingPhonePending={deletingPhoneNumberPending}
//       isEdit={isEdit}
//       blockedMessage="Para adicionar ou remover telefones, crie a base primeiro."
//     />
//   );
// }
