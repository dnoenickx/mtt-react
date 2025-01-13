import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Root } from './pages/Root/Root.page';
import { TrailMapPage } from './pages/TrailMap/TrailMap.page';
import { NothingFoundBackground } from './pages/Error/Error';
import About from './pages/About/About.page';
import Admin from './pages/Admin/admin.page';
import SegmentForm from './pages/Admin/SegmentForm';
import TrailForm from './pages/Admin/TrailForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NothingFoundBackground />,
    children: [
      {
        path: '/',
        element: <Navigate to="/map" />,
      },
      {
        path: '/map',
        element: <TrailMapPage />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/admin',
        element: <Navigate to="/admin/segments" />,
      },
      {
        path: '/admin/:tabValue',
        element: <Admin />,
      },
      {
        path: '/admin/segments/:id',
        element: <SegmentForm />,
      },
      {
        path: '/admin/trails/:id',
        element: <TrailForm />,
      },
      // {
      //   path: '/admin/trailEvents/:id',
      //   element: <TrailEventEdit />,
      // },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
