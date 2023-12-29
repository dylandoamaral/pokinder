import Picture from "../Picture/Picture";

function Logo({ className }) {
  return <Picture className={className} src="./icon.png" height={24} width={24} alt="logo" />;
}

export default Logo;
