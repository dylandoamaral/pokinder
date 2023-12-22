import { toast } from "react-toastify";
import { convertResponseToMessage } from "../data/errors";
import { useEffect } from "react";
import { useAuthentication } from "../hook/useAuthentication";
import { refresh } from "../api/pokinder";
import http from "../api/http";

function AxiosErrorHandler({ children }) {
  const { refreshToken, setToken, setRefreshToken, disconnect } =
    useAuthentication();

  useEffect(() => {
    const interceptor = http.instance.interceptors.response.use(
      null,
      async (error) => {
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
              console.log(error2);
              disconnect();
              return Promise.reject(error2);
            });
        }

        const isUserError =
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500;
        const isServerError =
          error.response &&
          error.response.status >= 500 &&
          error.response.status < 600;

        // Handle toast
        if (isUserError) {
          const message = convertResponseToMessage(error.response);
          toast.warning(message, { toastId: message });
        } else if (isServerError) {
          const message = convertResponseToMessage(error.response);
          toast.error(message, { toastId: message });
        } else if (error.code === "ERR_NETWORK") {
          toast.error("Can't communicate with the server", { toastId: 1 });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      http.instance.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, setToken, setRefreshToken, disconnect]);

  return children;
}

export default AxiosErrorHandler;
