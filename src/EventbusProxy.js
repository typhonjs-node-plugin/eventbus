import * as Utils from './utils.js';

/**
 * EventbusProxy provides a protected proxy of another Eventbus instance.
 *
 * The main use case of EventbusProxy is to allow indirect access to an eventbus. This is handy when it comes to
 * managing the event lifecycle for a plugin system. When a plugin is added it could receive a callback, perhaps named
 * `onPluginLoaded`, which contains an EventbusProxy instance rather than the direct eventbus. This EventbusProxy
 * instance is associated in the management system controlling plugin lifecycle. When a plugin is removed / unloaded the
 * management system can automatically unregister all events for the plugin without requiring the plugin author doing it
 * correctly if they had full control. IE This allows to plugin system to guarantee no dangling listeners.
 *
 * EventbusProxy provides the on / off, before, once, and trigger methods with the same signatures as found in
 * Eventbus. However, the proxy tracks all added event bindings which is used to proxy between the target
 * eventbus which is passed in from the constructor. All registration methods (on / off / once) proxy. In addition
 * there is a `destroy` method which will unregister all of proxied events and remove references to the managed
 * eventbus. Any further usage of a destroyed EventbusProxy instance results in a ReferenceError thrown.
 *
 * Finally the EventbusProxy only allows events registered through it to be turned off providing a buffer between
 * any consumers such that they can not turn off other registrations made on the eventbus or other proxy instances.
 */
export default class EventbusProxy
{
   /**
    * Creates the event proxy with an existing instance of Eventbus.
    *
    * @param {Eventbus}   eventbus - The target eventbus instance.
    */
   constructor(eventbus)
   {
      /**
       * Stores the target eventbus.
       *
       * @type {Eventbus}
       * @private
       */
      this._eventbus = eventbus;

      /**
       * Stores all proxied event bindings.
       *
       * @type {Events}
       * @private
       */
      this._events = void 0;
   }

   /**
    * Just like `on`, but causes the bound callback to fire several times up to the count specified before being
    * removed. When multiple events are passed in using the space separated syntax, the event
    * will fire count times for every event you passed in, not once for a combination of all events.
    *
    * @param {number}         count Number of times the function will fire before being removed.
    *
    * @param {string|object}  name Event name(s) or event map
    *
    * @param {Function}       callback Event callback function
    *
    * @param {object}         context Event context
    *
    * @returns {EventbusProxy} This Eventbus instance.
    */
   before(count, name, callback, context = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (!Number.isInteger(count)) { throw new TypeError(`'count' is not an integer`); }

      // Map the event into a `{event: beforeWrapper}` object.
      const events = Utils.eventsAPI(Utils.beforeMap, {}, name, callback, {
         count,
         after: this.off.bind(this)
      });

      if (typeof name === 'string' && (context === null || context === void 0)) { callback = void 0; }

      return this.on(events, callback, context);
   }

   /**
    * Unregisters all proxied events from the target eventbus and removes any local references. All subsequent calls
    * after `destroy` has been called result in a ReferenceError thrown.
    */
   destroy()
   {
      if (this._eventbus !== null)
      {
         this.off();
      }

      this._events = void 0;

      this._eventbus = null;
   }

   /**
    * Returns an iterable for all events from the proxied eventbus yielding an array with event name, callback function,
    * and event context.
    *
    * @param {RegExp} [regex] Optional regular expression to filter event names.
    *
    * @yields
    */
   *entries(regex = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      for (const entry of this._eventbus.entries(regex))
      {
         yield entry;
      }
   }

