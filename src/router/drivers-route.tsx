import DriversEdit from "@/pages/protected/drivers/drivers-edit/drivers-edit";
import DriversListing from "@/pages/protected/drivers/drivers-listing";

export const DriversRoute = [
  {
    path: "drivers/list",
    element: <DriversListing />,
  },
  {
    path: "drivers/list/:id",
    element: <DriversEdit />,
  },
  {
    path: "drivers/list/new",
    element: <DriversEdit />,
  },
];
