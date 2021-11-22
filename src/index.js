import Eventbus                        from './Eventbus.js';

export { default as EventbusProxy }    from './EventbusProxy.js';
export { default as EventbusSecure }   from './EventbusSecure.js';

export { Eventbus as default };

/**
 * Provides a main eventbus instance.
 *
 * @type {Eventbus}
 */
export const eventbus = new Eventbus('mainEventbus');

/**
 * Provides an eventbus instance potentially for use with a plugin system.
 *
 * @type {Eventbus}
 */
export const pluginEventbus = new Eventbus('pluginEventbus');

/**
 * Provides an eventbus instance potentially for use for testing.
 *
 * @type {Eventbus}
 */
export const testEventbus = new Eventbus('testEventbus');
