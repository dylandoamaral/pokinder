import styles from "./Footer.module.css";
import { LiaGithub } from "react-icons/lia";
import { CgPokemon } from "react-icons/cg";
import { BiSolidUser } from "react-icons/bi";
import { DiGitBranch } from "react-icons/di";
import { IconContext } from "react-icons";
import useAccountId from "../../../hook/useAccountId";

function Footer() {
  const accountId = useAccountId();

  function FooterLink({ children, name, link, hideOnPhone }) {
    const linkStyle = hideOnPhone
      ? `${styles.link} ${styles.link_hidden}`
      : styles.link;

    return (
      <a
        className={linkStyle}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconContext.Provider value={{ size: 16 }}>
          {children}
        </IconContext.Provider>
        <span className={styles.link_name}>{name}</span>
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
          <FooterLink name={accountId} hideOnPhone>
            <BiSolidUser />
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
