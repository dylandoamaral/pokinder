import { useSearchParams as useSearchParamsDefault } from "react-router-dom";

/**
 * A custom react-router-dom search params that manipulate object instead of url params and remove default values.
 * We need to let searchParamsDefault as a notifier to useEffect function.
 */
export default function useSearchParams(defaultParams) {
  const [searchParamsDefault, setSearchParamsDefault] = useSearchParamsDefault();

  function convertRawParams(params) {
    if (params === "true") return true;
    else if (params === "false") return false;
    else return params;
  }

  function filterSearchParams(searchParams) {
    const searchParamsWithoutDefault = {};

    for (const key in defaultParams) {
      const maybeRawParam =
        searchParams instanceof URLSearchParams ? searchParams.get(key) : searchParams[key];
      if (maybeRawParam !== undefined && maybeRawParam !== null) {
        const param = convertRawParams(maybeRawParam);
        if (param !== defaultParams[key]) {
          searchParamsWithoutDefault[key] = param;
        }
      }
    }

    return searchParamsWithoutDefault;
  }

  function setSearchParams(newParams) {
    setSearchParamsDefault(filterSearchParams(newParams));
  }

  return [searchParamsDefault, filterSearchParams(searchParamsDefault), setSearchParams];
}
