import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import http from "../api/http";

export const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
  function isUUIDv4(str) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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

  function retrieveGuestToken() {
    const maybeGuestToken = localStorage.getItem(guestTokenKey)
    if (maybeGuestToken === null) {
      const guestToken = uuidv4()
      localStorage.setItem(guestTokenKey, guestToken)
      return guestToken
    } else {
      return maybeGuestToken
    }
  }

  function retrieveToken() {
    const token = localStorage.getItem(tokenKey);

    if (token === null) {
      return retrieveGuestToken()
    } else {
      return token;
    }
  }

  function retrieveRefreshToken() {
    const token = localStorage.getItem(refreshTokenKey);

    if (token === null || token === "none") {
      return "none";
    } else {
      return token;
    }
  }

  const tokenKey = "pokinderToken";
  const refreshTokenKey = "pokinderRefreshToken";
  const guestTokenKey = "pokinderGuestToken";

  // State to hold the authentication token
  const [token, storeToken] = useState(retrieveToken());
  const [refreshToken, storeRefreshToken] = useState(retrieveRefreshToken());

  http.instance.defaults.headers.common["X-API-KEY"] = token;
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(refreshTokenKey, refreshToken);

  useEffect(() => {
    http.instance.defaults.headers.common["X-API-KEY"] = token;
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(refreshTokenKey, refreshToken);
  }, [token, refreshToken]);

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
      if (!isUUIDv4(token)) {
        setToken(retrieveGuestToken());
        storeRefreshToken("none");
      }
    }

    function setToken(token) {
      storeToken(token);
    }

    const subject = retrieveSubject(token);

    return {
      token: token,
      refreshToken: refreshToken,
      accountId: subject.account_id,
      username: subject.username,
      isUser: subject.username !== undefined,
      setToken: setToken,
      setRefreshToken: storeRefreshToken,
      disconnect: disconnect,
    };
  }, [token, refreshToken]);

  // Provide the authentication context to the children components
  return (
    <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>
  );
};
