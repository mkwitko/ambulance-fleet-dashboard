import BaseEdit from "@/pages/protected/bases/bases-edit/bases-edit";
import BasesListing from "@/pages/protected/bases/bases-listing";

export const BasesRoute = [
  {
    path: "bases/list",
    element: <BasesListing />,
  },
  {
    path: "bases/list/:id",
    element: <BaseEdit />,
  },
  {
    path: "bases/list/new",
    element: <BaseEdit />,
  },
];
