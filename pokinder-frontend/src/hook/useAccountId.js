import { useCookies } from "react-cookie";
import { v4 as uuidv4 } from "uuid";

export default function useAccountId() {
  const accountIdName = "account_id";

  const [cookies, setCookie] = useCookies([accountIdName]);

  const setAccountId = (newAccountId) => setCookie(accountIdName, newAccountId);

  if (typeof cookies[accountIdName] !== "undefined") {
    return [cookies[accountIdName], setAccountId];
  } else {
    const accountId = uuidv4();
    setAccountId(accountId);
    return [accountId, setAccountId];
  }
}
