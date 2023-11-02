import styles from "./Header.module.css";
import Logo from "../../atom/Logo/Logo";
import HeaderLink from "./HeaderLink";
import IconSwipe from "../../atom/icon/IconSwipe";
import IconFolder from "../../atom/icon/IconFolder";

function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <Logo />
          <h1 className={styles.title}>Pokinder</h1>
        </div>
      </div>
      <div className={styles.right}>
        <nav className={styles.nav}>
          <HeaderLink link="/">
            <IconSwipe />
          </HeaderLink>
          <HeaderLink link="/pokedex">
            <IconFolder />
          </HeaderLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
