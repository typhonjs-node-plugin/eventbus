import EventbusProxy from './EventbusProxy.js';

/**
 * `@typhonjs-plugin/eventbus` / Provides the ability to bind and trigger custom named events.
 *
 * This module is an evolution of Backbone Events. (http://backbonejs.org/#Events). Eventbus extends the
 * functionality provided in Backbone Events with additional triggering methods to receive asynchronous and
 * synchronous results.
 *
 * ---------------
 */
export default class Eventbus
{
   /**
    * Provides a constructor which optionally takes the eventbus name.
    *
    * @param {string}   eventbusName - Optional eventbus name.
    */
   constructor(eventbusName = void 0)
   {
      /**
       * Stores the name of this eventbus.
       *
       * @type {string}
       * @private
       */
      this._eventbusName = eventbusName;
   }

   /**
    * Creates an EventProxy wrapping this events instance. An EventProxy proxies events allowing all listeners added
    * to be easily removed from the wrapped Events instance.
    *
    * @returns {EventbusProxy} A new EventbusProxy for this eventbus.
    */
   createProxy()
   {
      return new EventbusProxy(this);
   }

   /**
    * Iterates over all stored events yielding an array with event name, callback function, and event context.
    *
    * @param {string} [eventName] Optional event name to iterate over.
    *
    * @yields
    */
   *entries(eventName = void 0)
   {
      /* c8 ignore next */
      if (!this._events) { return; }

      if (eventName)
      {
         for (const event of this._events[eventName])
         {
            yield [eventName, event.callback, event.ctx];
         }
      }
      else
      {
         for (const name in this._events)
         {
            for (const event of this._events[name])
            {
               yield [name, event.callback, event.ctx];
            }
         }
      }
   }

   /**
    * Returns the current event count.
    *
    * @returns {number} The current proxied event count.
    */
   get eventCount()
   {
      let count = 0;

      for (const name in this._events) { count += this._events[name].length; }

      return count;
   }

   /**
    * Returns the event names of registered event listeners.
    *
    * @returns {string[]} The event names of registered event listeners.
    */
   get eventNames()
   {
      /* c8 ignore next */
      if (!this._events) { return []; }

      return Object.keys(this._events);
   }

   /**
    * Returns the current eventbus name.
    *
    * @returns {string|*} The current eventbus name.
    */
   get name()
   {
      return this._eventbusName;
   }

   /**
    * Tell an object to listen to a particular event on an other object. The advantage of using this form, instead of
    * other.on(event, callback, object), is that listenTo allows the object to keep track of the events, and they can
    * be removed all at once later on. The callback will always be called with object as context.
    *
    * @example
    * view.listenTo(model, 'change', view.render);
    *
    * @see http://backbonejs.org/#Events-listenTo
    *
    * @param {object}   obj         - Event context
    * @param {string}   name        - Event name(s)
    * @param {Function} callback    - Event callback function
    * @param {object}   [context]   - Optional: event context
    * @returns {Eventbus} This Eventbus instance.
    */
   listenTo(obj, name, callback, context = this)
   {
      if (!obj) { return this; }
      const id = obj._listenId || (obj._listenId = s_UNIQUE_ID('l'));
      const listeningTo = this._listeningTo || (this._listeningTo = {});
      let listening = listeningTo[id];

      // This object is not listening to any other events on `obj` yet.
      // Setup the necessary references to track the listening callbacks.
      if (!listening)
      {
         const thisId = this._listenId || (this._listenId = s_UNIQUE_ID('l'));
         listening = listeningTo[id] = { obj, objId: id, id: thisId, listeningTo, count: 0 };
      }

      // Bind callbacks on obj, and keep track of them on listening.
      s_INTERNAL_ON(obj, name, callback, context, listening);
      return this;
   }

   /**
    * Just like `listenTo`, but causes the bound callback to fire only once before being removed.
    *
    * @see http://backbonejs.org/#Events-listenToOnce
    *
    * @param {object}   obj      - Event context
    * @param {string}   name     - Event name(s)
    * @param {Function} callback - Event callback function
    * @param {object}   [context=this] - Optional: event context
    * @returns {Eventbus} This Eventbus instance.
    */
   listenToOnce(obj, name, callback, context = this)
   {
      // Map the event into a `{event: once}` object.
      const events = s_EVENTS_API(s_ONCE_MAP, {}, name, callback, this.stopListening.bind(this, obj));

      return this.listenTo(obj, events, void 0, context);
   }

