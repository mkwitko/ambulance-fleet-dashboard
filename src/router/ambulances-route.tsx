import AmbulanceEdit from "@/pages/protected/ambulance/ambulance-edit/ambulance-edit";
import AmbulanceListing from "@/pages/protected/ambulance/ambulance-listing";

export const AmbulancesRoute = [
  {
    path: "ambulances/list",
    element: <AmbulanceListing />,
  },
  {
    path: "ambulances/list/:id",
    element: <AmbulanceEdit />,
  },
  {
    path: "ambulances/list/new",
    element: <AmbulanceEdit />,
  },
];
