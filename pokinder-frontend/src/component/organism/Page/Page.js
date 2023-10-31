import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./Page.module.css";

function Page({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default Page;
