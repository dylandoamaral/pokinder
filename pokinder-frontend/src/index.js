import React, { createContext } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Vote from "./page/Vote/Vote";
import Pokedex from "./page/Pokedex/Pokedex";
import NotFound from "./page/NotFound/NotFound";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthenticationProvider } from "./context/authentication";

const root = ReactDOM.createRoot(document.getElementById("root"));

export const queryClient = new QueryClient();

export const TestContext = createContext("test");

const router = createBrowserRouter([
  { path: "/", element: <Vote /> },
  { path: "/history", element: <Pokedex /> },
  { path: "*", element: <NotFound /> },
]);

root.render(
  <AuthenticationProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </AuthenticationProvider>
);
