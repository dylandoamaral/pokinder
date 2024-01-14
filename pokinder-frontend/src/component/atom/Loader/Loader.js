import BeatLoader from "react-spinners/BeatLoader";

import { useTheme } from "../../../hook/useTheme";

import { isThemeLight } from "../../../data/themes";

function Loader({ loading = false }) {
  const { theme } = useTheme();

  const isWhite = theme === "pokeball" || !isThemeLight(theme);

  return (
    <BeatLoader
      cssOverride={{ alignSelf: "center" }}
      loading={loading}
      color={isWhite ? "#fff" : "#000"}
      aria-label="Loading Spinner"
    />
  );
}

export default Loader;
