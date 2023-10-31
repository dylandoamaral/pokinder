import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Vote from "./page/Vote/Vote";
import Pokedex from "./page/Pokedex/Pokedex";
import NotFound from "./page/NotFound/NotFound";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
export const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <Vote /> },
  { path: "/pokedex", element: <Pokedex /> },
  { path: "*", element: <NotFound /> },
]);

root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router}></RouterProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
