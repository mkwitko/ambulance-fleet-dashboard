import IntegrationsEdit from "@/pages/protected/integrations/integrations-edit/integrations-edit";
import IntegrationsListing from "@/pages/protected/integrations/integrations-list";

export const IntegrationsRoute = [
  {
    path: "integrations/list",
    element: <IntegrationsListing />,
  },
  {
    path: "integrations/list/:id",
    element: <IntegrationsEdit />,
  },
  {
    path: "integrations/list/new",
    element: <IntegrationsEdit />,
  },
];
