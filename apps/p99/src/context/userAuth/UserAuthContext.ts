import { createContext } from "react";
import { type UserAuthStatus } from "./authUtils";

const userDefault: UserAuthStatus = { person: null, person_status: "PENDING" };

export const UserAuthContext = createContext<UserAuthStatus>(userDefault);
