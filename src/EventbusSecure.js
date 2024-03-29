/**
 * EventbusSecure provides a secure wrapper around another Eventbus instance.
 *
 * The main use case of EventbusSecure is to provide a secure eventbus window for public consumption. Only
 * events can be triggered, but not registered / unregistered.
 *
 * You must use the initialize method passing in an existing Eventbus instance as the eventbus reference is private.
 * In order to secure the eventbus from unwanted access there is no way to access the eventbus reference externally from
 * the EventbusSecure instance. The initialize method returns an {@link EventbusSecureObj} object which
 * contains two functions to control the secure eventbus externally; `destroy` and `setEventbus`. Expose to end
 * consumers just the `eventbusSecure` instance.
 */
export class EventbusSecure
{
   /**
    * Stores the target eventbus.
    *
    * @type {import('.').Eventbus | import('.').EventbusProxy}
    */
   #eventbus;

   /**
    * Stores a potentially alternate name instead of returning the wrapped Eventbus instance name.
    *
    * @type {string}
    */
   #name;

   /**
    * Creates the EventbusSecure instance with an existing instance of Eventbus. An object / EventbusSecureObj is
    * returned with an EventbusSecure reference and two functions for controlling the underlying Eventbus reference.
    *
    * `destroy()` will destroy the underlying Eventbus reference.
    * `setEventbus(<eventbus>)` will set the underlying reference.
    *
    * @param {import('.').Eventbus | import('.').EventbusProxy}  eventbus - The target eventbus instance.
    *
    * @param {string}                  [name] - If a name is provided this will be used instead of eventbus name.
    *
    * @returns {import('.').EventbusSecureObj} The control object which contains an EventbusSecure reference and
    *          control functions.
    */
   static initialize(eventbus, name = void 0)
   {
      if (name !== void 0 && typeof name !== 'string') { throw new TypeError(`'name' is not a string.`); }

      const eventbusSecure = new EventbusSecure();
      eventbusSecure.#eventbus = eventbus;
      eventbusSecure.#name = name === void 0 ? eventbus.name : name;
      Object.seal(eventbusSecure);

      return {
         destroy: function()
         {
            if (!eventbusSecure.isDestroyed)
            {
               eventbusSecure.#eventbus = null;

               if (this) { this.eventbusSecure = void 0; }
            }
         },

         /**
          * @param {import('.').Eventbus | import('.').EventbusProxy}   eventbus - Target eventbus.
          *
          * @param {string}   [name] - Eventbus name.
          */
         setEventbus: function(eventbus, name = void 0)
         {
            if (name !== void 0 && typeof name !== 'string') { throw new TypeError(`'name' is not a string.`); }

            if (!eventbusSecure.isDestroyed)
            {
               // Adopt the new eventbus name as the current name set matches the wrapped eventbus.
               if (name === void 0 && eventbusSecure.#name === eventbusSecure.#eventbus.name)
               {
                  eventbusSecure.#name = eventbus.name;
               }
               else if (name !== void 0)
               {
                  eventbusSecure.#name = name;
               }

               eventbusSecure.#eventbus = eventbus;
            }
         },

         eventbusSecure
      };
   }

   /**
    * Returns an iterable for the event names / keys of secured eventbus event listeners.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @yields {string}
    */
   *keys(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      for (const entry of this.#eventbus.keys(regex))
      {
         yield entry;
      }
   }

   /**
    * Returns an iterable for the event names / keys of registered event listeners along with event options.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @returns {Generator<[string, import('.').EventOptionsOut], void, unknown>} Generator
    * @yields {[string, import('.').EventOptionsOut]}
    */
   *keysWithOptions(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      for (const entry of this.#eventbus.keysWithOptions(regex))
      {
         yield entry;
      }
   }

   /**
    * Returns whether this instance has already been destroyed.
    *
    * @returns {boolean} Is destroyed state.
    */
   get isDestroyed()
   {
      return this.#eventbus === null;
   }

   /**
    * Returns the name associated with this instance.
    *
    * @returns {string} The target eventbus name.
    */
   get name()
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      return this.#name;
   }

   /**
    * Returns the options of an event name.
    *
    * @param {string}   name - Event name(s) to verify.
    *
    * @returns {import('.').EventOptionsOut} The event options.
    */
   getOptions(name)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      return this.#eventbus.getOptions(name);
   }

   /**
    * Returns the trigger type of event name.
    * Note: if trigger type is not set then undefined is returned for type otherwise 'sync' or 'async' is returned.
    *
    * @param {string}   name - Event name(s) to verify.
    *
    * @returns {string|undefined} The trigger type.
    */
   getType(name)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      return this.#eventbus.getType(name);
   }

   /**
    * Trigger callbacks for the given event, or space-delimited list of events. Subsequent arguments to trigger will be
    * passed along to the event callbacks.
    *
    * @param {string}   name - Event name(s)
    *
    * @param {...*}     args - Additional arguments passed to the event function(s).
    *
    * @returns {EventbusSecure} This instance.
    */
   trigger(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      this.#eventbus.trigger(name, ...args);

      return this;
   }

   /**
    * Provides `trigger` functionality, but collects any returned Promises from invoked targets and returns a
    * single Promise generated by `Promise.resolve` for a single value or `Promise.all` for multiple results. This is
    * a very useful mechanism to invoke asynchronous operations over an eventbus.
    *
    * @param {string}   name - Event name(s)
    *
    * @param {...*}     args - Additional arguments passed to the event function(s).
    *
    * @returns {Promise<void|*|*[]>} A Promise to returning any results.
    */
   triggerAsync(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      return this.#eventbus.triggerAsync(name, ...args);
   }

   /**
    * Defers invoking `trigger`. This is useful for triggering events in the next clock tick.
    *
    * @param {string}   name - Event name(s)
    *
    * @param {...*}     args - Additional arguments passed to the event function(s).
    *
    * @returns {EventbusSecure} This EventbusProxy.
    */
   triggerDefer(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      this.#eventbus.triggerDefer(name, ...args);

      return this;
   }

   /**
    * Provides `trigger` functionality, but collects any returned result or results from invoked targets as a single
    * value or in an array and passes it back to the callee in a synchronous manner.
    *
    * @param {string}   name - Event name(s)
    *
    * @param {...*}     args - Additional arguments passed to the event function(s).
    *
    * @returns {void|*|*[]} An Array of returned results.
    */
   triggerSync(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusSecure instance has been destroyed.'); }

      return this.#eventbus.triggerSync(name, ...args);
   }
}
