import ModulesEdit from "@/pages/protected/modules/modules-edit/modules-edit";
import ModulesListing from "@/pages/protected/modules/modules-listing";

export const ModulesRoute = [
  {
    path: "modules/list",
    element: <ModulesListing />,
  },
  {
    path: "modules/list/:id",
    element: <ModulesEdit />,
  },
  {
    path: "modules/list/new",
    element: <ModulesEdit />,
  },
];
