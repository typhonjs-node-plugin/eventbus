import Eventbus from './Eventbus.js';

/**
 * Provides an auxiliary eventbus.
 */
const auxEventbus = new Eventbus('auxEventbus');

/**
 * Provides the main eventbus as the default export.
 */
const mainEventbus = new Eventbus('mainEventbus');

/**
 * Provides an eventbus potentially for use with a plugin system.
 */
const pluginEventbus = new Eventbus('pluginEventbus');

/**
 * Provides an eventbus potentially for use for testing.
 */
const testEventbus = new Eventbus('testEventbus');

/**
 * Exports an instance of `Eventbus` which may be used as a main eventbus across modules facilitating separation
 * of concerns avoiding direct inter-module dependencies through message passing versus direct method invocation.
 */
export default mainEventbus;

export { auxEventbus };
export { pluginEventbus };
export { testEventbus };