   /**
    * Remove a previously-bound callback function from an object. If no context is specified, all of the versions of
    * the callback with different contexts will be removed. If no callback is specified, all callbacks for the event
    * will be removed. If no event is specified, callbacks for all events will be removed.
    *
    * Note that calling model.off(), for example, will indeed remove all events on the model — including events that
    * Backbone uses for internal bookkeeping.
    *
    * @example
    * // Removes just the `onChange` callback.
    * object.off("change", onChange);
    *
    * // Removes all "change" callbacks.
    * object.off("change");
    *
    * // Removes the `onChange` callback for all events.
    * object.off(null, onChange);
    *
    * // Removes all callbacks for `context` for all events.
    * object.off(null, null, context);
    *
    * // Removes all callbacks on `object`.
    * object.off();
    *
    * @see http://backbonejs.org/#Events-off
    *
    * @param {string}   name     - Event name(s)
    * @param {Function} callback - Event callback function
    * @param {object}   context  - Event context
    * @returns {Eventbus} This Eventbus instance.
    */
   off(name, callback = void 0, context = void 0)
   {
      /* c8 ignore next */
      if (!this._events) { return this; }

      /**
       * @type {*}
       * @protected
       */
      this._events = s_EVENTS_API(s_OFF_API, this._events, name, callback, { context, listeners: this._listeners });

      return this;
   }

   /**
    * Bind a callback function to an object. The callback will be invoked whenever the event is fired. If you have a
    * large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or
    * "change:selection".
    *
    * To supply a context value for this when the callback is invoked, pass the optional last argument:
    * model.on('change', this.render, this) or model.on({change: this.render}, this).
    *
    * @example
    * The event string may also be a space-delimited list of several events...
    * book.on("change:title change:author", ...);
    *
    * @example
    * Callbacks bound to the special "all" event will be triggered when any event occurs, and are passed the name of
    * the event as the first argument. For example, to proxy all events from one object to another:
    * proxy.on("all", function(eventName) {
    *    object.trigger(eventName);
    * });
    *
    * @example
    * All Backbone event methods also support an event map syntax, as an alternative to positional arguments:
    * book.on({
    *    "change:author": authorPane.update,
    *    "change:title change:subtitle": titleView.update,
    *    "destroy": bookView.remove
    * });
    *
    * @see http://backbonejs.org/#Events-on
    *
    * @param {string}   name     - Event name(s)
    * @param {Function} callback - Event callback function
    * @param {object}   context  - Event context
    * @returns {Eventbus} This Eventbus instance.
    */
   on(name, callback, context = void 0)
   {
      return s_INTERNAL_ON(this, name, callback, context, void 0);
   }

   /**
    * Just like `on`, but causes the bound callback to fire only once before being removed. Handy for saying "the next
    * time that X happens, do this". When multiple events are passed in using the space separated syntax, the event
    * will fire once for every event you passed in, not once for a combination of all events
    *
    * @see http://backbonejs.org/#Events-once
    *
    * @param {string}   name     - Event name(s)
    * @param {Function} callback - Event callback function
    * @param {object}   context  - Event context
    * @returns {Eventbus} This Eventbus instance.
    */
   once(name, callback, context = void 0)
   {
      // Map the event into a `{event: once}` object.
      const events = s_EVENTS_API(s_ONCE_MAP, {}, name, callback, this.off.bind(this));

      if (typeof name === 'string' && (context === null || typeof context === 'undefined')) { callback = void 0; }

      return this.on(events, callback, context);
   }

