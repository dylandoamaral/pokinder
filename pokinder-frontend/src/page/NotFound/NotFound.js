import Page from "../../component/organism/Page/Page";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <Page>
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
