import axios from "axios";

const is_localhost = import.meta.env.VITE_BACKEND_HOST === "localhost";
const https = is_localhost ? "http" : "https";

const instance = axios.create({
  baseURL: `${https}://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}`,
  timeout: 50000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const http = {
  get: instance.get,
  put: instance.put,
  post: instance.post,
  delete: instance.delete,
  instance: instance,
};

export default http;
