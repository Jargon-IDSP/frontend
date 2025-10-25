import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routes } from './lib/routes';
import NavBar from './components/NavBar';

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <Router>
      <NavBar />
      <AppRoutes />
    </Router>
  );
}