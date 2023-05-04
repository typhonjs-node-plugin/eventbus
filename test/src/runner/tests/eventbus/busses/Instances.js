/**
 * @param {object}                           opts - Test options
 *
 * @param {import('../../../../../types/index-busses')}   opts.ModuleBusses - Module to test
 *
 * @param {object}                           opts.chai - Chai
 */
export function run({ ModuleBusses, chai })
{
   const { assert } = chai;
   const { eventbus, pluginEventbus, testEventbus } = ModuleBusses;

   describe('Instances', () =>
   {
      let callbacks;

      beforeEach(() => { callbacks = {}; });

      it('get name', () =>
      {
         assert(eventbus.name === 'mainEventbus');
         assert(pluginEventbus.name === 'pluginEventbus');
         assert(testEventbus.name === 'testEventbus');
      });

      it('trigger (mainEventbus)', () =>
      {
         callbacks.testTriggerCount = 0;
         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
         eventbus.trigger('test:trigger');
         eventbus.off('test:trigger');
         eventbus.trigger('test:trigger');
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
}

