import { env } from "@/env";
import { useGetPressignedUrl } from "@/http/generated/upload/upload";
import { generateNewFileWithCustomName } from "@/utils/get-file-name";
import axios from "axios";
import type { AmbulanceFormValues } from "../form/ambulance-schema";

export default function useUploadDocuments() {
  const { mutateAsync: getPressignedUrl } = useGetPressignedUrl();
  const handleUploadDocuments = async (
    documents: AmbulanceFormValues["documents"],
    ambulanceId: string
  ) => {
    const documentsData = documents?.filter((d) => {
      return d.content
    });

    if (!documentsData || documentsData?.length === 0) return [];

    const uploadedDocuments = await Promise.all(
      documentsData.map(async (document) => {
        if (!document.file) return document;

        const fileName = generateNewFileWithCustomName(document.file) || "";
        const documentUrl = `${env.VITE_STORAGE_URL}/ambulances/${ambulanceId}/documents/${fileName}`;

        const { pressignedUrl } = await getPressignedUrl({
          data: {
            folder: document.file.type.includes("pdf") ? "document" : "image",
            fileSize: document.file?.size || 0,
            fileType: document.file?.type || "",
            fileName: `ambulances/${ambulanceId}/documents/${fileName}`,
          },
        });
        await axios.put(pressignedUrl, document.file, {
          headers: {
            "Content-Type": document.file?.type,
          },
        });

        const documentToSend = {
          id: document.id,
          title: document.title,
          type: document.type,
          validUntil: document.validUntil,
          content: documentUrl,
        };

        return documentToSend;
      })
    );

    return uploadedDocuments;
  };

  return {
    handleUploadDocuments,
  };
}
