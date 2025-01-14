import styles from "./Button.module.css";

export const VARIANT_FILLED_HEADER = "filled-header";
export const VARIANT_FILLED_BACKGROUND = "filled-background";
export const VARIANT_FILLED_FOREGROUND = "filled-foreground";
export const VARIANT_CALL_TO_ACTION = "call-to-action";
export const VARIANT_TEXT = "text";

function Button({
  onClick,
  title,
  variant = VARIANT_FILLED_FOREGROUND,
  disabled = false,
  noPadding = false,
}) {
  const noPaddingClassName = noPadding ? styles.nopadding : styles.padding;

  return (
    <button
      className={`${styles.container} ${noPaddingClassName}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        "--button-font-color": `var(--button-font-color-${variant}`,
        "--button-background-color": `var(--button-background-color-${variant})`,
        "--button-border-color": `var(--button-border-color-${variant})`,

        "--button-font-color-hover": `var(--button-font-color-hover-${variant})`,
        "--button-background-color-hover": `var(--button-background-color-hover-${variant})`,
        "--button-border-color-hover": `var(--button-border-color-hover-${variant})`,

        "--button-font-color-disabled": `var(--button-font-color-disabled-${variant})`,
        "--button-background-color-disabled": `var(--button-background-color-disabled-${variant})`,
        "--button-border-color-disabled": `var(--button-border-color-disabled-${variant})`,
      }}
    >
      {title}
    </button>
  );
}

export default Button;
