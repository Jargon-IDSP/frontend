import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import type { ProtectedRouteProps } from "../types/protectedRoute";

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
