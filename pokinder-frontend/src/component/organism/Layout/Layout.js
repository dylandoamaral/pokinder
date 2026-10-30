import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./Layout.module.css";

function Layout() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Header />
        <Suspense fallback={<main />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
