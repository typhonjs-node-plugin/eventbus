/**
 * Regular expression used to split event strings.
 *
 * @type {RegExp}
 */
export const eventSplitter = /\s+/;

/**
 * Iterates over the standard `event, callback` (as well as the fancy multiple space-separated events `"change blur",
 * callback` and jQuery-style event maps `{event: callback}`).
 *
 * @param {Function} iteratee    - Event operation to invoke.
 * @param {Events} events        - Events object
 * @param {string|object} name   - A single event name, compound event names, or a hash of event names.
 * @param {Function} callback    - Event callback function
 * @param {object}   opts        - Optional parameters
 * @returns {Events} Events object
 */
export function eventsAPI(iteratee, events, name, callback, opts)
{
   let i = 0, names;
   if (name && typeof name === 'object')
   {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) { opts.context = callback; }
      for (names = objectKeys(name); i < names.length; i++)
      {
         events = eventsAPI(iteratee, events, names[i], name[names[i]], opts);
      }
   }
   else if (name && eventSplitter.test(name))
   {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++)
      {
         events = iteratee(events, names[i], callback, opts);
      }
   }
   else
   {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
   }
   return events;
}

/**
 * Provides  protected Object.keys functionality.
 *
 * @param {object}   object - Object to retrieve keys.
 *
 * @returns {string[]} Keys of object if any.
 */
export const objectKeys = (object) =>
{
   return object === null || typeof object !== 'object' ? [] : Object.keys(object);
};

/**
 * @typedef {object} EventData The callback data for an event.
 *
 * @property {Function} callback - Callback function
 * @property {object} context -
 * @property {object} ctx -
 * @property {object} listening -
 */

/**
 * @typedef {object.<string, EventData[]>} Events Event data stored by event name.
 */
