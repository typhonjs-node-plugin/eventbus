import { assert, expect }  from 'chai';

import Eventbus            from '../../../src/Eventbus.js';

import config              from '../../utils/config.js';

if (config.other)
{
   describe('Eventbus - other API', () =>
   {
      let count, eventbus;

      beforeEach(() =>
      {
         count = 0;
         eventbus = new Eventbus();
      });

      it('set / get name', () =>
      {
         eventbus = new Eventbus('testname');
         assert.strictEqual(eventbus.name, 'testname');

         eventbus = new Eventbus('testname2');
         assert.strictEqual(eventbus.name, 'testname2');
      });

      it('ctor throws when name is not a string', () =>
      {
         expect(() => { new Eventbus(false); }).to.throw(TypeError, `'eventbusName' is not a string`);
      });

      it('before throws when count is not a number', () =>
      {
         expect(() => { eventbus.before(false); }).to.throw(TypeError, `'count' is not an integer`);
      });

      it('before - count 3', () =>
      {
         eventbus.before(3, 'test', () => { count++; });

         eventbus.trigger('test');
         eventbus.trigger('test');

         assert.strictEqual(eventbus.eventCount, 1);

         eventbus.trigger('test');

         assert.strictEqual(eventbus.eventCount, 0);

         eventbus.trigger('test');

         assert.strictEqual(count, 3);
      });

      it('entries has early out when no events are set', () =>
      {
         Array.from(eventbus.entries());
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

      it('entries has early out when no events are set', () =>
      {
         Array.from(eventbus.keys());
      });

      it('keys throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const entry of eventbus.keys(false)) { console.log(entry); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('keys', () =>
      {
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger2', () => {});
         eventbus.on('test:trigger2', () => {});
         eventbus.on('test:trigger3', () => {});
         eventbus.on('test:trigger3A', () => {});

         const eventNames = Array.from(eventbus.keys());

         assert.strictEqual(JSON.stringify(eventNames),
          '["test:trigger","test:trigger2","test:trigger3","test:trigger3A"]');
      });

      it('keys w/ regex', () =>
      {
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger2', () => {});
         eventbus.on('test:trigger2', () => {});
         eventbus.on('test:trigger3', () => {});
         eventbus.on('test:trigger3A', () => {});

         const eventNames = Array.from(eventbus.keys(/test:trigger3/));

         assert.strictEqual(JSON.stringify(eventNames), '["test:trigger3","test:trigger3A"]');
      });

      it('listenToBefore throws when count is not a number', () =>
      {
         expect(() => { eventbus.listenToBefore(false); }).to.throw(TypeError, `'count' is not an integer`);
      });

      it('listenToBefore - call function twice', () =>
      {
         const other = new Eventbus();

         eventbus.listenToBefore(2, other, 'change', () => { count++; });

         other.trigger('change');
         other.trigger('change');
         other.trigger('change');
         other.trigger('change');

         assert.strictEqual(count, 2);
      });

      it('listenToBefore works with event maps - call function twice', () =>
      {
         const other = new Eventbus();

         eventbus.listenToBefore(2, other, { change: () => { count++; } });

         other.trigger('change');
         other.trigger('change');
         other.trigger('change');
         other.trigger('change');

         assert.strictEqual(count, 2);
      });
   });
}
