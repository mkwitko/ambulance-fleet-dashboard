import { AppLayout } from "@/pages/protected/_layout";
import { PublicLayout } from "@/pages/public/_layout";
import SignIn from "@/pages/public/sign-in";
import { createBrowserRouter } from "react-router-dom";
import { CompanyGroupRoute } from "./company-group-route";
import { CompaniesRoute } from "./companies-route";
import { UnitsRoute } from "./units-route";
import { BasesRoute } from "./bases-route";

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
    ],
  },
]);
