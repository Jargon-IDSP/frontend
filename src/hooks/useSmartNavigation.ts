import { useNavigate, useLocation } from "react-router-dom";

interface NavigationState {
  from?: string;
  [key: string]: any;
}

export const useSmartNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateBack = (fallback: string) => {
    const from = (location.state as NavigationState)?.from;
    navigate(from || fallback, { replace: true });
  };

  const navigateWithOrigin = (path: string, options: any = {}) => {
    navigate(path, {
      ...options,
      state: {
        ...(options.state || {}),
        from: location.pathname,
      },
    });
  };

  return { navigateBack, navigateWithOrigin };
};
