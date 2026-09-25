import { createAxiosWithLoginRedirect } from "@atlas/auth/axios";
import { type AxiosInstance } from "axios";
import type { LoginFn } from "../../auth/src/loginRedirect";

export function createApiClient(
  baseURL: string,
  login: LoginFn,
): AxiosInstance {
  return createAxiosWithLoginRedirect(login, { baseURL });
}