   /**
    * Tell an object to stop listening to events. Either call stopListening with no arguments to have the object remove
    * all of its registered callbacks ... or be more precise by telling it to remove just the events it's listening to
    * on a specific object, or a specific event, or just a specific callback.
    *
    * @example
    * view.stopListening();
    *
    * view.stopListening(model);
    *
    * @see http://backbonejs.org/#Events-stopListening
    *
    * @param {object}   obj            - Event context
    * @param {string}   name           - Event name(s)
    * @param {Function} callback       - Event callback function
    * @param {object}   [context=this] - Optional: event context
    * @returns {Eventbus} This Eventbus instance.
    */
   stopListening(obj, name = void 0, callback = void 0, context = this)
   {
      const listeningTo = this._listeningTo;
      if (!listeningTo) { return this; }

      const ids = obj ? [obj._listenId] : Object.keys(listeningTo);

      for (let i = 0; i < ids.length; i++)
      {
         const listening = listeningTo[ids[i]];

         // If listening doesn't exist, this object is not currently listening to obj. Break out early.
         if (!listening) { break; }

         listening.obj.off(name, callback, context);
      }

      return this;
   }

   /**
    * Trigger callbacks for the given event, or space-delimited list of events. Subsequent arguments to trigger will be
    * passed along to the event callbacks.
    *
    * @see http://backbonejs.org/#Events-trigger
    *
    * @param {string}   name  - Event name(s)
    * @returns {Eventbus} This Eventbus instance.
    */
   trigger(name)
   {
      /* c8 ignore next */
      if (!this._events) { return this; }

      const length = Math.max(0, arguments.length - 1);
      const args = new Array(length);

      for (let i = 0; i < length; i++) { args[i] = arguments[i + 1]; }

      s_EVENTS_TARGET_API(s_TRIGGER_API, s_TRIGGER_EVENTS, this._events, name, void 0, args);

      return this;
   }

   /**
    * Provides `trigger` functionality, but collects any returned Promises from invoked targets and returns a
    * single Promise generated by `Promise.resolve` for a single value or `Promise.all` for multiple results. This is
    * a very useful mechanism to invoke asynchronous operations over an eventbus.
    *
    * @param {string}   name  - Event name(s)
    * @returns {Promise} A Promise with any results.
    */
   async triggerAsync(name)
   {
      /* c8 ignore next */
      if (!this._events) { return Promise.resolve([]); }

      const length = Math.max(0, arguments.length - 1);
      const args = new Array(length);
      for (let i = 0; i < length; i++) { args[i] = arguments[i + 1]; }

      const promise = s_EVENTS_TARGET_API(s_TRIGGER_API, s_TRIGGER_ASYNC_EVENTS, this._events, name, void 0, args);

      return promise !== void 0 ? promise : Promise.resolve();
   }

   /**
    * Defers invoking `trigger`. This is useful for triggering events in the next clock tick.
    *
    * @returns {Eventbus} This Eventbus instance.
    */
   triggerDefer()
   {
      setTimeout(() => { this.trigger(...arguments); }, 0);

      return this;
   }

   /**
    * Provides `trigger` functionality, but collects any returned result or results from invoked targets as a single
    * value or in an array and passes it back to the callee in a synchronous manner.
    *
    * @param {string}   name  - Event name(s)
    * @returns {*|Array<*>} The results of the event invocation.
    */
   triggerSync(name)
   {
      /* c8 ignore next */
      if (!this._events) { return void 0; }

      const start = 1;
      const length = Math.max(0, arguments.length - 1);
      const args = new Array(length);
      for (let i = 0; i < length; i++) { args[i] = arguments[i + start]; }

      return s_EVENTS_TARGET_API(s_TRIGGER_API, s_TRIGGER_SYNC_EVENTS, this._events, name, void 0, args);
   }
}

// Private / internal methods ---------------------------------------------------------------------------------------

/**
 * Regular expression used to split event strings.
 *
 * @type {RegExp}
 */
const s_EVENT_SPLITTER = /\s+/;

/**
 * Iterates over the standard `event, callback` (as well as the fancy multiple space-separated events `"change blur",
 * callback` and jQuery-style event maps `{event: callback}`).
 *
 * @param {Function} iteratee    - Event operation to invoke.
 * @param {object.<{callback: Function, context: object, ctx: object, listening:{}}>} events - Events object
 * @param {string|object} name   - A single event name, compound event names, or a hash of event names.
 * @param {Function} callback    - Event callback function
 * @param {object}   opts        - Optional parameters
 * @returns {*} The Events object.
 */
