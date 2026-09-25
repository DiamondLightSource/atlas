import { useAuth } from "@atlas/auth";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export const AuthGuard = ({ element }: { element: ReactNode }) => {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  return element;
};