   /**
    * Returns the current proxied eventbus event count.
    *
    * @returns {number} Returns the current proxied event count.
    */
   get eventCount()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this._eventbus.eventCount;
   }

   /**
    * Returns an iterable for the event names / keys of proxied eventbus event listeners.
    *
    * @param {RegExp} [regex] Optional regular expression to filter event names.
    *
    * @yields
    */
   *keys(regex = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      for (const entry of this._eventbus.keys(regex))
      {
         yield entry;
      }
   }

   /**
    * Returns whether this EventbusProxy has already been destroyed.
    *
    * @returns {boolean} Is destroyed state.
    */
   get isDestroyed()
   {
      return this._eventbus === null;
   }

   /**
    * Returns the target eventbus name.
    *
    * @returns {string|*} The target eventbus name.
    */
   get name()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this._eventbus.name;
   }

   /**
    * Remove a previously-bound proxied event binding.
    *
    * Please see {@link Eventbus#off}.
    *
    * @param {string|object}  name Event name(s) or event map
    *
    * @param {Function}       [callback] Event callback function
    *
    * @param {object}         [context] Event context
    *
    * @returns {EventbusProxy} This EventbusProxy
    */
   off(name = void 0, callback = void 0, context = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      this._events = Utils.eventsAPI(s_OFF_API, this._events || {}, name, callback, {
         context,
         eventbus: this._eventbus
      });

      return this;
   }

   /**
    * Bind a callback function to an object. The callback will be invoked whenever the event is fired. If you have a
    * large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or
    * "change:selection".
    *
    * This is proxied through `listenTo` of an internal Events instance instead of directly modifying the target
    * eventbus.
    *
    * Please see {@link Eventbus#on}.
    *
    * @param {string|object}  name Event name(s) or event map
    *
    * @param {Function}       callback Event callback function
    *
    * @param {object}         context  Event context
    *
    * @returns {EventbusProxy} This EventbusProxy
    */
   on(name, callback, context = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      let targetContext;

      // Handle the case of event maps and callback being the context. Also applies this EventbusProxy as the default
      // context when none supplied.
      if (name !== null && typeof name === 'object')
      {
         targetContext = callback !== void 0 ? callback : this;
      }
      else
      {
         targetContext = context || this;
      }

      this._events = Utils.eventsAPI(s_ON_API, this._events || {}, name, callback, { context: targetContext });

      this._eventbus.on(name, callback, targetContext);

      return this;
   }

   /**
    * Just like `on`, but causes the bound callback to fire only once before being removed. Handy for saying "the next
    * time that X happens, do this". When multiple events are passed in using the space separated syntax, the event
    * will fire once for every event you passed in, not once for a combination of all events
    *
    * @see http://backbonejs.org/#Events-once
    *
    * @param {string|object}  name Event name(s) or event map
    *
    * @param {Function}       callback Event callback function
    *
    * @param {object}         context Event context
    *
    * @returns {EventbusProxy} This Eventbus instance.
    */
   once(name, callback, context = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      // Map the event into a `{event: beforeWrapper}` object.
      const events = Utils.eventsAPI(Utils.beforeMap, {}, name, callback, {
         count: 1,
         after: this.off.bind(this)
      });

      if (typeof name === 'string' && (context === null || context === void 0)) { callback = void 0; }

      return this.on(events, callback, context);
   }

   /**
    * Returns an iterable for all stored locally proxied events yielding an array with event name, callback
    * function, and event context.
    *
    * @param {RegExp} [regex] Optional regular expression to filter event names.
    *
    * @yields
    */
   *proxyEntries(regex = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this._events) { return; }

      if (regex)
      {
         for (const name in this._events)
         {
            if (regex.test(name))
            {
               for (const event of this._events[name])
               {
                  yield [name, event.callback, event.context];
               }
            }
         }
      }
      else
      {
         for (const name in this._events)
         {
            for (const event of this._events[name])
            {
               yield [name, event.callback, event.context];
            }
         }
      }
   }

   /**
    * Returns the current proxied event count.
    *
    * @returns {number} Returns the current proxied event count.
    */
   get proxyEventCount()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      if (!this._events) { return 0; }

      let count = 0;

      for (const name in this._events) { count += this._events[name].length; }

      return count;
   }

   /**
    * Returns an iterable for the event names / keys of the locally proxied event names.
    *
    * @param {RegExp} [regex] Optional regular expression to filter event names.
    *
    * @yields
    */
   *proxyKeys(regex = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this._events) { return; }

      if (regex)
      {
         for (const name in this._events)
         {
            if (regex.test(name))
            {
               yield name;
            }
         }
      }
      else
      {
         for (const name in this._events)
         {
            yield name;
         }
      }
   }

   /**
    * Trigger callbacks for the given event, or space-delimited list of events. Subsequent arguments to trigger will be
    * passed along to the event callbacks.
    *
    * Please see {@link Eventbus#trigger}.
    *
    * @returns {EventbusProxy} This EventbusProxy.
    */
   trigger()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      this._eventbus.trigger(...arguments);

      return this;
   }

   /**
    * Provides `trigger` functionality, but collects any returned Promises from invoked targets and returns a
    * single Promise generated by `Promise.resolve` for a single value or `Promise.all` for multiple results. This is
    * a very useful mechanism to invoke asynchronous operations over an eventbus.
    *
    * Please see {@link Eventbus#triggerAsync}.
    *
    * @returns {Promise} A Promise to returning any results.
    */
   triggerAsync()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this._eventbus.triggerAsync(...arguments);
   }

   /**
    * Defers invoking `trigger`. This is useful for triggering events in the next clock tick.
    *
    * Please see {@link Eventbus#triggerDefer}.
    *
    * @returns {EventbusProxy} This EventbusProxy.
    */
   triggerDefer()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      this._eventbus.triggerDefer(...arguments);

      return this;
   }

   /**
    * Provides `trigger` functionality, but collects any returned result or results from invoked targets as a single
    * value or in an array and passes it back to the callee in a synchronous manner.
    *
    * Please see {@link Eventbus#triggerSync}.
    *
    * @returns {*|Array.<*>} An Array of returned results.
    */
   triggerSync()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this._eventbus.triggerSync(...arguments);
   }
}

