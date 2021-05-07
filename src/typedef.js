/**
 * @typedef {object} type.EventData The callback data for an event.
 *
 * @property {Function} callback - Callback function
 *
 * @property {object} context - Event context
 *
 * @property {object} ctx - Event context or local eventbus instance.
 *
 * @property {boolean} guarded - Denotes whether this event registration is guarded / prevents multiple registrations.
 *
 * @property {Listening} [listening] - Any associated listening instance.
 */

/**
 * @typedef {object.<string, type.EventData[]>} type.Events - Event data stored by event name.
 */

/**
 * @typedef {object} type.EventbusSecureObj - The control object returned by `EventbusSecure.initialize`.
 *
 * @property {Function} destroy - A function which destroys the underlying Eventbus reference.
 *
 * @property {EventbusSecure} eventbusSecure - The EventbusSecure instance.
 *
 * @property {Function} setEventbus - A function to set the underlying Eventbus reference.
 */

export const type = {};
