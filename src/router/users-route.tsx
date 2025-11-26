import UsersEdit from "@/pages/protected/users/users-edit/users-edit";
import UsersListing from "@/pages/protected/users/users-listing";
import UsersPermissions from "@/pages/protected/users/users-permission/users-permission";

export const UsersRoute = [
  {
    path: "users/list",
    element: <UsersListing />,
  },
  {
    path: "users/list/:id",
    element: <UsersEdit />,
  },
  {
    path: "users/list/new",
    element: <UsersEdit />,
  },
  {
    path: "users/list/:id/permissions",
    element: <UsersPermissions />,
  },
];