const s_EVENTS_API = (iteratee, events, name, callback, opts) =>
{
   let i = 0, names;
   if (name && typeof name === 'object')
   {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) { opts.context = callback; }
      for (names = Object.keys(name); i < names.length; i++)
      {
         events = s_EVENTS_API(iteratee, events, names[i], name[names[i]], opts);
      }
   }
   else if (name && s_EVENT_SPLITTER.test(name))
   {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(s_EVENT_SPLITTER); i < names.length; i++)
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
};

/**
 * Iterates over the standard `event, callback` (as well as the fancy multiple space-separated events `"change blur",
 * callback` and jQuery-style event maps `{event: callback}`).
 *
 * @param {Function} iteratee       - Trigger API
 * @param {Function} iterateeTarget - Internal function which is dispatched to.
 * @param {Array<*>} events         - Array of stored event callback data.
 * @param {string}   name           - Event name(s)
 * @param {Function} callback       - callback
 * @param {object}   opts           - Optional parameters
 * @returns {*} The Events object.
 */
const s_EVENTS_TARGET_API = (iteratee, iterateeTarget, events, name, callback, opts) =>
{
   let i = 0, names;

   if (name && typeof name === 'object')
   {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) { opts.context = callback; }
      for (names = Object.keys(name); i < names.length; i++)
      {
         events = s_EVENTS_API(iteratee, iterateeTarget, events, names[i], name[names[i]], opts);
      }
   }
   else if (name && s_EVENT_SPLITTER.test(name))
   {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(s_EVENT_SPLITTER); i < names.length; i++)
      {
         events = iteratee(iterateeTarget, events, names[i], callback, opts);
      }
   }
   else
   {
      // Finally, standard events.
      events = iteratee(iterateeTarget, events, name, callback, opts);
   }

   return events;
};

/**
 * Guard the `listening` argument from the public API.
 *
 * @param {Eventbus}   obj    - The Eventbus instance
 * @param {string}   name     - Event name
 * @param {Function} callback - Event callback
 * @param {object}   context  - Event context
 * @param {object.<{obj: object, objId: string, id: string, listeningTo: object, count: number}>} listening -
 *                              Listening object
 * @returns {Eventbus} The Eventbus instance.
 */
const s_INTERNAL_ON = (obj, name, callback, context, listening) =>
{
   obj._events = s_EVENTS_API(s_ON_API, obj._events || {}, name, callback, { context, ctx: obj, listening });

   if (listening)
   {
      const listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
   }

   return obj;
};

/**
 * The reducing API that removes a callback from the `events` object.
 *
 * @param {object.<{callback: Function, context: object, ctx: object, listening:{}}>} events - Events object
 * @param {string}   name     - Event name
 * @param {Function} callback - Event callback
 * @param {object}   options  - Optional parameters
 * @returns {Eventbus} The Eventbus object.
 */
const s_OFF_API = (events, name, callback, options) =>
{
   if (!events) { return; }

   let i = 0, listening;
   const context = options.context, listeners = options.listeners;

   // Delete all events listeners and "drop" events.
   if (!name && !callback && !context && listeners)
   {
      const ids = Object.keys(listeners);
      for (; i < ids.length; i++)
      {
         listening = listeners[ids[i]];
         delete listeners[listening.id];
         delete listening.listeningTo[listening.objId];
      }
      return;
   }

   const names = name ? [name] : Object.keys(events);
   for (; i < names.length; i++)
   {
      name = names[i];
      const handlers = events[name];

      // Bail out if there are no events stored.
      /* c8 ignore next */
      if (!handlers) { break; }

      // Replace events if there are any remaining.  Otherwise, clean up.
      const remaining = [];
      for (let j = 0; j < handlers.length; j++)
      {
         const handler = handlers[j];
         if (
          callback && callback !== handler.callback &&
          callback !== handler.callback._callback ||
          context && context !== handler.context
         )
         {
            remaining.push(handler);
         }
         else
         {
            listening = handler.listening;
            if (listening && --listening.count === 0)
            {
               delete listeners[listening.id];
               delete listening.listeningTo[listening.objId];
            }
         }
      }

      // Update tail event if the list has any events.  Otherwise, clean up.
      if (remaining.length)
      {
         events[name] = remaining;
      }
      else
      {
         delete events[name];
      }
   }

   return events;
};

