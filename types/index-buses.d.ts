/**
 * Provides several standard Eventbus instances that are accessible through named exports: `mainEventbus`,
 * `pluginEventbus`, and `testEventbus`. For the most part these instances are useful for testing applications to
 * have easy access across the runtime to consistent instances.
 *
 * @example
 * ```js
 * import { mainEventbus, pluginEventbus, testEventbus } from '@typhonjs-plugin/eventbus';
 * ```
 *
 * @module
 */

import * as _typhonjs_plugin_eventbus from '@typhonjs-plugin/eventbus';

/**
 * Provides a main eventbus instance.
 *
 * @type {import('@typhonjs-plugin/eventbus').Eventbus}
 */
declare const eventbus: _typhonjs_plugin_eventbus.Eventbus;
/**
 * Provides an eventbus instance potentially for use with a plugin system.
 *
 * @type {import('@typhonjs-plugin/eventbus').Eventbus}
 */
declare const pluginEventbus: _typhonjs_plugin_eventbus.Eventbus;
/**
 * Provides an eventbus instance potentially for use for testing.
 *
 * @type {import('@typhonjs-plugin/eventbus').Eventbus}
 */
declare const testEventbus: _typhonjs_plugin_eventbus.Eventbus;

export { eventbus, pluginEventbus, testEventbus };
