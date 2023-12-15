import styles from "./Footer.module.css";
import { LiaGithub } from "react-icons/lia";
import { CgPokemon } from "react-icons/cg";
import { DiGitBranch } from "react-icons/di";
import { IconContext } from "react-icons";

function Footer() {
  function FooterLink({ children, name, link }) {
    return (
      <a
        className={styles.button}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconContext.Provider value={{ size: 16 }}>
          {children}
        </IconContext.Provider>
        <span className={styles.buttonText}>{name}</span>
      </a>
    );
  }

  return (
    <footer>
      <div className={styles.container}>
        <div className={styles.left}>
          <FooterLink
            name="Github"
            link="https://github.com/dylandoamaral/pokinder"
          >
            <LiaGithub />
          </FooterLink>
          <FooterLink
            name="Game"
            link="https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Infinite_Fusion_Wiki"
          >
            <CgPokemon />
          </FooterLink>
        </div>
        <div className={styles.right}>
          <FooterLink
            name={`v${process.env.REACT_APP_VERSION}`}
            link={`https://github.com/dylandoamaral/pokinder/releases/tag/v${process.env.REACT_APP_VERSION}`}
          >
            <DiGitBranch />
          </FooterLink>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
