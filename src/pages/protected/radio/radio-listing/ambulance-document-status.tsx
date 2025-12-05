import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function AmbulanceDocumentStatus({
  validUntil,
}: {
  validUntil?: string | null;
}) {
  let color = "bg-red-500";
  let label = "Documento não enviado";

  if (validUntil) {
    const today = new Date();
    const expires = new Date(validUntil);
    const diff = expires.getTime() - today.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 0) {
      color = "bg-red-500";
      label = `Expirado em ${expires.toLocaleDateString()}`;
    } else if (days <= 30) {
      color = "bg-yellow-500";
      label = `Expira em ${Math.ceil(
        days
      )} dias (${expires.toLocaleDateString()})`;
    } else {
      color = "bg-green-500";
      label = `Válido até ${expires.toLocaleDateString()}`;
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={`w-4 h-4 rounded-full ${color}`} />
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default AmbulanceDocumentStatus;
