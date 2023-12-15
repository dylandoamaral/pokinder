import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";

export const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
  function isUUIDv4(str) {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  }

  function extractSubjectFromToken(token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken && decodedToken.sub) {
        return decodedToken.sub;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  function retrieveToken() {
    const token = localStorage.getItem(tokenKey);

    if (token === null) {
      return uuidv4();
    } else {
      return token;
    }
  }

  const tokenKey = "pokinderToken";

  // State to hold the authentication token
  const [token, storeToken] = useState(retrieveToken());
  axios.defaults.headers.common["X-API-KEY"] = token;
  localStorage.setItem(tokenKey, token);

  useEffect(() => {
    axios.defaults.headers.common["X-API-KEY"] = token;
    localStorage.setItem(tokenKey, token);
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(() => {
    function retrieveSubject(token) {
      if (isUUIDv4(token)) {
        return {
          account_id: token,
          username: undefined,
        };
      } else {
        return extractSubjectFromToken(token);
      }
    }

    function disconnect() {
      setToken(uuidv4());
    }

    function setToken(token) {
      storeToken(token);
      window.location.reload();
    }

    const subject = retrieveSubject(token);

    return {
      token: token,
      accountId: subject.account_id,
      username: subject.username,
      isUser: subject.username !== undefined,
      setToken: setToken,
      disconnect: disconnect,
    };
  }, [token]);

  // Provide the authentication context to the children components
  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};
