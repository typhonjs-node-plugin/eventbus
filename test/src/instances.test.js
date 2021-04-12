import { assert }             from 'chai';

import mainEventbus           from '../../src/instances.js';

import { auxEventbus }        from '../../src/instances.js';
import { pluginEventbus }     from '../../src/instances.js';
import { testEventbus }       from '../../src/instances.js';

/* eslint-disable no-undef */

describe('Instances', () =>
{
   let callbacks;

   beforeEach(() => { callbacks = {}; });

   it('get name', () =>
   {
      assert(auxEventbus.getEventbusName() === 'auxEventbus');
      assert(mainEventbus.getEventbusName() === 'mainEventbus');
      assert(pluginEventbus.getEventbusName() === 'pluginEventbus');
      assert(testEventbus.getEventbusName() === 'testEventbus');
   });

   it('trigger (auxEventbus)', () =>
   {
      callbacks.testTriggerCount = 0;
      auxEventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
      auxEventbus.trigger('test:trigger');
      auxEventbus.off('test:trigger');
      auxEventbus.trigger('test:trigger');
      assert(callbacks.testTriggerCount === 1);
   });

   it('trigger (mainEventbus)', () =>
   {
      callbacks.testTriggerCount = 0;
      mainEventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
      mainEventbus.trigger('test:trigger');
      mainEventbus.off('test:trigger');
      mainEventbus.trigger('test:trigger');
      assert(callbacks.testTriggerCount === 1);
   });

   it('trigger (pluginEventbus)', () =>
   {
      callbacks.testTriggerCount = 0;
      pluginEventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
      pluginEventbus.trigger('test:trigger');
      pluginEventbus.off('test:trigger');
      pluginEventbus.trigger('test:trigger');
      assert(callbacks.testTriggerCount === 1);
   });

   it('trigger (testEventbus)', () =>
   {
      callbacks.testTriggerCount = 0;
      testEventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
      testEventbus.trigger('test:trigger');
      testEventbus.off('test:trigger');
      testEventbus.trigger('test:trigger');
      assert(callbacks.testTriggerCount === 1);
   });
});
