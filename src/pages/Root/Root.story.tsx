import { Root as RootComponent } from './Root.page';
import { BrowserRouter } from 'react-router-dom';

export default {
  title: 'Layout',
};

export const Root = () => (
  <BrowserRouter>
    <RootComponent />
  </BrowserRouter>
);
