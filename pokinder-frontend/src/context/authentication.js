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
    const maybeGuestToken = localStorage.getItem(guestTokenKey);
    if (maybeGuestToken === null) {
      const guestToken = uuidv4();
      localStorage.setItem(guestTokenKey, guestToken);
      return guestToken;
    } else {
      return maybeGuestToken;
    }
  }

  function generateGuestToken() {
    const guestToken = uuidv4();
    localStorage.setItem(guestTokenKey, guestToken);
    return guestToken;
  }

  function retrieveToken() {
    const token = localStorage.getItem(tokenKey);

    if (token === null) {
      return retrieveGuestToken();
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
  const [tokens, setTokens] = useState({
    token: retrieveToken(),
    refreshToken: retrieveRefreshToken(),
  });

  http.instance.defaults.headers.common["X-API-KEY"] = tokens.token;
  localStorage.setItem(tokenKey, tokens.token);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);

  useEffect(() => {
    http.instance.defaults.headers.common["X-API-KEY"] = tokens.token;
    localStorage.setItem(tokenKey, tokens.token);
    localStorage.setItem(refreshTokenKey, tokens.refreshToken);
  }, [tokens]);

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
      if (!isUUIDv4(tokens.token)) {
        setTokens({ token: retrieveGuestToken(), refreshToken: "none" });
      }
    }

    const subject = retrieveSubject(tokens.token);

    return {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      accountId: subject.account_id,
      username: subject.username,
      isUser: subject.username !== undefined,
      isAdmin: subject.role === "ADMIN",
      setTokens: setTokens,
      disconnect: disconnect,
      generateGuestToken: generateGuestToken,
    };
  }, [tokens]);

  // Provide the authentication context to the children components
  return (
    <AuthenticationContext.Provider value={contextValue}>{children}</AuthenticationContext.Provider>
  );
};
