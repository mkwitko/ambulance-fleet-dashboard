import { z } from "zod";

export const phoneSchema = z.object({
  phones: z
    .array(
      z.object({
        id: z.string().optional(),
        number: z
          .string()
          .regex(/^\(?\d{2}\)? ?\d{4,5}\-?\d{4}$/, "Telefone inválido")
          .min(8, "Telefone obrigatório"),
        name: z.string().nullable().optional(),
        isWhatsapp: z.boolean(),
      })
    )
    .optional(),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;
