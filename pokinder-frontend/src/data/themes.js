export function isThemeLight(theme) {
  switch (theme) {
    case "hyperball":
      return false;
    default:
      return true;
  }
}

export const themes = ["pokeball", "superball", "hyperball"];
