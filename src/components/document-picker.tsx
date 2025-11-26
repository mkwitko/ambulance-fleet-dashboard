import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  X,
  FileText,
  ExternalLink,
  CalendarDays,
  Eye,
  Trash2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";

export function DocumentField({
  documents,
  addDocument,
  removeDocument,
  updateDocument,
  errors,
}: {
  documents: {
    id: string;
    type: "DOCUMENT" | "TEXT" | "CRLV" | "ALVARA";
    title: string;
    content: string;
    validUntil: string | null;
    exclude?: boolean | undefined;
    file?: File | null | undefined;
  }[];
  addDocument: () => void;
  removeDocument: (index: number) => void;
  updateDocument: (
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
  ) => void;
  errors: any;
}) {
  const [dragActive, setDragActive] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [datePickerOpen, setDatePickerOpen] = useState<number | null>(null);

  const handleDrag = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(index);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0], index);
    }
  };

  const handleFileChange = (file: File, index: number) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }
    updateDocument(index, {
      ...documents[index],
      file: file,
      content: URL.createObjectURL(file),
    });
  };

  const handleRemoveFile = (index: number) => {
    const doc = documents[index];
    if (doc.content && doc.content.startsWith("blob:")) {
      URL.revokeObjectURL(doc.content);
    }
    updateDocument(index, {
      ...doc,
      file: undefined,
      content: "",
    });
  };

  const handlePreview = (index: number) => {
    const doc = documents[index];
    if (doc.content) {
      setPreviewUrl(doc.content);
      setPreviewIndex(index);
      setPreviewOpen(true);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlPath = new URL(url).pathname;
      return urlPath.split("/").pop() || "documento.pdf";
    } catch {
      return "documento.pdf";
    }
  };

  const isImageFile = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  const isPdfFile = (filename: string) => {
    return /\.pdf$/i.test(filename);
  };

  const getExpirationStatus = (validUntil: string | null) => {
    if (!validUntil) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse a data em UTC para evitar problemas de timezone
    const [year, month, day] = validUntil.split("-").map(Number);
    const expirationDate = new Date(year, month - 1, day);
    expirationDate.setHours(0, 0, 0, 0);

    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "expired",
        label: "Expirado",
        variant: "destructive" as const,
        icon: AlertCircle,
      };
    } else if (diffDays <= 30) {
      return {
        status: "expiring-soon",
        label: `Expira em ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`,
        variant: "warning" as const,
        icon: AlertTriangle,
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {documents.map((doc, index) => {
        if (doc.exclude) return null;
        const selectedDate = doc.validUntil
          ? new Date(doc.validUntil)
          : undefined;
        const hasFile = doc.content && doc.content.length > 0;
        const docErrors = errors?.[index];
        const expirationStatus = getExpirationStatus(doc.validUntil);

        return (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">
                  {doc.title || `Documento ${index + 1}`}
                </h4>
                {expirationStatus && (
                  <Badge
                    variant={expirationStatus.variant}
                    className="flex items-center gap-1"
                  >
                    <expirationStatus.icon className="h-3 w-3" />
                    {expirationStatus.label}
                  </Badge>
                )}
              </div>
              {documents.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeDocument(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Título do Documento *</Label>
                <Input
                  placeholder="Ex: CNH, RG, Certificado..."
                  value={doc.title}
                  onChange={(e) =>
                    updateDocument(index, {
                      ...doc,
                      title: e.target.value,
                    })
                  }
                />
                {docErrors?.title && (
                  <p className="text-sm text-destructive">{docErrors.title}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Data de Validade</Label>
                <Popover
                  open={datePickerOpen === index}
                  onOpenChange={(open) =>
                    setDatePickerOpen(open ? index : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start border-input",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        formatInTimeZone(
                          selectedDate,
                          "UTC",
                          "dd 'de' MMMM 'de' yyyy",
                          { locale: ptBR }
                        )
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          updateDocument(index, {
                            ...doc,
                            validUntil: format(date, "yyyy-MM-dd"),
                          });
                          setDatePickerOpen(null);
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {docErrors?.validUntil && (
                  <p className="text-sm text-destructive">
                    {docErrors.validUntil}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Arquivo *</Label>
              {!hasFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    dragActive === index
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={(e) => handleDrag(e, index)}
                  onDragLeave={(e) => handleDrag(e, index)}
                  onDragOver={(e) => handleDrag(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() =>
                    document.getElementById(`file-${index}`)?.click()
                  }
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Clique para selecionar ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG (Máx. 10MB)
                  </p>
                  <input
                    id={`file-${index}`}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file, index);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file ? (
                        `${(doc.file.size / 1024 / 1024).toFixed(2)} MB`
                      ) : (
                        <span className="text-primary">Arquivo já enviado</span>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(index)}
                    className="shrink-0"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!doc.file && doc.content && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.content, "_blank")}
                      className="shrink-0"
                      title="Abrir em nova aba"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="shrink-0"
                    title="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {docErrors?.content && (
                <p className="text-sm text-destructive">{docErrors.content}</p>
              )}
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        onClick={addDocument}
        variant="outline"
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        Adicionar Documento
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {documents[previewIndex]?.file?.name ||
                getFileNameFromUrl(documents[previewIndex]?.content || "")}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-100px)]">
            {previewUrl && (
              <>
                {isImageFile(
                  documents[previewIndex]?.file?.name ||
                    documents[previewIndex]?.content ||
                    ""
                ) ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-lg"
                  />
                ) : isPdfFile(
                    documents[previewIndex]?.file?.name ||
                      documents[previewIndex]?.content ||
                      ""
                  ) ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] rounded-lg"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Preview não disponível para este tipo de arquivo
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        if (documents[previewIndex]?.content) {
                          window.open(
                            documents[previewIndex].content,
                            "_blank"
                          );
                        }
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir em nova aba
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