/**
 * The reducing API that removes a callback from the `events` object.
 *
 * @param {Events}   events Events object
 *
 * @param {string}   name Event name
 *
 * @param {Function} callback Event callback
 *
 * @param {object}   opts  Optional parameters
 *
 * @returns {void|Events} Events object
 */
const s_OFF_API = (events, name, callback, opts) =>
{
   /* c8 ignore next 1 */
   if (!events) { return; }

   const context = opts.context;
   const eventbus = opts.eventbus;

   const names = name ? [name] : Utils.objectKeys(events);

   for (let i = 0; i < names.length; i++)
   {
      name = names[i];
      const handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) { break; }

      // Find any remaining events.
      const remaining = [];
      for (let j = 0; j < handlers.length; j++)
      {
         const handler = handlers[j];

         if (callback && callback !== handler.callback && callback !== handler.callback._callback ||
          context && context !== handler.context)
         {
            remaining.push(handler);
         }
      }

      // Replace events if there are any remaining.  Otherwise, clean up.
      if (remaining.length)
      {
         events[name] = remaining;
      }
      else
      {
         eventbus.off(name, callback, context);
         delete events[name];
      }
   }

   return events;
};

/**
 * The reducing API that adds a callback to the `events` object.
 *
 * @param {Events}   events Events object
 *
 * @param {string}   name Event name
 *
 * @param {Function} callback Event callback
 *
 * @param {object}   opts Optional parameters
 *
 * @returns {Events} Events object.
 */
const s_ON_API = (events, name, callback, opts) =>
{
   if (callback)
   {
      const handlers = events[name] || (events[name] = []);
      const context = opts.context;

      handlers.push({ callback, context });
   }

   return events;
};

/**
 * @typedef {object} EventData The callback data for an event.
 *
 * @property {Function} callback - Callback function
 * @property {object} context - The context of the callback function.
 */

/**
 * @typedef {object.<string, EventData[]>} Events Event data stored by event name.
 */
