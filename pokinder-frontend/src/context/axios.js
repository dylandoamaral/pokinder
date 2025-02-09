import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuthentication } from "../hook/useAuthentication";
import { useTheme } from "../hook/useTheme";

import http from "../api/http";
import { refresh } from "../api/pokinder";

import { convertResponseToMessage } from "../data/errors";
import { isThemeLight } from "../data/themes";

import { getCookie } from "../utils/cookie";

function AxiosErrorHandler({ children }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { refreshToken, setTokens, disconnect } = useAuthentication();

  useEffect(() => {
    function onSuccessRequest(config) {
      const csrfToken = getCookie("XSRF-TOKEN");

      if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(config.method.toUpperCase())) {
        config.headers["X-XSRF-TOKEN"] = csrfToken;
      }

      return config;
    }

    async function onErrorResponse(error, interceptor) {
      // Handle refresh token
      if (error.response !== undefined && error.response.status === 401) {
        http.instance.interceptors.response.eject(interceptor);

        return refresh(refreshToken)
          .then((response) => {
            const tokens = response;
            setTokens({ token: tokens.token, refreshToken: tokens.refresh });
            error.response.config.headers["X-API-KEY"] = tokens.token;
            return http.instance(error.response.config);
          })
          .catch((error2) => {
            disconnect();
            return Promise.reject(error2);
          });
      }

      const isUserError =
        error.response && error.response.status >= 400 && error.response.status < 500;
      const isServerError =
        error.response && error.response.status >= 500 && error.response.status < 600;

      const toastTheme = isThemeLight(theme) ? "light" : "dark";

      // Handle toast
      if (isUserError) {
        const message = convertResponseToMessage(error.response);
        toast.warning(t(message), { toastId: message, theme: toastTheme });
      } else if (isServerError) {
        const message = convertResponseToMessage(error.response);
        toast.error(t(message), { toastId: message, theme: toastTheme });
      } else if (error.code === "ERR_NETWORK") {
        toast.error(t("Can't communicate with the server"), {
          toastId: 1,
          theme: toastTheme,
        });
      }

      return Promise.reject(error);
    }

    const requestInterceptor = http.instance.interceptors.request.use(
      (config) => onSuccessRequest(config),
      null,
    );

    const responseInterceptor = http.instance.interceptors.response.use(
      null,
      async (error) => await onErrorResponse(error, responseInterceptor),
    );

    return () => {
      http.instance.interceptors.request.eject(requestInterceptor);
      http.instance.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken, setTokens, disconnect, t, theme]);

  return children;
}

export default AxiosErrorHandler;
