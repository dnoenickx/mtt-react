import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root } from './pages/Root/Root.page';
import { TrailMap } from './pages/TrailMap/TrailMap.page';
import { NothingFoundBackground } from './pages/Error/Error';
import About from './pages/About/About.page';
import { loader as segmentLoader } from './components/MapLayers/Segments/Segments.layer';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NothingFoundBackground />,
    children: [
      {
        path: '/',
        element: <TrailMap />,
        loader: segmentLoader,
      },
      {
        path: '/about',
        element: <About />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
