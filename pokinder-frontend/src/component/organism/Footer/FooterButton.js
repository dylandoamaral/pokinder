import React from "react";
import { IconContext } from "react-icons";

import styles from "./FooterButton.module.css";

const FooterButton = React.forwardRef(function FooterButton(
  { children, name, link, show, ...props },
  ref,
) {
  if (show == false) return <></>;

  const content = (
    <>
      <IconContext.Provider value={{ size: 16 }}>{children}</IconContext.Provider>
      <span className={styles.label}>{name}</span>
    </>
  );

  if (link !== undefined) {
    return (
      <a className={styles.button} href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  } else {
    return (
      <button className={styles.button} ref={ref} {...props}>
        {content}
      </button>
    );
  }
});

export default FooterButton;
