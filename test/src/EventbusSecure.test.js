import { assert, expect }  from 'chai';

import Eventbus            from '../../src/Eventbus.js';

import config              from '../utils/config.js';

if (config.eventbussecure)
{
   describe('EventbusSecure', () =>
   {
      let callbacks, count, eventbus;

      beforeEach(() =>
      {
         callbacks = {};
         count = 0;
         eventbus = new Eventbus();
      });

      it('function - destroy - with trigger', () =>
      {
         callbacks.testTriggerCount = 0;

         const { destroy, eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.strictEqual(eventbusSecure.eventCount, 1);

         eventbusSecure.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 2);

         assert.isFalse(eventbusSecure.isDestroyed);

         destroy();

         assert.isTrue(eventbusSecure.isDestroyed);

         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 3);

         // Multiple times calling destroy will not throw.
         expect(() => eventbusSecure.eventCount).to.throw(ReferenceError,
          'This EventbusSecure instance has been destroyed.');

         expect(() =>
         {
            for (const entry of eventbusSecure.keys()) { console.log(entry); }
         }).to.throw(ReferenceError, 'This EventbusSecure instance has been destroyed.');

         expect(() => eventbusSecure.name).to.throw(ReferenceError, 'This EventbusSecure instance has been destroyed.');

         expect(() => eventbusSecure.trigger('test:trigger')).to.throw(ReferenceError,
          'This EventbusSecure instance has been destroyed.');

         expect(() => eventbusSecure.triggerAsync('test:trigger')).to.throw(ReferenceError,
          'This EventbusSecure instance has been destroyed.');

         expect(() => eventbusSecure.triggerDefer('test:trigger')).to.throw(ReferenceError,
          'This EventbusSecure instance has been destroyed.');

         expect(() => eventbusSecure.triggerSync('test:trigger')).to.throw(ReferenceError,
          'This EventbusSecure instance has been destroyed.');

         assert.strictEqual(callbacks.testTriggerCount, 3);
      });

      it('function - destroy - object ref undefined', () =>
      {
         callbacks.testTriggerCount = 0;

         const obj = eventbus.createSecure();

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.strictEqual(obj.eventbusSecure.eventCount, 1);

         obj.eventbusSecure.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 2);

         assert.isFalse(obj.eventbusSecure.isDestroyed);

         obj.destroy();

         assert.isUndefined(obj.eventbusSecure);
      });

      it('function - setEventbus - with trigger', () =>
      {
         callbacks.testTriggerCount = 0;

         const eventbus = new Eventbus('eventbus');
         const eventbus2 = new Eventbus('eventbus2');

         const { eventbusSecure, setEventbus } = eventbus.createSecure();

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
         eventbus.on('test:trigger2', () => { callbacks.testTriggerCount++; });

         eventbus2.on('test:trigger3', () => { callbacks.testTriggerCount++; });

         assert.strictEqual(eventbus.callbackCount, 2);
         assert.strictEqual(eventbusSecure.eventCount, 2);

         eventbusSecure.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 2);

         assert.strictEqual(eventbusSecure.name, 'eventbus');

         assert.isFalse(eventbusSecure.isDestroyed);

         setEventbus(eventbus2);

         assert.strictEqual(eventbusSecure.name, 'eventbus2');

         eventbusSecure.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 2);

         eventbusSecure.trigger('test:trigger3');

         assert.strictEqual(callbacks.testTriggerCount, 3);
      });

      it('get name', () =>
      {
         eventbus = new Eventbus('testname');
         const { eventbusSecure } = eventbus.createSecure();
         assert(eventbusSecure.name === 'testname');
      });

      it('get - callbackCount', () =>
      {
         eventbus.on('can:see:this', () => {});

         const { eventbusSecure } = eventbus.createSecure();

         assert.strictEqual(eventbusSecure.eventCount, 1);
      });

      it('keys throws when regex not instance of RegExp', () =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         expect(() =>
         {
            for (const entry of eventbusSecure.keys(false)) { console.log(entry); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('keys', () =>
      {
         eventbus.on('can:see:this', () => {});

         const { eventbusSecure } = eventbus.createSecure();

         const eventNames = Array.from(eventbusSecure.keys());

         assert.strictEqual(JSON.stringify(eventNames),
          '["can:see:this"]');
      });

      it('keys w/ regex', () =>
      {
         eventbus.on('can:see:this', () => {});
         eventbus.on('can:not:this', () => {});

         const { eventbusSecure } = eventbus.createSecure();

         const eventNames = Array.from(eventbusSecure.keys(/see/));

         assert.strictEqual(JSON.stringify(eventNames), '["can:see:this"]');
      });

      it('trigger (on / off)', () =>
      {
         callbacks.testTriggerCount = 0;

         const { eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });

         eventbusSecure.trigger('test:trigger');

         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 2);

         assert.strictEqual(eventbusSecure.eventCount, 1);

         eventbus.off();

         assert.strictEqual(eventbusSecure.eventCount, 0);

         eventbusSecure.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTriggerCount, 2);
      });

      it('triggerDefer', (done) =>
      {
         callbacks.testTriggerCount = 0;

         const { eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.strictEqual(eventbusSecure.eventCount, 1);

         eventbusSecure.triggerDefer('test:trigger');
         eventbus.triggerDefer('test:trigger');

         setTimeout(() =>
         {
            assert.strictEqual(callbacks.testTriggerCount, 2);
            done();
         }, 0);
      });

      it('triggerSync-0', () =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         const result = eventbusSecure.triggerSync('test:trigger:sync0');

         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('triggerSync-1', () =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger:sync1', () =>
         {
            callbacks.testTriggerSync1 = true;
            return 'foo';
         });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.strictEqual(eventbusSecure.eventCount, 1);

         const result = eventbusSecure.triggerSync('test:trigger:sync1');

         assert.isTrue(callbacks.testTriggerSync1);
         assert.isNotArray(result);
         assert.strictEqual(result, 'foo');
      });

      it('triggerSync-2', () =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2A = true;
            return 'foo';
         });
         eventbus.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2B = true;
            return 'bar';
         });

         assert.strictEqual(eventbus.callbackCount, 2);
         assert.strictEqual(eventbusSecure.eventCount, 2);

         const results = eventbusSecure.triggerSync('test:trigger:sync2');

         assert.isTrue(callbacks.testTriggerSync2A);
         assert.isTrue(callbacks.testTriggerSync2B);
         assert.isArray(results);
         assert.strictEqual(results.length, 2);
         assert.strictEqual(results[0], 'foo');
         assert.strictEqual(results[1], 'bar');
      });

      it('triggerSync (on / off)', () =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         assert.strictEqual(eventbus.callbackCount, 0);
         assert.strictEqual(eventbusSecure.eventCount, 0);

         eventbus.on('test:trigger:sync:off', () =>
         {
            callbacks.testTriggerSyncOff = true;
            return true;
         });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.strictEqual(eventbusSecure.eventCount, 1);

         eventbus.off('test:trigger:sync:off');

         assert.strictEqual(eventbus.callbackCount, 0);
         assert.strictEqual(eventbusSecure.eventCount, 0);

         assert.isUndefined(eventbusSecure.triggerSync('test:trigger:sync:off'));
         assert.isUndefined(callbacks.testTriggerSyncOff);
      });

      it('triggerSync (Promise)', (done) =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger:sync:then', () =>
         {
            callbacks.testTriggerSyncThen = true;
            return Promise.resolve('foobar');
         });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.strictEqual(eventbusSecure.eventCount, 1);

         const promise = eventbusSecure.triggerSync('test:trigger:sync:then');

         assert(promise instanceof Promise);

         promise.then((result) =>
         {
            assert.isTrue(callbacks.testTriggerSyncThen);
            assert.strictEqual(result, 'foobar');
            done();
         });
      });

      it('triggerAsync', (done) =>
      {
         const { eventbusSecure } = eventbus.createSecure();

         eventbus.on('test:trigger:async', () =>
         {
            callbacks.testTriggerAsync = true;
            return 'foo';
         });
         eventbus.on('test:trigger:async', () =>
         {
            callbacks.testTriggerAsync2 = true;
            return 'bar';
         });

         assert.strictEqual(eventbus.callbackCount, 2);
         assert.strictEqual(eventbusSecure.eventCount, 2);

         const promise = eventbusSecure.triggerAsync('test:trigger:async');

         assert(promise instanceof Promise);

         // triggerAsync resolves all Promises by Promise.all() so result is an array.
         promise.then((result) =>
         {
            assert.isTrue(callbacks.testTriggerAsync);
            assert.isTrue(callbacks.testTriggerAsync2);
            assert.strictEqual(result[0], 'foo');
            assert.strictEqual(result[1], 'bar');
            done();
         });
      });
   });
}
