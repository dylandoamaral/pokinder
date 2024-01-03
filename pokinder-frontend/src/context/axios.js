import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { useAuthentication } from "../hook/useAuthentication";
import { useTheme } from "../hook/useTheme";

import http from "../api/http";
import { refresh } from "../api/pokinder";

import { convertResponseToMessage } from "../data/errors";
import { isThemeLight } from "../data/themes";

function AxiosErrorHandler({ children }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { refreshToken, setToken, setRefreshToken, disconnect } = useAuthentication();

  useEffect(() => {
    const interceptor = http.instance.interceptors.response.use(null, async (error) => {
      // Handle refresh token
      if (error.response !== undefined && error.response.status === 401) {
        http.instance.interceptors.response.eject(interceptor);

        return refresh(refreshToken)
          .then((response) => {
            const tokens = response;
            setToken(tokens.token);
            setRefreshToken(tokens.refresh);
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
    });

    return () => {
      http.instance.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, setToken, setRefreshToken, disconnect, t, theme]);

  return children;
}

export default AxiosErrorHandler;
