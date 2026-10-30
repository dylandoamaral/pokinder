import { useTheme } from "../../../hook/useTheme";

import Picture from "../Picture/Picture";

function Logo({ className }) {
  const { theme } = useTheme();

  return (
    <Picture
      className={className}
      src={`./ball/${theme}.svg`}
      height={24}
      width={24}
      alt="logo"
      eager
    />
  );
}

export default Logo;
