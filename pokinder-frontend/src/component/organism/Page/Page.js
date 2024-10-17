import { Helmet } from "react-helmet";

import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./Page.module.css";

function Page({
  name,
  description,
  children,
  overflow = "none",
  scrollRef = null,
  onScrollFinish = () => {},
}) {
  function onScroll(e) {
    const threshold = 25 / 100;
    const scrollPosition = e.target.scrollHeight - e.target.scrollTop;
    const thresholdPosition = e.target.clientHeight * (1 + threshold);

    if (scrollPosition <= thresholdPosition) {
      onScrollFinish();
    }
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Pokinder - {name || "Pokemon Infinite Fusion sprite ranking system"}</title>
        <meta
          name="description"
          content={
            description ||
            "Vote for your favorite Pokémon Infinite Fusion sprites, explore your history and find the ranking of the whole community."
          }
        />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.content}>
          <Header />
          <main
            style={{ overflow: overflow, display: overflow === "none" ? "grid" : "block" }}
            className={styles.main}
            onScroll={onScroll}
            ref={scrollRef}
          >
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Page;