/**
 * The reducing API that adds a callback to the `events` object.
 *
 * @param {object.<{callback: Function, context: object, ctx: object, listening:{}}>} events - Events object
 * @param {string}   name     - Event name
 * @param {Function} callback - Event callback
 * @param {object}   options  - Optional parameters
 * @returns {*} The Events object.
 */
const s_ON_API = (events, name, callback, options) =>
{
   if (callback)
   {
      const handlers = events[name] || (events[name] = []);
      const context = options.context, ctx = options.ctx, listening = options.listening;

      if (listening) { listening.count++; }

      handlers.push({ callback, context, ctx: context || ctx, listening });
   }
   return events;
};

/**
 * Reduces the event callbacks into a map of `{event: onceWrapper}`. `offer` unbinds the `onceWrapper` after
 * it has been called.
 *
 * @param {object.<{callback: Function, context: object, ctx: object, listening:{}}>} map - Events object
 * @param {string}   name     - Event name
 * @param {Function} callback - Event callback
 * @param {Function} offer    - Function to invoke after event has been triggered once; `off()`
 * @returns {*} The Events object.
 */
const s_ONCE_MAP = function(map, name, callback, offer)
{
   if (callback)
   {
      const once = map[name] = () =>
      {
         offer(name, once);
         return callback.apply(this, arguments);
      };

      once._callback = callback;
   }
   return map;
};

/**
 * Handles triggering the appropriate event callbacks.
 *
 * @param {Function} iterateeTarget - Internal function which is dispatched to.
 * @param {Array<*>} objEvents      - Array of stored event callback data.
 * @param {string}   name           - Event name(s)
 * @param {Function} cb             - callback
 * @param {Array<*>} args           - Arguments supplied to a trigger method.
 * @returns {*} The results from the triggered event.
 */
const s_TRIGGER_API = (iterateeTarget, objEvents, name, cb, args) =>
{
   let result;

   if (objEvents)
   {
      const events = objEvents[name];
      let allEvents = objEvents.all;
      if (events && allEvents) { allEvents = allEvents.slice(); }
      if (events) { result = iterateeTarget(events, args); }
      if (allEvents) { result = iterateeTarget(allEvents, [name].concat(args)); }
   }

   return result;
};

/**
 * A difficult-to-believe, but optimized internal dispatch function for triggering events. Tries to keep the usual
 * cases speedy (most internal Backbone events have 3 arguments).
 *
 * @param {object.<{callback: Function, context: object, ctx: object, listening:{}}>}  events - events array
 * @param {Array<*>} args - event argument array
 */
const s_TRIGGER_EVENTS = (events, args) =>
{
   let ev, i = -1;
   const a1 = args[0], a2 = args[1], a3 = args[2], l = events.length;

   switch (args.length)
   {
      case 0:
         while (++i < l) { (ev = events[i]).callback.call(ev.ctx); }
         return;
      case 1:
         while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1); }
         return;
      case 2:
         while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2); }
         return;
      case 3:
         while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); }
         return;
      default:
         while (++i < l) { (ev = events[i]).callback.apply(ev.ctx, args); }
         return;
   }
};

/**
 * A difficult-to-believe, but optimized internal dispatch function for triggering events. Tries to keep the usual
 * cases speedy (most internal Backbone events have 3 arguments). This dispatch method uses ES6 Promises and adds
 * any returned results to an array which is added to a Promise.all construction which passes back a Promise which
 * waits until all Promises complete. Any target invoked may return a Promise or any result. This is very useful to
 * use for any asynchronous operations.
 *
 * @param {Array<*>} events   -  Array of stored event callback data.
 * @param {Array<*>} args     -  Arguments supplied to `triggerAsync`.
 * @returns {Promise} A Promise of the results from the triggered event.
 */
