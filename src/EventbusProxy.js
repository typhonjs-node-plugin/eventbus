import * as Utils     from './utils.js';

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
 * eventbus which is passed in from the constructor. All registration methods (on / off / once) proxy. In addition,
 * there is a `destroy` method which will unregister all of proxied events and remove references to the managed
 * eventbus. Any further usage of a destroyed EventbusProxy instance results in a ReferenceError thrown.
 *
 * Finally, the EventbusProxy only allows events registered through it to be turned off providing a buffer between
 * any consumers such that they can not turn off other registrations made on the eventbus or other proxy instances.
 */
export class EventbusProxy
{
   /**
    * Stores the target eventbus.
    *
    * @type {import('.').Eventbus}
    * @private
    */
   #eventbus;

   /**
    * Stores all proxied event bindings.
    *
    * @type {EventbusEvents}
    * @private
    */
   #events;

   /**
    * Creates the event proxy with an existing instance of Eventbus.
    *
    * @param {import('.').Eventbus}   eventbus - The target eventbus instance.
    */
   constructor(eventbus)
   {
      this.#eventbus = eventbus;

      Object.seal(this);
   }

   /**
    * Just like `on`, but causes the bound callback to fire several times up to the count specified before being
    * removed. When multiple events are passed in using the space separated syntax, the event
    * will fire count times for every event you passed in, not once for a combination of all events.
    *
    * @param {number}            count - Number of times the function will fire before being removed.
    *
    * @param {string|import('.').EventMap}   name - Event name(s) or event map.
    *
    * @param {Function|object}   callback - Event callback function or context for event map.
    *
    * @param {object}            [context] - Event context
    *
    * @param {import('.').ProxyOnOptions}    [options] - Event registration options.
    *
    * @returns {EventbusProxy} This EventbusProxy instance.
    */
   before(count, name, callback, context = void 0, options = {})
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (!Number.isInteger(count)) { throw new TypeError(`'count' is not an integer`); }

      const data = {};
      if (this.#eventbus.isGuarded(name, data))
      {
         console.warn(`@typhonjs-plugin/eventbus ${Utils.getErrorName(this)}` +
          `- before() failed as event name(s) are guarded: ${JSON.stringify(data.names)}`);
         return this;
      }

      // Map the event into a `{event: beforeWrapper}` object.
      const events = Utils.eventsAPI(Utils.beforeMap, {}, name, callback, { count, after: this.off.bind(this) });

      if (typeof name === 'string' && (context === null || context === void 0)) { callback = void 0; }

      return this.on(events, callback, context, options);
   }

