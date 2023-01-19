import { useRef } from "react";

/**
 * @template T
 * @param {T} data
 */
function useDataRef<T = any>(data: any) {
  const ref = useRef<T>(data);
  ref.current = data;
  return ref;
}

export default useDataRef;
