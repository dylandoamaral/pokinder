import Picture from "../Picture/Picture";

function Sprite({ className, path, type, size, alt }) {
  function getSrc() {
    const category = type === "fusion" ? "fusions" : "pokemons";
    const quality = size <= 144 ? "-144px" : "";

    return `${process.env.REACT_APP_MINIO_HOST}:${process.env.REACT_APP_MINIO_PORT}/${category}/${path}${quality}.webp`;
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
