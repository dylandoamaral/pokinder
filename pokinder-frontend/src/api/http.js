import axios from "axios";

const is_localhost = process.env.REACT_APP_BACKEND_HOST === "localhost";
const https = is_localhost ? "http" : "https";

const instance = axios.create({
  baseURL: `${https}://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`,
  timeout: 50000,
  withCredentials: true,
  headers: {
    //'Access-Control-Allow-Credentials': 'true',
    //'Access-Control-Allow-Origin': '*',
    //'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
    //'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
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
