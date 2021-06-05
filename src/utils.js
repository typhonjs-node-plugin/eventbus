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
 * @template T
 *
 * @param {Function}       iteratee - Event operation to invoke.
 *
 * @param {T}              events - Events object
 *
 * @param {string|object}  name - A single event name, compound event names, or a hash of event names.
 *
 * @param {Function}       callback - Event callback function
 *
 * @param {object}         opts - Optional parameters
 *
 * @returns {T} Events object or processed data.
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
 * Returns a string to output for error messages including any eventbus name.
 *
 * @param {Eventbus|EventbusProxy|EventbusSecure} eventbus - The eventbus to format.
 *
 * @returns {string} A string representing the eventbus.
 */
export function getErrorName(eventbus)
{
   const name = eventbus.name;
   return name !== '' ? `[${name}] ` : '';
}

/**
 * The reducing API that returns the options for an event. Any guarded event sets guard and the higher type is set.
 *
 * @param {object}   output - The output object.
 *
 * @param {string}   name - Event name
 *
 * @param {Function} callback - Event callback
 *
 * @param {object}   opts - Optional parameters
 *
 * @returns {object} The output object.
 */
export function getOptions(output, name, callback, opts)
{
   const events = opts.events;

   if (events)
   {
      const handlers = events[name];

      if (Array.isArray(handlers))
      {
         for (const handler of handlers)
         {
            if (handler.options.guard)
            {
               output.guard = true;
            }

            if (handler.options.type > output.type)
            {
               output.type = handler.options.type;
            }
         }
      }
   }

   return output;
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
 * Reduces the event callbacks into a map of `{event: beforeWrapper}`. `after` unbinds the `beforeWrapper` after
 * it has been called the number of times specified by options.count.
 *
 * @param {Events}   map - Events object
 *
 * @param {string}   name - Event name
 *
 * @param {Function} callback - Event callback
 *
 * @param {object}   opts - Function to invoke after event has been triggered once; `off()`
 *
 * @returns {Events} The Events object.
 */
export function beforeMap(map, name, callback, opts)
{
   const after = opts.after;
   const count = opts.count + 1;

   if (callback)
   {
      const beforeWrapper = map[name] = s_BEFORE(count, function()
      {
         return callback.apply(this, arguments);
      }, () => { after(name, beforeWrapper); });

      beforeWrapper._callback = callback;
   }
   return map;
}

// Module Private ----------------------------------------------------------------------------------------------------

/**
 * Creates a function that invokes `before`, with the `this` binding and arguments of the created function, while
 * it's called less than `count` times. Subsequent calls to the created function return the result of the last `before`
 * invocation.
 *
 * `after` is invoked after the count is reduced.
 *
 * @param {number}   count - The number of calls at which `before` is no longer invoked and then `after` is invoked.
 *
 * @param {Function} before - The function to restrict.
 *
 * @param {Function} after - The function to invoke after count number of calls.
 *
 * @returns {Function} Returns the new restricted function.
 */
const s_BEFORE = function(count, before, after)
{
   let result;

   return function(...args)
   {
      if (--count > 0) { result = before.apply(this, args); }

      if (count <= 1)
      {
         if (after) { after.apply(this, args); }
         after = void 0;
         before = void 0;
      }

      return result;
   };
};
