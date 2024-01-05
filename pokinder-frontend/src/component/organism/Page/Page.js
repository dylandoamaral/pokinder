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
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if (bottom) {
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
            "Rank Pokémon Infinite Fusion sprites based on your preferences and explore the community's favorite sprites."
          }
        />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.content}>
          <Header />
          <main
            style={{ overflow: overflow }}
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
