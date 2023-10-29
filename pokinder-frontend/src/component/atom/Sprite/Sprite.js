import Picture from "../Picture/Picture";

function Sprite({ className, path, type, size }) {
  const src =
    type === "fusion"
      ? "./packs/2023-07/fusions/" + path + ".png"
      : "./packs/2023-07/pokemons/" + path + ".png";

  return (
    <Picture
      className={className}
      src={src}
      width={size}
      height={size}
      alt="sprite"
    />
  );
}

export default Sprite;
