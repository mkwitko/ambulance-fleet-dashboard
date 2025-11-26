import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { AmbulanceFormValues } from "../form/ambulance-schema";

export default function useDocumentsHook({
  formMethods,
}: {
  formMethods: UseFormReturn<AmbulanceFormValues>;
}) {
  const { watch, setValue } = formMethods;
  const documents = watch("documents") || [];

  // Check if required documents exist
  const hasCRLV = documents.some((doc) => doc.type === "CRLV");
  const hasALVARA = documents.some((doc) => doc.type === "ALVARA");

  const initialDocuments = () => {
    if (!documents || documents.length === 0) {
      return [
        {
          id: crypto.randomUUID(),
          type: "CRLV",
          title: "CRLV",
          content: "",
          validUntil: null,
        },
        {
          id: crypto.randomUUID(),
          type: "ALVARA",
          title: "Alvará",
          content: "",
          validUntil: null,
        },
      ];
    }

    const updatedDocuments = [...documents];

    if (!hasCRLV) {
      updatedDocuments.push({
        id: crypto.randomUUID(),
        type: "CRLV",
        title: "CRLV",
        content: "",
        validUntil: null,
      });
    }

    if (!hasALVARA) {
      updatedDocuments.push({
        id: crypto.randomUUID(),
        type: "ALVARA",
        title: "Alvará",
        content: "",
        validUntil: null,
      });
    }

    return updatedDocuments;
  };

  const addDocument = () => {
    const id = crypto.randomUUID();
    if (documents.length >= 10) {
      toast.error("Máximo de 10 documentos atingido");
      return;
    }
    setValue("documents", [
      ...documents,
      {
        id,
        type: "TEXT",
        title: "",
        content: "",
        validUntil: null,
      },
    ]);
  };

  const removeDocument = (index: number) => {
    const documentToRemove = documents[index];

    // Prevent removal of CRLV and ALVARA documents
    if (
      documentToRemove.type === "CRLV" ||
      documentToRemove.type === "ALVARA"
    ) {
      toast.error(
        `Documento ${
          documentToRemove.type === "CRLV" ? "CRLV" : "Alvará"
        } é obrigatório e não pode ser removido`
      );
      return;
    }

    const updatedDocuments = documents.filter((_, i) => i !== index);
    setValue("documents", updatedDocuments);
  };

  const updateDocument = (
    index: number,
    value: {
      id: string;
      type: "DOCUMENT" | "TEXT" | "CRLV" | "ALVARA";
      content: string;
      title: string;
      validUntil: string | null;
      file?: File | null | undefined;
      exclude?: boolean;
    }
  ) => {
    // If trying to change a CRLV or ALVARA document type to something else
    if (
      (documents[index].type === "CRLV" && value.type !== "CRLV") ||
      (documents[index].type === "ALVARA" && value.type !== "ALVARA")
    ) {
      // Check if there's another document of the same type
      const hasAnother = documents.some(
        (doc, i) => i !== index && doc.type === documents[index].type
      );

      if (!hasAnother) {
        toast.error(
          `Pelo menos um documento ${
            documents[index].type === "CRLV" ? "CRLV" : "Alvará"
          } é obrigatório`
        );
        // Keep the original type
        value.type = documents[index].type;
      }
    }

    const updatedDocuments = [...documents];
    updatedDocuments[index] = value;
    setValue("documents", updatedDocuments);
  };

  return {
    documents,
    initialDocuments,
    addDocument,
    removeDocument,
    updateDocument,
  };
}
