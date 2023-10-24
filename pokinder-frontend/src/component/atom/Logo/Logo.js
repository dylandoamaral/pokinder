import Picture from "../Picture/Picture";

function Logo({ className }) {
  return (
    <Picture className={className} src="./logo.png" height={24} alt="logo" />
  );
}

export default Logo;