   /**
    * Creates an EventbusProxy wrapping the backing Eventbus instance. An EventbusProxy proxies events allowing all
    * listeners added to be easily removed from the wrapped Eventbus.
    *
    * @returns {EventbusProxy} A new EventbusProxy for this eventbus.
    */
   createProxy()
   {
      return new EventbusProxy(this.#eventbus);
   }

   /**
    * Unregisters all proxied events from the target eventbus and removes any local references. All subsequent calls
    * after `destroy` has been called result in a ReferenceError thrown.
    */
   destroy()
   {
      if (this.#eventbus !== null)
      {
         this.off();
      }

      this.#events = void 0;

      this.#eventbus = null;
   }

   /**
    * Returns an iterable for all events from the proxied eventbus yielding an array with event name, callback function,
    * and event context.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @returns {Generator<[string, Function, object, import('.').DataOutOptions], void, unknown>} Generator
    * @yields {[string, Function, object, import('.').DataOutOptions]}
    */
   *entries(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      for (const entry of this.#eventbus.entries(regex))
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
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this.#eventbus.eventCount;
   }

   /**
    * Returns the current proxied eventbus callback count.
    *
    * @returns {number} Returns the current proxied callback count.
    */
   get callbackCount()
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this.#eventbus.callbackCount;
   }

   /**
    * Returns an iterable for the event names / keys of proxied eventbus event listeners.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @yields {string}
    */
   *keys(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

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
    * @returns {Generator<[string, import('.').DataOutOptions], void, unknown>} Generator
    * @yields {[string, import('.').DataOutOptions]}
    */
   *keysWithOptions(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      for (const entry of this.#eventbus.keysWithOptions(regex))
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
      return this.#eventbus === null;
   }

   /**
    * Returns the target eventbus name.
    *
    * @returns {string} The target eventbus name.
    */
   get name()
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return `proxy-${this.#eventbus.name}`;
   }

   /**
    * Returns the current proxied event count.
    *
    * @returns {number} Returns the current proxied event count.
    */
   get proxyEventCount()
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      if (!this.#events) { return 0; }

      return Object.keys(this.#events).length;
   }

   /**
    * Returns the current proxied callback count.
    *
    * @returns {number} Returns the current proxied callback count.
    */
   get proxyCallbackCount()
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      if (!this.#events) { return 0; }

      let count = 0;

      for (const name in this.#events) { count += this.#events[name].length; }

      return count;
   }

   /**
    * Returns the options of an event name.
    *
    * @param {string}   name - Event name(s) to verify.
    *
    * @returns {import('.').DataOutOptions} The event options.
    */
   getOptions(name)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

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
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this.#eventbus.getType(name);
   }

   /**
    * Returns whether an event name is guarded.
    *
    * @param {string|import('.').EventMap}  name - Event name(s) or event map to verify.
    *
    * @param {object}         [data] - Stores the output of which names are guarded.
    *
    * @returns {boolean} Whether the given event name is guarded.
    */
   isGuarded(name, data = {})
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this.#eventbus.isGuarded(name, data);
   }

   /**
    * Remove a previously-bound proxied event binding.
    *
    * Please see {@link Eventbus#off}.
    *
    * @param {string|import('.').EventMap}  [name] - Event name(s) or event map.
    *
    * @param {Function}       [callback] - Event callback function
    *
    * @param {object}         [context] - Event context
    *
    * @returns {EventbusProxy} This EventbusProxy
    */
   off(name = void 0, callback = void 0, context = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      this.#events = Utils.eventsAPI(s_OFF_API, this.#events || {}, name, callback, {
         context,
         eventbus: this.#eventbus,
      });

      return this;
   }

   /**
    * Bind a callback function to an object. The callback will be invoked whenever the event is fired. If you have a
    * large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or
    * "change:selection".
    *
    * Please see {@link Eventbus#on}.
    *
    * @param {string|import('.').EventMap}   name - Event name(s) or event map.
    *
    * @param {Function|object}   callback - Event callback function or context for event map.
    *
    * @param {object}            [context] - Event context.
    *
    * @param {import('.').ProxyOnOptions}    [options] - Event registration options.
    *
    * @returns {EventbusProxy} This EventbusProxy
    */
   on(name, callback, context = void 0, options = {})
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      if (options == null || options.constructor !== Object)   // eslint-disable-line eqeqeq
      {
         throw new TypeError(`'options' must be an object literal.`);
      }

      const data = {};
      if (this.#eventbus.isGuarded(name, data))
      {
         console.warn(`@typhonjs-plugin/eventbus ${Utils.getErrorName(this)}` +
          `- on() failed as event name(s) are guarded: ${JSON.stringify(data.names)}`);
         return this;
      }

      // Hang onto the options as s_ON_API sets the context we need to pass to the eventbus in `opts.ctx`.
      const opts = { context, ctx: this, options };

      this.#events = Utils.eventsAPI(s_ON_API, this.#events || {}, name, callback, opts);

      this.#eventbus.on(name, callback, opts.ctx, options);

      return this;
   }

   /**
    * Just like `on`, but causes the bound callback to fire only once before being removed. Handy for saying "the next
    * time that X happens, do this". When multiple events are passed in using the space separated syntax, the event
    * will fire once for every event you passed in, not once for a combination of all events
    *
    * @param {string|import('.').EventMap}   name - Event name(s) or event map.
    *
    * @param {Function|object}   callback - Event callback function or context for event map.
    *
    * @param {object}            context - Event context
    *
    * @param {import('.').ProxyOnOptions}    [options] - Event registration options.
    *
    * @returns {EventbusProxy} This EventbusProxy instance.
    */
   once(name, callback, context = void 0, options = {})
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      const data = {};
      if (this.#eventbus.isGuarded(name, data))
      {
         console.warn(`@typhonjs-plugin/eventbus ${Utils.getErrorName(this)}` +
          `- once() failed as event name(s) are guarded: ${JSON.stringify(data.names)}`);
         return this;
      }

      // Map the event into a `{event: beforeWrapper}` object.
      const events = Utils.eventsAPI(Utils.beforeMap, {}, name, callback, { count: 1, after: this.off.bind(this) });

      if (typeof name === 'string' && (context === null || context === void 0)) { callback = void 0; }

      return this.on(events, callback, context, options);
   }

   /**
    * Returns an iterable for all stored locally proxied events yielding an array with event name, callback
    * function, and event context.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @returns {Generator<[string, Function, object, import('.').DataOutOptions], void, unknown>} Generator
    * @yields {[string, Function, object, import('.').DataOutOptions]}
    */
   *proxyEntries(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#events) { return; }

      if (regex)
      {
         for (const name in this.#events)
         {
            if (regex.test(name))
            {
               for (const event of this.#events[name])
               {
                  yield [name, event.callback, event.context, JSON.parse(JSON.stringify(event.options))];
               }
            }
         }
      }
      else
      {
         for (const name in this.#events)
         {
            for (const event of this.#events[name])
            {
               yield [name, event.callback, event.context, JSON.parse(JSON.stringify(event.options))];
            }
         }
      }
   }

   /**
    * Returns an iterable for the event names / keys of the locally proxied event names.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @yields {string}
    */
   *proxyKeys(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (!this.#events) { return; }

      if (regex)
      {
         for (const name in this.#events)
         {
            if (regex.test(name))
            {
               yield name;
            }
         }
      }
      else
      {
         for (const name in this.#events)
         {
            yield name;
         }
      }
   }

   /**
    * Returns an iterable for the event names / keys of the locally proxied event names with event options.
    *
    * Note: The event options returned will respect all the event options from a registered event on the main
    * eventbus if applicable.
    *
    * @param {RegExp} [regex] - Optional regular expression to filter event names.
    *
    * @returns {Generator<[string, import('.').DataOutOptions], void, unknown>} Generator
    * @yields {[string, import('.').DataOutOptions]}
    */
   *proxyKeysWithOptions(regex = void 0)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }
      if (regex !== void 0 && !(regex instanceof RegExp)) { throw new TypeError(`'regex' is not a RegExp`); }

      if (regex)
      {
         for (const name in this.#events)
         {
            if (regex.test(name))
            {
               yield [name, this.#eventbus.getOptions(name)];
            }
         }
      }
      else
      {
         for (const name in this.#events)
         {
            yield [name, this.#eventbus.getOptions(name)];
         }
      }
   }

   /**
    * Trigger callbacks for the given event, or space-delimited list of events. Subsequent arguments to trigger will be
    * passed along to the event callbacks.
    *
    * @param {string}   name - Event name(s)
    *
    * @param {...*}     args - Additional arguments passed to the event function(s).
    *
    * @returns {EventbusProxy} This EventbusProxy.
    */
   trigger(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

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
    * @returns {Promise<void|*|*[]>} A Promise returning any results.
    */
   triggerAsync(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this.#eventbus.triggerAsync(name, ...args);
   }

   /**
    * Defers invoking `trigger`. This is useful for triggering events in the next clock tick.
    *
    * @param {string}   name - Event name(s)
    *
    * @param {...*}     args - Additional arguments passed to the event function(s).
    *
    * @returns {EventbusProxy} This EventbusProxy.
    */
   triggerDefer(name, ...args)
   {
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

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
      if (this.isDestroyed) { throw new ReferenceError('This EventbusProxy instance has been destroyed.'); }

      return this.#eventbus.triggerSync(name, ...args);
   }
}

/**
 * The reducing API that removes a callback from the `events` object. And delegates invoking off to the eventbus
 * reference.
 *
 * @param {EventbusEvents}   events - EventbusEvents object
 *
 * @param {string}   name - Event name
 *
 * @param {Function} callback - Event callback
 *
 * @param {object}   opts - Optional parameters
 *
 * @returns {void|EventbusEvents} EventbusEvents object
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

         if ((callback && callback !== handler.callback && callback !== handler.callback._callback) ||
          (context && context !== handler.context))
         {
            remaining.push(handler);
            continue;
         }

         // Must explicitly remove the event by the stored full set of name, handler, context to ensure
         // non-proxied event registrations are not removed.
         /* c8 ignore next 1 */
         eventbus.off(name, handler.callback || handler.callback._callback, handler.context || handler.ctx);
      }

      // Replace events if there are any remaining.  Otherwise, clean up.
      if (remaining.length)
      {
         events[name] = remaining;
      }
      else
      {
         // eventbus.off(name, callback, context);
         delete events[name];
      }
   }

   return events;
};

/**
 * The reducing API that adds a callback to the `events` object.
 *
 * @param {EventbusEvents}   events - EventbusEvents object
 *
 * @param {string}   name - Event name
 *
 * @param {Function} callback - Event callback
 *
 * @param {object}   opts - Optional parameters
 *
 * @returns {EventbusEvents} EventbusEvents object.
 */
const s_ON_API = (events, name, callback, opts) =>
{
   if (callback)
   {
      const handlers = events[name] || (events[name] = []);
      const context = opts.context, ctx = opts.ctx;

      // Make a copy of options.
      const options = JSON.parse(JSON.stringify(opts.options));

      // Ensure that guard is set.
      options.guard = options.guard !== void 0 && typeof options.guard === 'boolean' ? options.guard : false;

      // Ensure that type is set.
      switch (options.type)
      {
         case 'sync':
            options.type = 1;
            break;
         case 'async':
            options.type = 2;
            break;
         default:
            options.type = 0;
            break;
      }

      // Set opts `ctx` as this is what we send to the eventbus.
      opts.ctx = context || ctx;

      handlers.push({ callback, context, ctx: opts.ctx, options });
   }

   return events;
};
