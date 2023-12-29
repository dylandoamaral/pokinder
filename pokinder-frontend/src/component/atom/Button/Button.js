import styles from "./Button.module.css";

function Button({
  onClick,
  disabled,
  title,
  nopadding = false,
  variant = "filled",
  foreground = false,
}) {
  const variantClassName =
    variant === "filled" ? styles.filled : variant === "outlined" ? styles.outlined : styles.text;

  const foregroundClassName = foreground ? styles.foreground : styles.background;

  const nopaddingClassName = nopadding ? styles.nopadding : styles.padding;

  return (
    <button
      className={`${styles.container} ${variantClassName} ${foregroundClassName} ${nopaddingClassName}`}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
}

export default Button;
