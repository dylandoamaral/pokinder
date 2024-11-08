import GridLoader from "react-spinners/GridLoader";

import { useTheme } from "../../../hook/useTheme";

import { isThemeLight } from "../../../data/themes";

function Loader({ loading = false }) {
  const { theme } = useTheme();

  const isWhite = theme === "pokeball" || !isThemeLight(theme);

  return (
    <GridLoader
      size={12}
      cssOverride={{ alignSelf: "center" }}
      loading={loading}
      color={isWhite ? "#fff" : "#000"}
      aria-label="Loading Spinner"
    />
  );
}

export default Loader;
