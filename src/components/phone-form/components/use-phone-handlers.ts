import { toast } from "sonner";
import type { PhoneFormValues } from "./phone-schema";

export interface UsePhoneHandlersParams {
  phones: PhoneFormValues["phones"];
  append: (value: NonNullable<PhoneFormValues["phones"]>[number]) => void;
  remove: (index: number) => void;
  onDeletePhone?: (id: string) => Promise<void> | void;
}

export interface UsePhoneHandlersReturn {
  handleAddPhone: () => void;
  handleRemovePhone: (index: number) => Promise<void>;
  handleSave: (
    values: PhoneFormValues,
    onSubmit: (values: PhoneFormValues) => Promise<void> | void
  ) => Promise<void>;
}

export function usePhoneHandlers({
  phones,
  append,
  remove,
  onDeletePhone,
}: UsePhoneHandlersParams): UsePhoneHandlersReturn {
  const handleAddPhone = () => {
    const last = phones?.[phones.length - 1];
    if (last && (!last.number || last.number.trim() === "")) {
      toast.error("Preencha o telefone anterior antes de adicionar outro.");
      return;
    }

    append({
      id: undefined,
      number: "",
      name: "",
      isWhatsapp: false,
    });
  };

  const handleRemovePhone = async (index: number) => {
    if (!phones || phones.length === 1) {
      toast.error("É necessário ao menos um telefone.");
      return;
    }

    const item = phones[index];

    // telefone salvo
    if (item?.id && onDeletePhone) {
      try {
        await onDeletePhone(item.id);
        remove(index);
        toast.success("Telefone removido com sucesso!");
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover telefone do servidor.");
      }
      return;
    }

    // telefone novo
    remove(index);
  };

  const handleSave = async (
    values: PhoneFormValues,
    onSubmit: (values: PhoneFormValues) => Promise<void> | void
  ) => {
    await onSubmit(values);
    toast.success("Telefones salvos com sucesso!");
  };

  return { handleAddPhone, handleRemovePhone, handleSave };
}
