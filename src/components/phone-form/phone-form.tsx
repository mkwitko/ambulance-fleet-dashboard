import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyPhoneForm from "./components/empty-phone-form";
import { maskPhoneNumber } from "@/utils/masks";
import AlertDialogWrapper from "../dialogs/alert-dialog";

interface PhoneFormProps {
  phones: {
    id: string;
    number: string;
    name: string | null;
    isWhatsapp: boolean;
  }[];
  onPhoneCreate: (
    data: Array<{
      number: string;
      name?: string;
      isWhatsapp?: boolean;
    }>
  ) => Promise<void> | void;
  onPhoneDelete: (phoneId: string) => Promise<void> | void;
  title?: string;
  creatingPhonePending?: boolean;
  deletingPhonePending?: boolean;
}

export function PhoneForm({
  phones,
  onPhoneCreate,
  onPhoneDelete,
  title = "Telefones",
  creatingPhonePending,
  deletingPhonePending,
}: PhoneFormProps) {
  const [phonesState, setPhonesState] = useState(phones);

  useEffect(() => {
    setPhonesState(phones);
  }, [phones]);

  const updateField = (index: number, field: string, value: any) => {
    const updated = [...phonesState];
    updated[index] = { ...updated[index], [field]: value };
    setPhonesState(updated);
  };

  const handleAddPhone = () => {
    const last = phonesState[phonesState.length - 1];
    if (last && (!last.number || last.number.trim() === "")) {
      toast.error("Preencha o telefone anterior antes de adicionar outro.");
      return;
    }

    setPhonesState([
      ...phonesState,
      { id: "", number: "", name: null, isWhatsapp: false },
    ]);
  };

  const handleRemovePhone = async (index: number) => {
    if (phonesState.length === 1) {
      toast.error("É necessário ao menos um telefone.");
      return;
    }

    const item = phonesState[index];

    if (item.id) {
      try {
        await onPhoneDelete(item.id);
        setPhonesState((prev) => prev.filter((_, i) => i !== index));
        toast.success("Telefone removido com sucesso!");
        return;
      } catch {
        toast.error("Erro ao remover telefone do servidor.");
        return;
      }
    }

    // Telefone novo (não salvo)
    setPhonesState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const last = phonesState[phonesState.length - 1];
    if (last && (!last.number || last.number.trim() === "")) {
      toast.error("Preencha o telefone antes de salvar.");
      return;
    }

    const unsaved = phonesState.filter((p) => !p.id);

    try {
      await onPhoneCreate(
        unsaved.map((p) => ({
          number: p.number,
          name: p.name || undefined,
          isWhatsapp: p.isWhatsapp || undefined,
        }))
      );
      toast.success("Telefones salvos com sucesso!");
    } catch {
      toast.error("Erro ao salvar telefones.");
    }
  };

  useEffect(() => {
    console.log(phonesState);
  }, [phonesState]);

  return (
    <Card className="bg-connect">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="popLayout">
          {phonesState.length === 0 ? (
            <EmptyPhoneForm handleAddPhone={handleAddPhone} />
          ) : (
            <div className="space-y-3">
              {phonesState.map((field, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.01 }}
                  className="group"
                >
                  <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_240px_140px_auto] gap-4 items-end p-4 rounded-xl bg-connect card-hover">
                    {/* Número */}
                    <div className="space-y-2 z-10">
                      <Label>Telefone *</Label>
                      <Input
                        placeholder="(11) 91234-5678"
                        value={maskPhoneNumber(field.number)}
                        onChange={(e) =>
                          updateField(
                            index,
                            "number",
                            maskPhoneNumber(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Nome */}
                    <div className="space-y-2">
                      <Label>Rótulo</Label>
                      <Input
                        placeholder="Ex: Comercial"
                        value={field.name || ""}
                        onChange={(e) =>
                          updateField(index, "name", e.target.value)
                        }
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center gap-2 pb-2.5">
                      <Checkbox
                        id={`whatsapp-${index}`}
                        checked={field.isWhatsapp}
                        onCheckedChange={(v) =>
                          updateField(index, "isWhatsapp", !!v)
                        }
                      />
                      <Label
                        htmlFor={`whatsapp-${index}`}
                        className="flex items-center gap-1.5 cursor-pointer select-none text-sm font-medium transition-colors hover:text-green-600"
                      >
                        <MessageCircle className="w-4 h-4 text-primary" />
                        WhatsApp
                      </Label>
                    </div>

                    {/* Remover */}
                    <div className="relative z-10">
                      {field.id && (
                        <AlertDialogWrapper
                          onConfirm={() => {
                            handleRemovePhone(index);
                          }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                            disabled={deletingPhonePending}
                            animated
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogWrapper>
                      )}
                      {!field.id && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                          disabled={deletingPhonePending}
                          animated
                          onClick={() => handleRemovePhone(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {phonesState.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6"
          >
            <Button type="button" variant="ghost" onClick={handleAddPhone}>
              <PlusCircle className="w-4 h-4" />
              Adicionar telefone
            </Button>

            <Button
              animated
              onClick={handleSave}
              isSubmitting={creatingPhonePending || deletingPhonePending}
            >
              Salvar Alterações
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
