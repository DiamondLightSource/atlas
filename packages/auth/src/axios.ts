import { useMemo } from "react";
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuth } from "./AuthContext";
import type { AccessTokenGetter } from "./authenticatedFetch";

/**
 * Creates an axios instance that attaches a fresh Authorization: Bearer
 * header to every request via a request interceptor
 */
export function createAuthenticatedAxios(
  getAccessToken: AccessTokenGetter,
  config?: AxiosRequestConfig,
): AxiosInstance {
  const instance = axios.create(config);

  instance.interceptors.request.use(async (requestConfig) => {
    const token = await getAccessToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  });

  return instance;
}

/**
 * Same as createAuthenticatedAxios, wired to the current AuthContext.
 * `config` is only read on the first render — pass a stable reference
 * (or none) rather than an inline object literal if you need it, since
 * changing it won't rebuild the instance.
 */
export function useAuthenticatedAxios(
  config?: AxiosRequestConfig,
): AxiosInstance {
  const { getAccessToken } = useAuth();
  return useMemo(
    () => createAuthenticatedAxios(getAccessToken, config),
    [getAccessToken],
  );
}
