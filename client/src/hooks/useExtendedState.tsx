import React, { Dispatch, SetStateAction } from "react";

export default function useExtendedState<T>(
  initialState?: any
): [T, Dispatch<SetStateAction<T>>, () => Promise<T>] {
  const [state, setState] = React.useState<T>(initialState && initialState);
  const getLatestState = () => {
    return new Promise<T>((resolve, reject) => {
      setState((s) => {
        resolve(s);
        return s;
      });
    });
  };

  return [state, setState, getLatestState];
}
