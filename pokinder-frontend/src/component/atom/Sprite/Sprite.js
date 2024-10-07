import Picture from "../Picture/Picture";

function Sprite({ className, href, filename, type, size, alt }) {
  function getSrc() {
    const http = parseInt(process.env.REACT_APP_MINIO_PORT) === 443 ? "https" : "http";
    const category = type === "fusion" ? "fusions" : "pokemons";

    return `${http}://${process.env.REACT_APP_MINIO_HOST}:${process.env.REACT_APP_MINIO_PORT}/${category}/${filename}.webp`;
  }

  const defaultAlt = type === "fusion" ? "Fusion sprite" : "Pokemon sprite";
  const src = getSrc();

  function renderPicture() {
    return (
      <Picture className={className} src={src} width={size} height={size} alt={alt || defaultAlt} />
    );
  }

  if (href === null) {
    return renderPicture();
  }

  return (
    <a
      className={className}
      style={{ textDecoration: "none" }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {renderPicture()}
    </a>
  );
}

export default Sprite;
