import { Link } from "react-router-dom";

import Page from "../../component/organism/Page/Page";

import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <Page name="Page not found">
      <div className={styles.container}>
        <h1>Oops! You seem to be lost.</h1>
        <p>Here are some helpful links:</p>
        <Link to="/">Vote</Link>
        <Link to="/history">History</Link>
      </div>
    </Page>
  );
}

export default NotFound;
