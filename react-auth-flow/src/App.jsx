// =============================================================================
//  useRoutes(routes) does what <Routes><Route …/></Routes> does, but from an
//  array of objects (see routes/index.jsx). It returns the element for the
//  current URL, or null if nothing matches.
//
//  ⚠️ Why not a custom component inside <Routes>? <Routes> never RENDERS its
//  children — it READS them as config, and only accepts <Route> or <Fragment>.
//  <Routes><MyRoutes /></Routes> throws "is not a <Route> component".
// =============================================================================
import { useRoutes } from 'react-router';
import { routes } from './routes';

export function App() {
  return useRoutes(routes);
}
