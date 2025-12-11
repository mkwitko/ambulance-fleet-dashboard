import UsersCommsEdit from "@/pages/protected/comms/comms-edit/comms-edit";
import CommsListing from "@/pages/protected/comms/comms-listing";

export const CommsRoute = [
  {
    path: "comms/list",
    element: <CommsListing />,
  },
  {
    path: "comms/list/:id",
    element: <UsersCommsEdit />,
  },
  {
    path: "comms/list/new",
    element: <UsersCommsEdit />,
  },
];
