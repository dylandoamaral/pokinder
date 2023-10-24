import styles from "./Picture.module.css";

function Picture({ className, src, width, height, alt }) {
  const getContainerStyle = () => {
    var style = {};

    if (width !== undefined) style["width"] = `${width}px`;
    if (height !== undefined) style["height"] = `${height}px`;

    return style;
  };

  return (
    <div className={className} style={getContainerStyle()}>
      <img className={styles.image} src={src} draggable="false" alt={alt}></img>
    </div>
  );
}

export default Picture;
