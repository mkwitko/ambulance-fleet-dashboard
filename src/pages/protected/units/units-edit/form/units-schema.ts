import z from "zod";

// --- 🔒 Schema de validação ---
export const unitSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  companyId: z.string().min(1, "A empresa é obrigatória"),
});

export type UnitFormValues = z.infer<typeof unitSchema>;