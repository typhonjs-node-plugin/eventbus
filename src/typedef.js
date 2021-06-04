/**
 * @typedef {object} EventData The callback data for an event.
 *
 * @property {Function} callback - Callback function
 *
 * @property {object} context - Event context
 *
 * @property {object} ctx - Event context or local eventbus instance.
 *
 * @property {object} options - Holds options for this event registration, One such option is 'guarded' which prevents
 *                              multiple registrations.
 *
 * @property {Listening} [listening] - Any associated listening instance.
 */

/**
 * @typedef {Object.<string, EventData[]>} Events - Event data stored by event name.
 */

/**
 * @typedef {object} EventbusSecureObj - The control object returned by `EventbusSecure.initialize`.
 *
 * @property {Function} destroy - A function which destroys the underlying Eventbus reference.
 *
 * @property {EventbusSecure} eventbusSecure - The EventbusSecure instance.
 *
 * @property {Function} setEventbus - A function to set the underlying Eventbus reference.
 */

/**
 * @typedef {object} OnOptions - Event registration options for Eventbus.
 *
 * @property {boolean} [guard] - When set to true this registration is guarded. Further attempts to register an event by
 *                             the same name will not be possible as long as a guarded event exists.
 */

/**
 * @typedef {object} ProxyOnOptionsBase - Event registration options.
 *
 * @property {boolean} [private] -
 */

/**
 * @typedef {OnOptions & ProxyOnOptionsBase} ProxyOnOptions - Event registration options for EventbusProxy.
 */
