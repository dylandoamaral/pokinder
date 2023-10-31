import styles from "./Header.module.css";
import Logo from "../../atom/Logo/Logo";
import HeaderLink from "./HeaderLink";
import IconSwipe from "../../atom/icon/IconSwipe";
import IconFolder from "../../atom/icon/IconFolder";
import useAccountId from "../../../hook/useAccountId";

function Header() {
  const accountId = useAccountId();

  return (
    <header className={styles.container}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <Logo />
          <h1 className={styles.title}>Pokinder</h1>
        </div>
        <nav className={styles.nav}>
          <HeaderLink link="/">
            <IconSwipe />
          </HeaderLink>
          <HeaderLink link="/pokedex">
            <IconFolder />
          </HeaderLink>
        </nav>
      </div>
      <div className={styles.right}>
        <span>User #{accountId}</span>
      </div>
    </header>
  );
}

export default Header;
