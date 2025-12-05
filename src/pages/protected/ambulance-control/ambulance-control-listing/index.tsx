import { motion } from "framer-motion";
import { softEnter } from "@/components/motion/soft-enter";
import { Maximize } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useUsersData from "./data/use-ambulance-control-data";
import useAmbulanceHook from "./hooks/use-ambulance-control";
import useFilteringScopeHook from "@/hooks/use-filtering-scope-hook";
import useAbly from "@/hooks/use-ably";
import { AblyEvents } from "@/@types/ably-events";
import { realTimeUpdateAmbulanceStatus } from "./hooks/realtime/use-update-ambulance-status";
import { realTimeUpdateAmbulanceShift } from "./hooks/realtime/use-update-ambulance-shift";
import { queryClient } from "@/lib/react-query";
import { useState } from "react";
import { AmbulanceControlRender } from "./components/mbulance-control-render";
import { Button } from "@/components/ui/button";

export default function AmbulanceControlListing() {
  const filteringScopeHook = useFilteringScopeHook();

  const { ambulances, queryKey } = useAmbulanceHook({ filteringScopeHook });

  const { columns } = useUsersData();

  useAbly({
    events: [AblyEvents.status, AblyEvents.shiftStatus],
    handleMessageReceived: (message) => {
      queryClient.setQueryData(queryKey, (oldData) => {
        if (message.name === AblyEvents.status) {
          return realTimeUpdateAmbulanceStatus({
            incomingMessage: message,
            oldData,
          });
        }
        if (message.name === AblyEvents.shiftStatus) {
          return realTimeUpdateAmbulanceShift({
            incomingMessage: message,
            oldData,
          });
        }
      });
    },
  });

  const [openFullscreen, setOpenFullscreen] = useState(false);

  const ambulanceData = ambulances?.data ?? [];

  return (
    <motion.div {...softEnter} className="space-y-6">
      <AmbulanceControlRender
        ambulances={ambulanceData}
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
      />

      <Dialog open={openFullscreen} onOpenChange={setOpenFullscreen}>
        <DialogContent className="min-w-screen min-h-screen w-full h-full p-0">
          <div className="w-full h-full bg-linear-to-t from-primary/25 via-primary/10 to-primary/25 pt-12">
            <div className="mx-auto max-w-8xl w-[95%]">
              <AmbulanceControlRender
                ambulances={ambulanceData}
                columns={columns}
                filteringScopeHook={filteringScopeHook}
                height="520px"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
