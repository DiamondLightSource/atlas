import { UserAuthContext } from "./UserAuthContext";
import { useContext } from "react";

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error(
      "No user context found, is your component without UserAuthProvider?",
    );
  }
  return context;
};
