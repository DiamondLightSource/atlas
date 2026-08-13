import { type ReactNode } from "react";
import { UserAuthContext } from "./UserAuthContext";
import { getUser, type UserAuthStatus } from "./authUtils";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: (failureCount, error: AxiosError) => {
      if ("status" in error && (error.status == 401 || error.status == 403)) {
        //dont retry 401/403
        return false;
      }

      return failureCount < 2;
    },
  });

  //undefined if pending
  let response: UserAuthStatus = {
    person: null,
    person_status: "PENDING",
  };

  if (query.isError) {
    if (query.error.status == 401) {
      response = {
        person: null,
        person_status: "UNAUTHORIZED",
      };
    } else if (query.error.status == 403) {
      response = {
        person: null,
        person_status: "FORBIDDEN",
      };
    } else {
      response = {
        person: null,
        person_status: "ERROR",
      };
    }
  } else {
    if (query.data) {
      response = {
        person: query.data.preferredUsername,
        person_status: "OK",
      };
    }
  }

  return (
    <UserAuthContext.Provider value={response}>
      {children}
    </UserAuthContext.Provider>
  );
};
