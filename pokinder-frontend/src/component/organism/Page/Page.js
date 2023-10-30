import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./Page.module.css";

function Page({ children }) {
  return (
    <div className={styles.container}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default Page;
