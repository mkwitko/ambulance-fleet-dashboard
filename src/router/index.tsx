import { AppLayout } from "@/pages/protected/_layout";
import CompanyGroupList from "@/pages/protected/company-group/company-group-listing";
import CompanyGroupAdmin from "@/pages/protected/company-group/company-group-admin";
import CompanyGroupAdminEdit from "@/pages/protected/company-group/company-group-admin-edit/company-group-admin-edit";
import { PublicLayout } from "@/pages/public/_layout";
import SignIn from "@/pages/public/sign-in";
import { createBrowserRouter } from "react-router-dom";
import CompaniesListing from "@/pages/protected/companies/companies-listing";

export const router = createBrowserRouter([
  {
    path: "/authentication",
    element: <PublicLayout />,
    children: [
      {
        path: "",
        element: <SignIn />,
      },
    ],
  },
  {
    path: "",
    element: <AppLayout />,
    children: [
      {
        path: "company-group/list",
        element: <CompanyGroupList />,
      },
      {
        path: "company-group/admin",
        element: <CompanyGroupAdmin />,
      },
      {
        path: "company-group/admin/new",
        element: <CompanyGroupAdminEdit />,
      },
      {
        path: "company-group/admin/:id",
        element: <CompanyGroupAdminEdit />,
      },
      {
        path: "companies/list",
        element: <CompaniesListing />,
      },
    ],
  },
]);
