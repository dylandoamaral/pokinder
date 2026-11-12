import Picture from "../Picture/Picture";

function Sprite({ className, sizeClassName, href, filename, type, size, alt, eager = false, fetchPriority = "auto" }) {
  function getSrc() {
    const http = parseInt(import.meta.env.VITE_MINIO_PORT) === 443 ? "https" : "http";
    const category = type === "fusion" ? "fusions" : "pokemons";

    return `${http}://${import.meta.env.VITE_MINIO_HOST}:${import.meta.env.VITE_MINIO_PORT}/${category}/${filename}.webp`;
  }

  const defaultAlt = type === "fusion" ? "Fusion sprite" : "Pokemon sprite";
  const src = getSrc();

  function renderPicture() {
    return (
      <Picture
        className={sizeClassName}
        src={src}
        width={size}
        height={size}
        alt={alt || defaultAlt}
        eager={eager}
        fetchPriority={fetchPriority}
      />
    );
  }

  if (href === null) {
    return renderPicture();
  }

  return (
    <a
      className={className}
      style={{
        textDecoration: "none",
        msUserSelect: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {renderPicture()}
    </a>
  );
}

export default Sprite;
