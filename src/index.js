import { Eventbus }  from './Eventbus.js';

export *             from './EventbusProxy.js';
export *             from './EventbusSecure.js';

export { Eventbus };

/**
 * @typedef {object} EventData The callback data for an event.
 *
 * @property {Function} callback Callback function
 *
 * @property {object} context Event context
 *
 * @property {object} ctx Event context or local eventbus instance.
 *
 * @property {EventOptionsOut} options Holds options for this event registration, One such option is 'guarded' which
 * prevents multiple registrations.
 *
 * @property {object} [listening] Any associated listening instance.
 */

/**
 * @typedef {{ [key: string]: EventData[] }} EventbusEvents Event data stored by event name.
 */

/**
 * @typedef {{ [key: string]: Function }} EventMap Defines multiple events that can be used to registered in one API
 * call.
 */

/**
 * @typedef {object} EventbusSecureObj The control object returned by `EventbusSecure.initialize`.
 *
 * @property {Function} destroy A function which destroys the underlying Eventbus reference.
 *
 * @property {import('.').EventbusSecure} eventbusSecure The EventbusSecure instance.
 *
 * @property {(eventbus: import('.').Eventbus | import('.').EventbusProxy, name?: string) => void} setEventbus A
 * function to set the underlying Eventbus reference.
 */

/**
 * @typedef {object} EventOptions Event registration options.
 *
 * @property {boolean}        [guard] When set to true this registration is guarded. Further attempts to register an
 * event by the same name will not be possible as long as a guarded event exists with the same name.
 *
 * @property {'sync'|'async'} [type] Provides a hint on the trigger type. It may be a string 'sync' or 'async'.
 * Any other value is not recognized and internally type will be set to undefined. If the callback is a function
 * defined with the `async` modifier it will automatically be detected as async.
 */

/**
 * @typedef {object} EventOptionsOut The complete options for an event name returned from `entries`, etc.
 *
 * @property {boolean}  guard The guarded option.
 *
 * @property {'async' | 'sync' | void } type The type option.
 */
