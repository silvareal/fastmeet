/**
 * A caller function to callback other function with args
 * @param {Function} callBack
 * @param {rest} args
 */
export function callerFn<T>(callBack: (args: T) => void, args: T) {
  callBack(args);
}
