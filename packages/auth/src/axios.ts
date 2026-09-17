import { useMemo } from "react";
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuth } from "./AuthContext";
import { guardLoginOnce, type LoginFn } from "./loginRedirect";

export function createAxiosWithLoginRedirect(
  login: LoginFn,
  config?: AxiosRequestConfig,
): AxiosInstance {
  const instance = axios.create(config);
  const triggerRedirect = guardLoginOnce(login);

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        triggerRedirect();
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

/** Wired to the current AuthContext */
export function useAxiosWithLoginRedirect(
  config?: AxiosRequestConfig,
): AxiosInstance {
  const { login } = useAuth();
  return useMemo(() => createAxiosWithLoginRedirect(login, config), [login]);
}
