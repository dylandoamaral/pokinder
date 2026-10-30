import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./component/organism/Layout/Layout";
import Vote from "./page/Vote/Vote";

import { AuthenticationProvider } from "./context/authentication";
import AxiosErrorHandler from "./context/axios";
import { initInternationalization } from "./context/internationalization";
import { ThemeProvider } from "./context/theme";

const Admin = lazy(() => import("./page/Admin/Admin"));
const Analytics = lazy(() => import("./page/Analytics/Analytics"));
const Explore = lazy(() => import("./page/Explore/Explore"));
const ForgotPassword = lazy(() => import("./page/ForgotPassword/ForgotPassword"));
const LogIn = lazy(() => import("./page/LogIn/LogIn"));
const NewPassword = lazy(() => import("./page/NewPassword/NewPassword"));
const NotFound = lazy(() => import("./page/NotFound/NotFound"));
const Proposals = lazy(() => import("./page/Proposals/Proposals"));
const Settings = lazy(() => import("./page/Settings/Settings"));
const Signup = lazy(() => import("./page/SignUp/SignUp"));

const root = ReactDOM.createRoot(document.getElementById("root"));

initInternationalization();

export const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Vote /> },
      { path: "/explore", element: <Explore /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/admin", element: <Admin /> },
      { path: "/login", element: <LogIn /> },
      { path: "/signup", element: <Signup /> },
      { path: "/forgotpassword", element: <ForgotPassword /> },
      { path: "/newpassword", element: <NewPassword /> },
      { path: "/settings", element: <Settings /> },
      { path: "/proposals", element: <Proposals /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

root.render(
  <AuthenticationProvider>
    <ThemeProvider>
      <AxiosErrorHandler>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router}></RouterProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={1500}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </AxiosErrorHandler>
    </ThemeProvider>
  </AuthenticationProvider>,
);
