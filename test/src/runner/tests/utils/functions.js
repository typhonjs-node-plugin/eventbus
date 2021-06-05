/**
 * Creates a timed function callback for async testing.
 *
 * @param {Function} func - Callback function.
 *
 * @param {number}   timeout - Delay to invoke callback.
 *
 * @returns {function(): Promise<void>} A timed function generator.
 */
export function createTimedFunction(func, timeout = 250)
{
   return () =>
   {
      return new Promise((resolve, reject) =>
      {
         setTimeout(() => func(resolve, reject), timeout);
      });
   };
}
