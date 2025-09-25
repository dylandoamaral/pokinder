import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Admin from "./page/Admin/Admin";
import Analytics from "./page/Analytics/Analytics";
import Explore from "./page/Explore/Explore";
import ForgotPassword from "./page/ForgotPassword/ForgotPassword";
import LogIn from "./page/LogIn/LogIn";
import NewPassword from "./page/NewPassword/NewPassword";
import NotFound from "./page/NotFound/NotFound";
import Proposals from "./page/Proposals/Proposals";
import Settings from "./page/Settings/Settings";
import Signup from "./page/SignUp/SignUp";
import Vote from "./page/Vote/Vote";

import { AuthenticationProvider } from "./context/authentication";
import AxiosErrorHandler from "./context/axios";
import { initInternationalization } from "./context/internationalization";
import { ThemeProvider } from "./context/theme";

const root = ReactDOM.createRoot(document.getElementById("root"));

initInternationalization();

export const queryClient = new QueryClient();

const router = createBrowserRouter([
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
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AxiosErrorHandler>
    </ThemeProvider>
  </AuthenticationProvider>,
);
