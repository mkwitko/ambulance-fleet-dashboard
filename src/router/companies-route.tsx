import CompanyEdit from "@/pages/protected/companies/companies-edit/companies-edit";
import CompaniesListing from "@/pages/protected/companies/companies-listing";

export const CompaniesRoute = [
  {
    path: "companies/list",
    element: <CompaniesListing />,
  },
  {
    path: "companies/list/:id",
    element: <CompanyEdit />,
  },
  {
    path: "companies/list/new",
    element: <CompanyEdit />,
  },
];
