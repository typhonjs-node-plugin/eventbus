import Eventbus from './Eventbus.js';

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
 * EventbusProxy provides the on / off, once, and trigger methods with the same signatures as found in
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
    * Creates the event proxy with an existing instance of TyphonEvents.
    *
    * @param {Eventbus}   eventbus - The target eventbus instance.
    */
   constructor(eventbus)
   {
      if (!(eventbus instanceof Eventbus))
      {
         throw new TypeError(`'eventbus' is not an instance of Eventbus.`);
      }

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
       * @type {Array<{name: string, callback: Function, context: *}>}
       * @private
       */
      this._events = [];
   }

   /**
    * Unregisters all proxied events from the target eventbus and removes any local references. All subsequent calls
    * after `destroy` has been called result in a ReferenceError thrown.
    */
   destroy()
   {
      if (this._eventbus !== null)
      {
         for (const event of this._events) { this._eventbus.off(event.name, event.callback, event.context); }
      }

      this._events = [];

      this._eventbus = null;
   }

   /**
    * Iterates over all of events from the proxied eventbus yielding an array with event name, callback function, and
    * event context.
    *
    * @param {string} [eventName] Optional event name to iterate over.
    *
    * @yields
    */
   *entries(eventName = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      for (const entry of this._eventbus.entries(eventName))
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
    * Returns the event names of proxied eventbus event listeners.
    *
    * @returns {string[]} Returns the event names of proxied event listeners.
    */
   get eventNames()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this._eventbus.eventNames;
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
    * @param {string}   [name]     - Event name(s)
    *
    * @param {Function} [callback] - Event callback function
    *
    * @param {object}   [context]  - Event context
    *
    * @returns {EventbusProxy} This EventbusProxy.
    */
   off(name = void 0, callback = void 0, context = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      const hasName = typeof name !== 'undefined' && name !== null;
      const hasCallback = typeof callback !== 'undefined' && callback !== null;
      const hasContext = typeof context !== 'undefined' && context !== null;

      // Remove all events if `off()` is invoked.
      if (!hasName && !hasCallback && !hasContext)
      {
         for (const event of this._events) { this._eventbus.off(event.name, event.callback, event.context); }
         this._events = [];
      }
      else
      {
         const values = {};
         if (hasName) { values.name = name; }
         if (hasCallback) { values.callback = callback; }
         if (hasContext) { values.context = context; }

         for (let cntr = this._events.length; --cntr >= 0;)
         {
            const event = this._events[cntr];

            let foundMatch = true;

            for (const key in values)
            {
               if (event[key] !== values[key]) { foundMatch = false; break; }
            }

            if (foundMatch)
            {
               this._eventbus.off(values.name, values.callback, values.context);
               this._events.splice(cntr, 1);
            }
         }
      }

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
    * @param {string}   name     - Event name(s)
    * @param {Function} callback - Event callback function
    * @param {object}   context  - Event context
    * @returns {EventbusProxy} This EventbusProxy.
    */
   on(name, callback, context = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      this._eventbus.on(name, callback, context);

      this._events.push({ name, callback, context });

      return this;
   }

   /**
    * Iterates over all stored proxy events yielding an array with event name, callback function, and event context.
    *
    * @param {string} [eventName] Optional event name to iterate over.
    *
    * @yields
    */
   *proxyEntries(eventName = void 0)
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      /* c8 ignore next */
      if (!this._events) { return; }

      if (eventName)
      {
         for (const event of this._events)
         {
            if (eventName === event.name) { yield [event.name, event.callback, event.context]; }
         }
      }
      else
      {
         for (const event of this._events)
         {
            yield [event.name, event.callback, event.context];
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

      return this._events.length;
   }

   /**
    * Returns the event names of proxied event listeners.
    *
    * @returns {string[]} Returns the event names of proxied event listeners.
    */
   get proxyEventNames()
   {
      if (this._eventbus === null) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      if (!this._events) { return []; }

      const eventNames = {};

      for (const event of this._events) { eventNames[event.name] = true; }

      return Object.keys(eventNames);
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
