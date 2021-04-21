/**
 * Returns whether the value is array like.
 *
 * @param {*}  value -
 * @returns {boolean} -
 */
function isArrayLike(value)
{
   return value !== null && value !== void 0 && typeof value !== 'function' && typeof value.length === 'number';
}

/**
 * Returns size of an array like
 *
 * @param {*}  collection -
 * @returns {number} -
 */
export function size(collection)
{
   if (collection === null || collection === void 0) { return 0; }

   if (isArrayLike(collection)) { return collection.length; }

   if (collection instanceof Map || collection instanceof Set) { return collection.size; }

   return Object.keys(collection).length;
}
