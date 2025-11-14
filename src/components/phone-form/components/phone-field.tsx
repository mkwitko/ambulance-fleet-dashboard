import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Trash2 } from "lucide-react";
import ErrorText from "../../ui/error-text";
import {
  type UseFormRegister,
  type Control,
  type FieldErrors,
  Controller,
} from "react-hook-form";
import type { PhoneFormValues } from "../phone-form";

export interface PhoneFieldProps {
  field: { id?: string };
  index: number;
  register: UseFormRegister<PhoneFormValues>;
  registerWithMask: ReturnType<any>;
  control: Control<PhoneFormValues>;
  errors: FieldErrors<PhoneFormValues>;
  onRemove: () => void;
}

export default function PhoneField({
  field,
  index,
  register,
  registerWithMask,
  control,
  errors,
  onRemove,
}: PhoneFieldProps) {
  return (
    <motion.div
      key={field.id ?? index}
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_240px_140px_auto] gap-4 items-end p-4 rounded-xl bg-connect card-hover">
        {/* Telefone */}
        <div className="space-y-2">
          <Label>Telefone *</Label>
          <Input
            placeholder="(11) 91234-5678"
            {...registerWithMask(`phones.${index}.number`, ["99 99999-9999"], {
              showMaskOnFocus: false,
              showMaskOnHover: false,
              autoUnmask: true,
            })}
          />

          <AnimatePresence>
            {errors.phones?.[index]?.number && (
              <ErrorText message={errors.phones[index]?.number?.message} />
            )}
          </AnimatePresence>
        </div>

        {/* Nome */}
        <div className="grid gap-2">
          <Label>Rótulo</Label>
          <Input
            placeholder="Ex: Comercial"
            {...register(`phones.${index}.name`)}
          />
        </div>

        {/* WhatsApp */}
        <div className="flex items-center gap-2 pb-2.5">
          <Controller
            control={control}
            name={`phones.${index}.isWhatsapp`}
            render={({ field }) => (
              <Checkbox
                id={`whatsapp-${index}`}
                checked={field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
              />
            )}
          />
          <Label
            htmlFor={`whatsapp-${index}`}
            className="flex items-center gap-1.5 cursor-pointer select-none text-sm font-medium hover:text-green-600"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            WhatsApp
          </Label>
        </div>

        {/* Remover */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          animated
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
