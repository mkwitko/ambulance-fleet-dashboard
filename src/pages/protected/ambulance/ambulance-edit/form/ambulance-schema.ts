import z from "zod";

// --- 🔒 Schema de validação ---
export const ambulanceSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  licensePlate: z
    .string({
      message: "A placa é obrigatória",
    })
    .min(7, "Minimo de 7 caracteres para a placa")
    .max(8, "Máximo de 8 caracteres para a placa"),
  ambulanceCode: z.string().min(1, "O código da ambulância é obrigatório"),
  companyId: z.string().min(1, "A empresa é obrigatória"),
  unitId: z.string().min(1, "A unidade é obrigatória"),
  baseId: z.string().min(1, "A base é obrigatória"),
  documents: z
    .array(
      z.object({
        id: z.string(),
        exclude: z.boolean().optional(),
        title: z.string(),
        type: z.enum(["DOCUMENT", "TEXT", "CRLV", "ALVARA"], {
          message: "Tipo de documento deve ser documento ou texto",
        }),
        content: z
          .string()
          .max(
            10000,
            "Conteúdo do documento muito longo (máximo 10.000 caracteres)"
          ),
        validUntil: z
          .string({
            message: "Data de validade inválida",
          })
          .nullable(),
        file: z
          .instanceof(File)
          .optional()
          .refine(
            (file) => !file || file.size <= 10 * 1024 * 1024,
            "O arquivo deve ter no máximo 10MB"
          )
          .refine(
            (file) =>
              !file ||
              ["image/jpeg", "image/png", "application/pdf"].includes(
                file.type
              ),
            "O arquivo deve ser uma imagem PNG ou JPG ou um PDF"
          )
          .nullable(),
      })
    )
    .max(10, "Máximo de 10 documentos")
    .refine(
      (documents) => {
        if (!documents) return true;

        return documents.every((doc) => {
          // If document is not CRLV or ALVARA, it's always valid
          if (doc.type !== "CRLV" && doc.type !== "ALVARA") return true;

          // If document is excluded, it's valid
          if (doc.exclude) return true;

          // Check if the document has meaningful content
          const hasContent = doc.content.trim().length > 0;
          const hasFile = doc.file !== null && doc.file !== undefined;
          const hasValidUntil = doc.validUntil !== null;

          // Require at least some information
          if (hasContent || hasFile || hasValidUntil) {
            // Check if validUntil is a valid date if provided
            if (doc.validUntil) {
              const validDate = new Date(doc.validUntil);
              // Validate that it's a valid date
              return !isNaN(validDate.getTime());
            }
          }

          return true;
        });
      },
      {
        message:
          "Documentos CRLV e ALVARA precisam ter uma data de validade válida quando informações são preenchidas",
      }
    )
    .optional(),
});

export type AmbulanceFormValues = z.infer<typeof ambulanceSchema>;
