import styles from "./Footer.module.css";
import { LiaGithub } from "react-icons/lia";
import { CgPokemon } from "react-icons/cg";
import { DiGitBranch } from "react-icons/di";
import FooterButton from "./FooterButton";
import FooterLangButton from "./FooterLangButton";

function Footer() {
  return (
    <footer>
      <div className={styles.container}>
        <div className={styles.left}>
          <FooterButton
            name="Github"
            link="https://github.com/dylandoamaral/pokinder"
          >
            <LiaGithub />
          </FooterButton>
          <FooterButton
            name="Pokemon Infinite Fusion"
            link="https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Infinite_Fusion_Wiki"
          >
            <CgPokemon />
          </FooterButton>
        </div>
        <div className={styles.right}>
          <FooterLangButton />
          <FooterButton
            name={`v${process.env.REACT_APP_VERSION}`}
            link={`https://github.com/dylandoamaral/pokinder/releases/tag/v${process.env.REACT_APP_VERSION}`}
          >
            <DiGitBranch />
          </FooterButton>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
