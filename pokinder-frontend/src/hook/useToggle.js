import { useState } from "react";

export default function useToggle(initialState = false) {
  const [value, setValue] = useState(initialState);

  return [value, () => setValue(!value)];
}
