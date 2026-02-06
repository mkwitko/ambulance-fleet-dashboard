import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import { Maximize } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useUsersData from "./data/use-ambulance-control-data";
import useAmbulanceHook from "./hooks/use-ambulance-control";
import useFilteringScopeHook from "@/hooks/use-filtering-scope-hook";
import { useState } from "react";
import { AmbulanceControlRender } from "./components/mbulance-control-render";
import { Button } from "@/components/ui/button";
import type { GetAmbulancesControl200Pagination } from "@/http/generated/connect-server.schemas";

export default function AmbulanceControlListing() {
  const filteringScopeHook = useFilteringScopeHook();

  const { ambulances, setPage, setPerPage } = useAmbulanceHook({
    filteringScopeHook,
  });

  const { columns } = useUsersData();

  const [openFullscreen, setOpenFullscreen] = useState(false);

  const ambulanceData = ambulances?.data ?? [];
  const pagination =
    ambulances?.pagination as GetAmbulancesControl200Pagination;

  return (
    <motion.div {...softEnter} className="space-y-6">
      <AmbulanceControlRender
        ambulances={ambulanceData}
        pagination={pagination}
        columns={columns}
        filteringScopeHook={filteringScopeHook}
        height="500px"
        headerActions={
          <Button
            variant="outline"
            onClick={() => setOpenFullscreen(true)}
            animated
          >
            <Maximize className="w-5 h-5" />
          </Button>
        }
        setPage={setPage}
        setPerPage={setPerPage}
      />

      <Dialog open={openFullscreen} onOpenChange={setOpenFullscreen}>
        <DialogContent className="min-w-screen min-h-screen w-full h-full p-0">
          <div className="w-full h-full bg-linear-to-t from-primary/25 via-primary/10 to-primary/25 pt-12">
            <div className="mx-auto max-w-8xl w-[95%]">
              <AmbulanceControlRender
                ambulances={ambulanceData}
                pagination={pagination}
                columns={columns}
                filteringScopeHook={filteringScopeHook}
                height="520px"
                setPage={setPage}
                setPerPage={setPerPage}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
