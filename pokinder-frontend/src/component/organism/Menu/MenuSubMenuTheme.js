import { useTranslation } from "react-i18next";

import { useTheme } from "../../../hook/useTheme";

import { themes } from "../../../data/themes";

import { capitalize } from "../../../utils/string";

import MenuItem from "./MenuItem";
import MenuSubMenu from "./MenuSubMenu";

function MenuSubMenuLanguage({ onClose, onAnimationComplete, isOpen }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  function changeTheme(theme) {
    localStorage.setItem("pokinderTheme", theme);
    setTheme(theme);
  }

  return (
    <MenuSubMenu
      title={t("Theme")}
      icon={<img alt={theme} src={`./ball/${theme}.svg`} />}
      onClose={onClose}
      onAnimationComplete={onAnimationComplete}
      isOpen={isOpen}
    >
      {themes.map((_theme) => (
        <MenuItem
          key={_theme}
          name={capitalize(t(_theme))}
          icon={<img alt={_theme} src={`./ball/${_theme}.svg`} />}
          onClick={() => changeTheme(_theme)}
        />
      ))}
    </MenuSubMenu>
  );
}

export default MenuSubMenuLanguage;
