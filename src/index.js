import { Eventbus }  from './Eventbus.js';

export *             from './EventbusProxy.js';
export *             from './EventbusSecure.js';

export { Eventbus };

/**
 * @typedef {object} DataOutOptions The complete options for an event name.
 *
 * @property {boolean}  guard The guarded option.
 *
 * @property {string}   type The type option.
 */

/**
 * @typedef {object} EventData The callback data for an event.
 *
 * @property {Function} callback Callback function
 *
 * @property {object} context Event context
 *
 * @property {object} ctx Event context or local eventbus instance.
 *
 * @property {DataOutOptions} options Holds options for this event registration, One such option is 'guarded' which
 * prevents multiple registrations.
 *
 * @property {object} [listening] Any associated listening instance.
 */

// TODO: Note: for `listening` above type should be `Listening`, but that is not exported and this typedef file is
// used to generate public Typescript declarations.

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
 * @typedef {object} OnOptions Event registration options for Eventbus.
 *
 * @property {boolean}        [guard] When set to true this registration is guarded. Further attempts to register an
 * event by the same name will not be possible as long as a guarded event exists.
 *
 * @property {string|number}  [type] Provides a hint on the trigger type. May be a string or number 'sync' / 1 or
 * 'async' / 2. Any other value is not recognized and internally type will be set to undefined / 0.
 */

/**
 * @typedef {object} ProxyOnOptionsBase Event registration options.
 *
 * @property {boolean} [private] -
 */

/**
 * @typedef {OnOptions & ProxyOnOptionsBase} ProxyOnOptions Event registration options for EventbusProxy.
 */
