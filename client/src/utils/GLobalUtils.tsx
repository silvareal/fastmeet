/**
 * A caller function to callback other function with args
 * @param {Function} callBack
 * @param {rest} args
 */
export function callerFn<T> (callBack:  (args: T) => void, args: T) {
  callBack (args);
}

/**
 * Generate pronoun from gender
 * @param {"male" | "female"} gender 
 * @returns 
 */
export function genderToPronoun (gender: 'male' | 'female') {
  switch (gender) {
    case 'male':
      return 'His';
    case 'female':
      return 'Her';
  }
  return;
}
