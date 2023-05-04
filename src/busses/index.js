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
