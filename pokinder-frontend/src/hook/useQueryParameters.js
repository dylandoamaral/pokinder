import { useSearchParams } from "react-router-dom";

export default function useQueryParameters() {
  const [searchParamsDefault, setSearchParamsDefault] = useSearchParams();

  function convertRawParameters(parameter) {
    if (parameter === "true") return true;
    else if (parameter === "false") return false;
    else return parameter;
  }

  function objectifyParameters(parameters) {
    return Object.fromEntries(parameters.entries());
  }

  function sanitizeParameters(parameters) {
    const sanitizedParameters = {};

    for (const key in parameters) {
      const value = parameters[key];
      sanitizedParameters[key] = convertRawParameters(value);
    }

    return sanitizedParameters;
  }

  function setParameters(newParameters) {
    setSearchParamsDefault(sanitizeParameters(newParameters));
  }

  return [sanitizeParameters(objectifyParameters(searchParamsDefault)), setParameters];
}
