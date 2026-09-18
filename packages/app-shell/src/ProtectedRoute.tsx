import { useAuth } from "@atlas/auth";
import { Alert } from "@mui/material";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    // we redirect to root
    return <Navigate to="/" replace />;
    //   // return (
    //   //   <Alert severity="info">You must be logged in to view this content</Alert>
    //   // );
  }

  return children;
};
