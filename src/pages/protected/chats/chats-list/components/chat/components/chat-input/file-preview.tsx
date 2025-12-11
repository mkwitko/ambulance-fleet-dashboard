import { motion } from "framer-motion";
import { Send, X, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GetChatMessages200DataItemMessageType } from "@/http/generated/connectServer.schemas";
import type { FilePreviewType } from "../../../../types/chat.types";

interface FilePreviewProps {
  filePreview: FilePreviewType;
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const isImageFile = (filename: string) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

const isPdfFile = (filename: string) => /\.pdf$/i.test(filename);

export function FilePreview({
  filePreview,
  message,
  onMessageChange,
  onSend,
  onCancel,
  isLoading,
}: FilePreviewProps) {
  const fileName = filePreview.file?.name || filePreview.url || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-input/70 rounded-xl"
    >
      {/* === LOADING OVERLAY === */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {/* === PREVIEW DE IMAGEM === */}
          {filePreview.type === GetChatMessages200DataItemMessageType.IMAGE &&
            isImageFile(fileName) && (
              <img
                src={filePreview.url}
                alt="Preview"
                className="rounded-lg max-h-48 object-contain"
              />
            )}

          {/* === PREVIEW DE VÍDEO === */}
          {filePreview.type === GetChatMessages200DataItemMessageType.VIDEO && (
            <video
              src={filePreview.url}
              className="rounded-lg max-h-48"
              controls
            />
          )}

          {/* === PREVIEW DE DOCUMENTO === */}
          {filePreview.type ===
            GetChatMessages200DataItemMessageType.DOCUMENT && (
            <div className="rounded-lg border p-3 bg-muted/40">
              {/* Se for imagem dentro do DOCUMENT */}
              {isImageFile(fileName) ? (
                <img
                  src={filePreview.url}
                  alt="Preview"
                  className="rounded-lg max-h-48 object-contain"
                />
              ) : isPdfFile(fileName) ? (
                <iframe
                  src={filePreview.url}
                  className="w-full h-48 rounded-lg border"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Preview não disponível
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => window.open(filePreview.url, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir documento
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* === LEGENDA === */}
          <Input
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Adicione uma legenda (opcional)..."
            className="my-3"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="hover:bg-accent rounded-xl"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* === BOTÕES === */}
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button animated onClick={onSend}>
          <Send className="w-4 h-4 mr-2" /> Enviar
        </Button>
      </div>
    </motion.div>
  );
}
