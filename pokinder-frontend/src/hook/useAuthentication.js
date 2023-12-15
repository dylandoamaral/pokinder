import { useContext } from "react";
import { AuthenticationContext } from "../context/authentication";

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};
