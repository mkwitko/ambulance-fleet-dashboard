import { AppLayout } from "@/pages/protected/_layout";
import { PublicLayout } from "@/pages/public/_layout";
import SignIn from "@/pages/public/sign-in";
import { createBrowserRouter } from "react-router-dom";
import { CompanyGroupRoute } from "./company-group-route";
import { CompaniesRoute } from "./companies-route";
import { UnitsRoute } from "./units-route";
import { BasesRoute } from "./bases-route";
import { UsersRoute } from "./users-route";
import { AmbulancesRoute } from "./ambulances-route";
import { ModulesRoute } from "./modules-route";
import { ChatsRoute } from "./chats-route";
import { AmbulancesControlRoute } from "./ambulances-control-route";
import { RadioRoute } from "./radio-route";
import { CommsRoute } from "./comms-route";
import { IntegrationsRoute } from "./integrations-route";
import { DriversRoute } from "./drivers-route";

export const router = createBrowserRouter([
  {
    path: "/authentication",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <SignIn />,
      },
    ],
  },
  {
    path: "",
    element: <AppLayout />,
    children: [
      ...CompanyGroupRoute,
      ...CompaniesRoute,
      ...UnitsRoute,
      ...BasesRoute,
      ...UsersRoute,
      ...AmbulancesRoute,
      ...ModulesRoute,
      ...ChatsRoute,
      ...AmbulancesControlRoute,
      ...RadioRoute,
      ...IntegrationsRoute,
      ...CommsRoute,
      ...DriversRoute,
    ],
  },
]);
