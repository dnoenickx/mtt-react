import { HashRouter } from 'react-router-dom';
import { Root as RootComponent } from './Root.page';

export default {
  title: 'Layout',
};

export const Root = () => (
  <HashRouter>
    <RootComponent />
  </HashRouter>
);
