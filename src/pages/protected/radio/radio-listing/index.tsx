import { DataTable } from "@/components/ui/data-table/data-table";
import type { GetAmbulances200DataItem } from "@/http/generated/connectServer.schemas";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useRadioHook from "./hooks/use-ambulance";
import useRadioData from "./data/use-radio-data";

export default function RadioListing() {
  const { ambulances } = useRadioHook();

  const { columns, actions } = useRadioData();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetAmbulances200DataItem>
        title="Rádio"
        data={ambulances?.data || []}
        columns={columns}
        actions={actions}
        searchableKeys={columns.filter((c) => c.search)}
      />
    </motion.div>
  );
}
