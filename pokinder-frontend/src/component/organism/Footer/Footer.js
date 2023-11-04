import styles from "./Footer.module.css";
import { LiaGithub } from "react-icons/lia";
import { CgPokemon } from "react-icons/cg";
import { BiSolidUser } from "react-icons/bi";
import { DiGitBranch } from "react-icons/di";
import { IconContext } from "react-icons";
import useAccountId from "../../../hook/useAccountId";
import useToggle from "../../../hook/useToggle";
import FooterAccountIdModal from "./FooterAccountIdModal";

function Footer() {
  const accountId = useAccountId();

  const [showAccountIdModal, toggleAccountIdModal] = useToggle();

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

  function FooterButton({ children, name, onClick }) {
    return (
      <button className={styles.button} onClick={onClick}>
        <IconContext.Provider value={{ size: 16 }}>
          {children}
        </IconContext.Provider>
        <span className={styles.buttonText}>{name}</span>
      </button>
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
          <FooterButton name={accountId} onClick={toggleAccountIdModal}>
            <BiSolidUser />
          </FooterButton>
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
      <FooterAccountIdModal
        isVisible={showAccountIdModal}
        onClose={toggleAccountIdModal}
      />
    </footer>
  );
}

export default Footer;
