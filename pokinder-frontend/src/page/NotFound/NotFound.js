import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Oak from "../../component/atom/Oak/Oak";
import Page from "../../component/organism/Page/Page";

import styles from "./NotFound.module.css";

function NotFound() {
  const { t } = useTranslation();

  return (
    <Page name="Page not found">
      <Oak>
        <p>
          <Trans t={t} i18nKey="Not found message one">
            Ah, my dear young Trainer, it appears you've diverged from your intended path in this
            expansive world of Pokémon! But fear not, for such moments often lead to unexpected
            discoveries.
          </Trans>
        </p>
        <p>
          <Trans t={t} i18nKey="Not found message two">
            Why not consider{" "}
            <Link className={styles.link} to="/">
              exploring the Vote Page
            </Link>
            ? There, you can contribute to completing your Pokédex by voting for and learning about
            various Pokémon species. Additionally,{" "}
            <Link className={styles.link} to="/history">
              reviewing your Pokédex history
            </Link>{" "}
            might unveil past encounters and discoveries, aiding you on your ongoing quest to become
            a Pokémon Master.
          </Trans>
        </p>
        <p>
          <Trans t={t} i18nKey="Not found message three">
            Embrace these detours, for they often enrich your journey and bring you closer to
            achieving your goal. Keep exploring, keep learning, and your adventure shall flourish!
          </Trans>
        </p>
      </Oak>
    </Page>
  );
}

export default NotFound;
