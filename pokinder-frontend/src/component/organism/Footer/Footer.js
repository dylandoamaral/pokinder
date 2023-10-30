import styles from "./Footer.module.css";
import { LiaGithub } from "react-icons/lia";
import { IconContext } from "react-icons";

function Footer() {
  return (
    <footer>
      <div className={styles.container}>
        <div className={styles.left}>
          <a
            className={styles.github}
            href="https://github.com/dylandoamaral/pokinder"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconContext.Provider value={{ size: 32 }}>
              <LiaGithub />
            </IconContext.Provider>
          </a>
        </div>
        <div className={styles.right}>
          <span>Version 0.1.0</span>
        </div>
      </div>
      <div className={styles.credit}>
        <p>This website is not affiliated with The Pokémon Company.</p>
      </div>
    </footer>
  );
}

export default Footer;
