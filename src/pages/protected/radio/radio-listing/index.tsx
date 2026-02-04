import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  GetAmbulances200DataItem,
  GetAmbulances200Pagination,
} from "@/http/generated/connectServer.schemas";
import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import useRadioHook from "./hooks/use-radio";
import useRadioData from "./data/use-radio-data";

export default function RadioListing() {
  const { ambulances, setPage, setPerPage } = useRadioHook();

  const { columns } = useRadioData();

  return (
    <motion.div {...softEnter}>
      <DataTable<GetAmbulances200DataItem, GetAmbulances200Pagination>
        title="Rádio"
        data={ambulances?.data || []}
        pagination={ambulances?.pagination}
        columns={columns}
        searchableKeys={columns.filter((c) => c.search)}
        onPageChange={(page) => setPage(page)}
        onPerPageChange={(perPage) => {
          setPerPage(perPage);
          setPage(1);
        }}
      />
    </motion.div>
  );
}
