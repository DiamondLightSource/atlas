import type { AccessTokenGetter } from "@atlas/auth";
import { createAuthenticatedAxios } from "@atlas/auth/axios";
import { type AxiosInstance } from "axios";

export function createApiClient(
  baseURL: string,
  getAccessToken: AccessTokenGetter,
): AxiosInstance {
  return createAuthenticatedAxios(getAccessToken, { baseURL });
}
