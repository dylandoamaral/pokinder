import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./Page.module.css";
import { Helmet } from "react-helmet";

function Page({ name, description, children }) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          Pokinder - {name || "Pokemon Infinite Fusion sprite ranking system"}
        </title>
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
          <main className={styles.main}>{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Page;
