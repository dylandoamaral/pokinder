import Picture from "../Picture/Picture";

import { useTheme } from "../../../hook/useTheme";

function Logo({ className }) {
  const { theme } = useTheme();

  return (
    <Picture className={className} src={`./ball/${theme}.svg`} height={24} width={24} alt="logo" />
  );
}

export default Logo;
