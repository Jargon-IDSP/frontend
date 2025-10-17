import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routes } from './lib/routes';

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}