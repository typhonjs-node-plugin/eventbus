/**
 * Creates a timed function callback for async testing.
 *
 * @param {Function} func - Callback function.
 * @param {number}   timeout - Delay to invoke callback.
 *
 * @returns {function(): Promise<void>} A timed function generator.
 */
export default function(func, timeout = 1000)
{
   return () =>
   {
      return new Promise((resolve, reject) =>
      {
         setTimeout(() => func(resolve, reject), timeout);
      });
   };
}
