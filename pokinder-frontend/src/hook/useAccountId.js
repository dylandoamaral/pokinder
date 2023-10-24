import { useCookies } from "react-cookie";
import { v4 as uuidv4 } from "uuid";

export default function useAccountId() {
  const accountIdName = "account_id";

  const [cookies, setCookie] = useCookies([accountIdName]);

  if (typeof cookies[accountIdName] !== "undefined") {
    return cookies[accountIdName];
  } else {
    const accountId = uuidv4();
    setCookie(accountIdName, accountId);
    return accountId;
  }
}
