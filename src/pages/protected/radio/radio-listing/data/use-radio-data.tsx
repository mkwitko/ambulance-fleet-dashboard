import type {
  Action,
  Column,
} from "@/components/ui/data-table/data-table-types";
import type { GetAmbulances200DataItem } from "@/http/generated/connectServer.schemas";
import {
  useAddRadioParticipant,
  useCreateRadioMeeting,
} from "@/http/generated/radio/radio";
import { Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function useRadioData() {
  const navigate = useNavigate();
  const columns: Column<GetAmbulances200DataItem>[] = [
    { key: "name", label: "Nome", search: true },
  ];

  const { mutateAsync: createRadioMeeting } = useCreateRadioMeeting();
  const { mutateAsync: addRadioParticipant } = useAddRadioParticipant();

  const actions: Action<GetAmbulances200DataItem>[] = [
    {
      label: "Ligar",
      onClick: (r: GetAmbulances200DataItem) => navigate(r.id),
      icon: (
        <Radio className="h-4 w-4 text-primary group-hover:text-primary transition-colors" />
      ),
    },
  ];

  return {
    columns,
    actions,
  };
}
