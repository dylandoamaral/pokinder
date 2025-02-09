import { MdOutlineAccountCircle } from "react-icons/md";

import styles from "./Avatar.module.css";

function Avatar({ children, onClick, isDefault = true }) {
  if (isDefault) {
    return (
      <MdOutlineAccountCircle className={styles.container} onClick={onClick}>
        {children}
      </MdOutlineAccountCircle>
    );
  } else {
    return (
      <img className={styles.container} onClick={onClick} alt="User icon">
        {children}
      </img>
    );
  }
}

export default Avatar;
