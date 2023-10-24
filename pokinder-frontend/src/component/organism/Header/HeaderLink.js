import styles from "./HeaderLink.module.css";

function HeaderLink({ children, link }) {
  return (
    <a href={link} className={styles.container}>
      {children}
    </a>
  );
}

export default HeaderLink;
