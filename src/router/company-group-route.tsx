import CompanyGroupAdmin from "@/pages/protected/company-group/company-group-admin";
import CompanyGroupAdminEdit from "@/pages/protected/company-group/company-group-admin-edit/company-group-admin-edit";

export const CompanyGroupRoute = [
  // {
  //   path: "company-group/list",
  //   element: <CompanyGroupList />,
  // },
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
];
