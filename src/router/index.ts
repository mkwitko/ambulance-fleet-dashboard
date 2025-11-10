import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/pages/(public)/_layout'
import { AppLayout } from '../pages/(protected)/_layout'

export const router = createBrowserRouter([
  {
    path: "/authentication",
    element: <PublicLayout />,
    children: [
      // {
      //   path: "",
      //   element: <SignIn />,
      // },
    ],
  },
  {
    path: "",
    element: <AppLayout />,
    children: [
     
    ],
  },
]);
