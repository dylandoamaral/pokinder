import { getDaenaLink } from "../../../utils/website";

import Picture from "../Picture/Picture";

function Sprite({ className, path, filename, type, size, alt }) {
  function getSrc() {
    const http = parseInt(process.env.REACT_APP_MINIO_PORT) === 443 ? "https" : "http";
    const category = type === "fusion" ? "fusions" : "pokemons";

    return `${http}://${process.env.REACT_APP_MINIO_HOST}:${process.env.REACT_APP_MINIO_PORT}/${category}/${filename}.webp`;
  }

  const src = getSrc();

  return (
    <a
      style={{ textDecoration: "none" }}
      href={getDaenaLink(path)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Picture
        className={className}
        src={src}
        width={size}
        height={size}
        alt={alt || "Fusion sprite"}
      />
    </a>
  );
}

export default Sprite;
