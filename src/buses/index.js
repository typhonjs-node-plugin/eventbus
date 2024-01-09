/**
 * Provides several standard Eventbus instances that are accessible through named exports: `mainEventbus`,
 * `pluginEventbus`, and `testEventbus`. For the most part these instances are useful for testing applications to
 * have easy access across the runtime to consistent instances.
 *
 * @example
 * ```js
 * import { eventbus, pluginEventbus, testEventbus } from '@typhonjs-plugin/eventbus/buses';
 * ```
 *
 * @module
 */

import { Eventbus } from '@typhonjs-plugin/eventbus';

/**
 * Provides a main eventbus instance.
 *
 * @type {import('@typhonjs-plugin/eventbus').Eventbus}
 */
export const eventbus = new Eventbus('mainEventbus');

/**
 * Provides an eventbus instance potentially for use with a plugin system.
 *
 * @type {import('@typhonjs-plugin/eventbus').Eventbus}
 */
export const pluginEventbus = new Eventbus('pluginEventbus');

/**
 * Provides an eventbus instance potentially for use for testing.
 *
 * @type {import('@typhonjs-plugin/eventbus').Eventbus}
 */
export const testEventbus = new Eventbus('testEventbus');
