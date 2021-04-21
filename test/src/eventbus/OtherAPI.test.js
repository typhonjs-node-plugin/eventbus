import { assert, expect } from 'chai';

import Eventbus   from '../../../src/Eventbus.js';

import config     from '../../utils/config.js';

if (config.other)
{
   describe('Eventbus - other API', () =>
   {
      let eventbus;

      beforeEach(() => { eventbus = new Eventbus(); });

      it('set / get name', () =>
      {
         eventbus = new Eventbus('testname');
         assert.strictEqual(eventbus.name, 'testname');

         eventbus = new Eventbus('testname2');
         assert.strictEqual(eventbus.name, 'testname2');
      });

      it('entries throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const array of eventbus.entries(false)) { console.log(array); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('entries', () =>
      {
         const callback1 = () => {};
         const callback2 = () => {};
         const callback3 = () => {};
         const callback3A = () => {};

         const context1 = {};
         const context2 = {};
         const context3 = {};
         const context3A = {};

         const allCallbacks = [callback1, callback2, callback3, callback3A];
         const allContexts = [context1, context2, context3, context3A];
         const allNames = ['test:trigger', 'test:trigger2', 'test:trigger3', 'test:trigger3'];

         eventbus.on('test:trigger', callback1, context1);
         eventbus.on('test:trigger2', callback2, context2);
         eventbus.on('test:trigger3', callback3, context3);
         eventbus.on('test:trigger3', callback3A, context3A);

         let cntr = 0;

         for (const [name, callback, context] of eventbus.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            cntr++;
         }
      });

      it('entries w/ regex', () =>
      {
         const callback1 = () => {};
         const callback2 = () => {};
         const callback3 = () => {};
         const callback3A = () => {};

         const context1 = {};
         const context2 = {};
         const context3 = {};
         const context3A = {};

         const allCallbacks = [callback1, callback2, callback3, callback3A];
         const allContexts = [context1, context2, context3, context3A];
         const allNames = ['test:trigger', 'test:trigger2', 'test:trigger3', 'test:trigger3'];

         eventbus.on('test:trigger', callback1, context1);
         eventbus.on('test:trigger2', callback2, context2);
         eventbus.on('test:trigger3', callback3, context3);
         eventbus.on('test:trigger3', callback3A, context3A);

         let cntr = 2;

         for (const [name, callback, context] of eventbus.entries(/test:trigger3/))
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            cntr++;
         }
      });

      it('get - eventNames', () =>
      {
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger2', () => {});
         eventbus.on('test:trigger3', () => {});
         eventbus.on('test:trigger3', () => {});

         const eventNames = eventbus.eventNames;

         assert.strictEqual(JSON.stringify(eventNames), '["test:trigger","test:trigger2","test:trigger3"]');
      });
   });
}
