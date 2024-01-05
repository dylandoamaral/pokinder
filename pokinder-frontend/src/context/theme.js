import { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const tokenKey = "pokinderTheme";

  function retrieveTheme() {
    const prefereDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultTheme = prefereDark ? "hyperball" : "pokeball"
    const token = localStorage.getItem(tokenKey);

    return token || defaultTheme
  }

  const [theme, setTheme] = useState(retrieveTheme());

  useEffect(() => {
    localStorage.setItem(tokenKey, theme);
    document.documentElement.setAttribute("theme", theme);

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = `./icon/${theme}.ico`;
  }, [theme]);

  const value = useMemo(() => {
    return {
      theme: theme,
      setTheme: setTheme,
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
