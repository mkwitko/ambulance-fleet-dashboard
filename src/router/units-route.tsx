import UnitEdit from "@/pages/protected/units/units-edit/units-edit";
import UnitsListing from "@/pages/protected/units/units-listing";

export const UnitsRoute = [
  {
    path: "units/list",
    element: <UnitsListing />,
  },
  {
    path: "units/list/:id",
    element: <UnitEdit />,
  },
  {
    path: "units/list/new",
    element: <UnitEdit />,
  },
];
