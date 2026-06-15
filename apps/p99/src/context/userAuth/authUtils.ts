import axios, { type AxiosResponse } from "axios";

const userUrl = "oauth2/userinfo";

export type Person = {
  identifier: string;
  accepted_orca_eula: boolean;
};

export type UserName = {
  preferredUsername: string;
};

export type UserAuthStatus = {
  person: string | null | undefined;
  person_status: "PENDING" | "UNAUTHORIZED" | "FORBIDDEN" | "OK" | "ERROR";
};

export const getUser = async () => {
  const { data } = await axios.get<UserName, AxiosResponse<UserName>>(userUrl);
  return data;
};
