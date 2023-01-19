import React from "react";

export default function useExtendedState<T>(initialState?: T) {
  const [state, setState] = React.useState<T>(
    initialState !== undefined && initialState
  );
  const getLatestState = () => {
    return new Promise<T>((resolve, reject) => {
      setState((s) => {
        resolve(s);
        return s;
      });
    });
  };

  return [state, setState, getLatestState] as const;
}