const s_TRIGGER_ASYNC_EVENTS = async (events, args) =>
{
   let ev, i = -1;
   const a1 = args[0], a2 = args[1], a3 = args[2], l = events.length;

   const results = [];

   try
   {
      switch (args.length)
      {
         case 0:
            while (++i < l)
            {
               const result = (ev = events[i]).callback.call(ev.ctx);

               // If we received a valid result add it to the promises array.
               if (result !== void 0) { results.push(result); }
            }
            break;

         case 1:
            while (++i < l)
            {
               const result = (ev = events[i]).callback.call(ev.ctx, a1);

               // If we received a valid result add it to the promises array.
               if (result !== void 0) { results.push(result); }
            }
            break;

         case 2:
            while (++i < l)
            {
               const result = (ev = events[i]).callback.call(ev.ctx, a1, a2);

               // If we received a valid result add it to the promises array.
               if (result !== void 0) { results.push(result); }
            }
            break;

         case 3:
            while (++i < l)
            {
               const result = (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);

               // If we received a valid result add it to the promises array.
               if (result !== void 0) { results.push(result); }
            }
            break;

         default:
            while (++i < l)
            {
               const result = (ev = events[i]).callback.apply(ev.ctx, args);

               // If we received a valid result add it to the promises array.
               if (result !== void 0) { results.push(result); }
            }
            break;
      }
   }
   catch (error) // will catch synchronous event binding errors and reject again async errors.
   {
      return Promise.reject(error);
   }

   // If there are multiple results then use Promise.all otherwise Promise.resolve.
   return results.length > 1 ? Promise.all(results).then((values) =>
   {
      const filtered = values.filter((entry) => entry !== void 0);
      switch (filtered.length)
      {
         case 0: return void 0;
         case 1: return filtered[0];
         default: return filtered;
      }
   }) : results.length === 1 ? Promise.resolve(results[0]) : Promise.resolve();
};

/**
 * A difficult-to-believe, but optimized internal dispatch function for triggering events. Tries to keep the usual
 * cases speedy (most internal Backbone events have 3 arguments). This dispatch method synchronously passes back a
 * single value or an array with all results returned by any invoked targets.
 *
 * @param {Array<*>} events   -  Array of stored event callback data.
 * @param {Array<*>} args     -  Arguments supplied to `triggerSync`.
 * @returns {*|Array<*>} The results from the triggered event.
 */
const s_TRIGGER_SYNC_EVENTS = (events, args) =>
{
   let ev, i = -1;
   const a1 = args[0], a2 = args[1], a3 = args[2], l = events.length;

   const results = [];

   switch (args.length)
   {
      case 0:
         while (++i < l)
         {
            const result = (ev = events[i]).callback.call(ev.ctx);

            // If we received a valid result return immediately.
            if (result !== void 0) { results.push(result); }
         }
         break;
      case 1:
         while (++i < l)
         {
            const result = (ev = events[i]).callback.call(ev.ctx, a1);

            // If we received a valid result return immediately.
            if (result !== void 0) { results.push(result); }
         }
         break;
      case 2:
         while (++i < l)
         {
            const result = (ev = events[i]).callback.call(ev.ctx, a1, a2);

            // If we received a valid result return immediately.
            if (result !== void 0) { results.push(result); }
         }
         break;
      case 3:
         while (++i < l)
         {
            const result = (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);

            // If we received a valid result return immediately.
            if (result !== void 0) { results.push(result); }
         }
         break;
      default:
         while (++i < l)
         {
            const result = (ev = events[i]).callback.apply(ev.ctx, args);

            // If we received a valid result return immediately.
            if (result !== void 0) { results.push(result); }
         }
         break;
   }

   // Return the results array if there are more than one or just a single result.
   return results.length > 1 ? results : results.length === 1 ? results[0] : void 0;
};

/**
 * Generate a unique integer ID (unique within the entire client session).
 *
 * @type {number} - unique ID counter.
 */
let idCounter = 0;

/**
 * Creates a new unique ID with a given prefix
 *
 * @param {string}   prefix - An optional prefix to add to unique ID.
 * @returns {string} A new unique ID with a given prefix.
 */
const s_UNIQUE_ID = (prefix = '') =>
{
   const id = `${++idCounter}`;
   return prefix ? `${prefix}${id}` : id;
};
