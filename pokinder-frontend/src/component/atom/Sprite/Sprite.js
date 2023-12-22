import Picture from "../Picture/Picture";

function Sprite({ className, path, type, size, alt }) {
  function getSrc() {
    const http =
      parseInt(process.env.REACT_APP_MINIO_PORT) === 443 ? "https" : "http";
    const category = type === "fusion" ? "fusions" : "pokemons";

    return `${http}://${process.env.REACT_APP_MINIO_HOST}:${process.env.REACT_APP_MINIO_PORT}/${category}/${path}.webp`;
  }

  const src = getSrc();

  return (
    <Picture
      className={className}
      src={src}
      width={size}
      height={size}
      alt={alt || "Fusion sprite"}
    />
  );
}

export default Sprite;
