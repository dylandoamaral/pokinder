import axios from "axios";
import { toast } from "react-toastify";
import { convertResponseToMessage } from "../data/errors";

function http() {
  const is_localhost = process.env.REACT_APP_BACKEND_HOST === "localhost";
  const https = is_localhost ? "http" : "https";

  const instance = axios.create({
    baseURL: `${https}://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`,
    timeout: 50000,
    headers: {
      "Content-type": "application/json",
    },
  });

  instance.interceptors.response.use(null, (error) => {
    const isUserError =
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500;
    const isServerError =
      error.response &&
      error.response.status >= 500 &&
      error.response.status < 600;

    if (isUserError) {
      toast.warning(convertResponseToMessage(error.response), {});
    } else if (isServerError) {
      toast.error(convertResponseToMessage(error.response), {});
    } else if (error.code === "ERR_NETWORK") {
      toast.error("Can't communicate with the server", { toastId: 1 });
    }

    return Promise.reject(error);
  });

  return {
    get: instance.get,
    put: instance.put,
    post: instance.post,
    delete: instance.delete,
  };
}

export default http;
