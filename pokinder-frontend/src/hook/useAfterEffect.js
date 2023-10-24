import { useRef, useEffect } from "react";

/**
 * Identical to React.useEffect, except that it never runs on mount. This is
 * the equivalent of the componentDidUpdate lifecycle function.
 *
 * @param {function:function} effect - A useEffect effect.
 * @param {array} [dependencies] - useEffect dependency list.
 */
export const useAfterEffect = (effect, dependencies) => {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      const unmount = effect();
      return () => unmount && unmount();
    } else {
      mounted.current = true;
    }
    // eslint-disable-next-line
  }, dependencies);

  // Reset on unmount for the next mount.
  useEffect(() => {
    return () => (mounted.current = false);
  }, []);
};
