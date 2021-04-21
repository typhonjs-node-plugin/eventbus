import { assert, expect }  from 'chai';

import Eventbus            from '../../src/Eventbus.js';

import config              from '../utils/config.js';

if (config.eventbusproxy)
{
   describe('EventbusProxy', () =>
   {
      let callbacks, count, eventbus, proxy;

      beforeEach(() =>
      {
         callbacks = {};
         count = 0;
         eventbus = new Eventbus();
         proxy = eventbus.createProxy();
      });

      it('get name', () =>
      {
         eventbus = new Eventbus('testname');
         proxy = eventbus.createProxy();
         assert(proxy.name === 'testname');
      });

      it('entries throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const array of proxy.entries(false)) { console.log(array); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('entries()', () =>
      {
         const eventbusCallback = () => {};
         const callback1 = () => {};
         const callback2 = () => {};
         const callback3 = () => {};
         const callback3A = () => {};

         const eventbusContext = {};
         const context1 = {};
         const context2 = {};
         const context3 = {};
         const context3A = {};

         const allCallbacks = [eventbusCallback, callback1, callback2, callback3, callback3A];
         const allContexts = [eventbusContext, context1, context2, context3, context3A];
         const allNames = ['eventbus:trigger', 'test:trigger', 'test:trigger2', 'test:trigger3', 'test:trigger3'];

         // Proxy will not list this event on the main eventbus.
         eventbus.on('eventbus:trigger', eventbusCallback, eventbusContext);

         proxy.on('test:trigger', callback1, context1);
         proxy.on('test:trigger2', callback2, context2);
         proxy.on('test:trigger3', callback3, context3);
         proxy.on('test:trigger3', callback3A, context3A);

         let cntr = 0;

         for (const [name, callback, context] of proxy.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            cntr++;
         }
      });

      it(`entries(/test:trigger3/) w/ regex`, () =>
      {
         const callback1 = () => {};
         const callback2 = () => {};
         const callback3 = () => {};
         const callback3A = () => {};

         const context1 = {};
         const context2 = {};
         const context3 = {};
         const context3A = {};

         const allCallbacks = [callback3, callback3A];
         const allContexts = [context3, context3A];
         const allNames = ['test:trigger3', 'test:trigger3'];

         // Proxy will not list this event on the main eventbus.
         eventbus.on('can:not:see:this', () => {});

         proxy.on('test:trigger', callback1, context1);
         proxy.on('test:trigger2', callback2, context2);
         proxy.on('test:trigger3', callback3, context3);
         proxy.on('test:trigger3', callback3A, context3A);

         let cntr = 0;

         for (const [name, callback, context] of proxy.entries(/test:trigger3/))
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            cntr++;
         }
      });

      it('get - eventCount', () =>
      {
         eventbus.on('can:see:this', () => {});

         proxy.on('test:trigger', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3', () => {});

         assert.strictEqual(proxy.eventCount, 5);
      });

      it('keys throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const entry of proxy.keys(false)) { console.log(entry); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('keys', () =>
      {
         eventbus.on('can:see:this', () => {});

         proxy.on('test:trigger', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3A', () => {});

         const eventNames = Array.from(proxy.keys());

         assert.strictEqual(JSON.stringify(eventNames),
          '["can:see:this","test:trigger","test:trigger2","test:trigger3","test:trigger3A"]');
      });

      it('keys w/ regex', () =>
      {
         eventbus.on('can:see:this', () => {});

         proxy.on('test:trigger', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3A', () => {});

         const eventNames = Array.from(proxy.keys(/test:trigger3/));

         assert.strictEqual(JSON.stringify(eventNames), '["test:trigger3","test:trigger3A"]');
      });

      it('get - proxyEventCount', () =>
      {
         eventbus.on('can:not:see:this', () => {});

         proxy.on('test:trigger', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3', () => {});

         assert.strictEqual(proxy.proxyEventCount, 4);
      });

      it('proxyKeys throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const entry of proxy.proxyKeys(false)) { console.log(entry); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('proxyKeys (none)', () =>
      {
         eventbus.on('can:not:see:this', () => {});

         const eventNames = Array.from(proxy.proxyKeys());

         assert.isArray(eventNames);
         assert.strictEqual(eventNames.length, 0);
      });

      it('proxyKeys', () =>
      {
         eventbus.on('can:not:see:this', () => {});

         proxy.on('test:trigger', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3', () => {});

         const eventNames = Array.from(proxy.proxyKeys());

         assert.strictEqual(JSON.stringify(eventNames), '["test:trigger","test:trigger2","test:trigger3"]');
      });

      it('proxyKeys w/ regex', () =>
      {
         eventbus.on('can:not:see:this', () => {});

         proxy.on('test:trigger', () => {});
         proxy.on('test:trigger2', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3', () => {});
         proxy.on('test:trigger3A', () => {});

         const eventNames = Array.from(proxy.proxyKeys(/test:trigger3/));

         assert.strictEqual(JSON.stringify(eventNames), '["test:trigger3","test:trigger3A"]');
      });

      it('off with no events', () =>
      {
         proxy.off();
      });

      it('off with non-registered event', () =>
      {
         proxy.on('foo', () => {});
         proxy.off('bar');
      });

      it('on default context is the proxy', () =>
      {
         proxy.on('foo', function() { count++; assert.equal(this, proxy); });
         proxy.trigger('foo');

         assert.strictEqual(count, 1);
      });

      it('on w/ event map / off multiple', () =>
      {
         eventbus.on('can:not:see:this', () => {});

         const ctx = {};

         proxy.on({
            test: function() { assert.equal(this, ctx); },
            test2: function() { assert.equal(this, ctx); },
            test3: function() { assert.equal(this, ctx); }
         }, ctx).trigger('test');

         assert.strictEqual(proxy.eventCount, 4);
         assert.strictEqual(proxy.proxyEventCount, 3);

         proxy.off('can:not:see:this');

         assert.strictEqual(proxy.eventCount, 4);
         assert.strictEqual(proxy.proxyEventCount, 3);

         proxy.off('test test3');

         assert.strictEqual(proxy.eventCount, 2);
         assert.strictEqual(proxy.proxyEventCount, 1);
      });

      it('on w/ event map / default context is proxy', () =>
      {
         proxy.on({
            test: function() { assert.equal(this, proxy); },
         }).trigger('test');
      });

      it('proxyEntries() throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const array of proxy.proxyEntries(false)) { console.log(array); }
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('proxyEntries() with no events', () =>
      {
         for (const array of proxy.proxyEntries()) { assert.ok(false); console.log(array); }
      });

      it('proxyEntries()', () =>
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

         // Proxy will not list this event on the main eventbus.
         eventbus.on('can:not:see:this', () => {});

         proxy.on('test:trigger', callback1, context1);
         proxy.on('test:trigger2', callback2, context2);
         proxy.on('test:trigger3', callback3, context3);
         proxy.on('test:trigger3', callback3A, context3A);

         let cntr = 0;

         for (const [name, callback, context] of proxy.proxyEntries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            cntr++;
         }
      });

      it(`proxyEntries(/test:trigger3/) w/ regex`, () =>
      {
         const callback1 = () => {};
         const callback2 = () => {};
         const callback3 = () => {};
         const callback3A = () => {};

         const context1 = {};
         const context2 = {};
         const context3 = {};
         const context3A = {};

         const allCallbacks = [callback3, callback3A];
         const allContexts = [context3, context3A];
         const allNames = ['test:trigger3', 'test:trigger3'];

         // Proxy will not list this event on the main eventbus.
         eventbus.on('can:not:see:this', () => {});

         proxy.on('test:trigger', callback1, context1);
         proxy.on('test:trigger2', callback2, context2);
         proxy.on('test:trigger3', callback3, context3);
         proxy.on('test:trigger3', callback3A, context3A);

         let cntr = 0;

         for (const [name, callback, context] of proxy.proxyEntries(/test:trigger3/))
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            cntr++;
         }
      });

      it('proxyEventCount() with no events', () =>
      {
         assert.strictEqual(proxy.proxyEventCount, 0);
      });

      it('trigger (on / off)', () =>
      {
         callbacks.testTriggerCount = 0;

         proxy.on('test:trigger', () => { callbacks.testTriggerCount++; });
         eventbus.on('test:trigger2', () => { callbacks.testTriggerCount++; });

         proxy.trigger('test:trigger');
         proxy.trigger('test:trigger2');
         eventbus.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 3);

         assert.strictEqual(proxy.eventCount, 2);
         assert.strictEqual(proxy.proxyEventCount, 1);

         proxy.off();

         assert.strictEqual(proxy.eventCount, 1);
         assert.strictEqual(proxy.proxyEventCount, 0);

         eventbus.trigger('test:trigger');
         eventbus.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 4);
      });

      it('trigger (on / off - name)', () =>
      {
         callbacks.testTriggerCount = 0;

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; });
         proxy.on('test:trigger', () => { callbacks.testTriggerCount++; });
         proxy.on('test:trigger2', () => { callbacks.testTriggerCount++; });

         eventbus.trigger('test:trigger');
         proxy.trigger('test:trigger');
         proxy.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 5);

         proxy.off('test:trigger');

         assert.strictEqual(proxy.eventCount, 1);

         proxy.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         proxy.trigger('test:trigger2');

         proxy.off('test:trigger2');

         assert.strictEqual(proxy.eventCount, 0);

         proxy.trigger('test:trigger2');
         eventbus.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 6);
      });

      it('trigger (on / off - callback)', () =>
      {
         callbacks.testTriggerCount = 0;

         const callback1 = () => { callbacks.testTriggerCount++; };
         const callback2 = () => { callbacks.testTriggerCount++; };

         eventbus.on('test:trigger', callback1);
         proxy.on('test:trigger', callback1);
         proxy.on('test:trigger2', callback2);

         eventbus.trigger('test:trigger');
         proxy.trigger('test:trigger');
         proxy.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 5);

         proxy.off(void 0, callback1);

         assert.strictEqual(proxy.eventCount, 1);

         proxy.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         proxy.trigger('test:trigger2');

         proxy.off(void 0, callback2);

         assert.strictEqual(proxy.eventCount, 0);

         proxy.trigger('test:trigger2');
         eventbus.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 6);
      });

      it('trigger (on / off - callback)', () =>
      {
         callbacks.testTriggerCount = 0;

         const eventbusContext = {};
         const sharedContext = {};

         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; }, eventbusContext);
         eventbus.on('test:trigger', () => { callbacks.testTriggerCount++; }, sharedContext);
         proxy.on('test:trigger', () => { callbacks.testTriggerCount++; }, sharedContext);
         proxy.on('test:trigger2', () => { callbacks.testTriggerCount++; }, callbacks);

         eventbus.trigger('test:trigger');
         proxy.trigger('test:trigger');
         proxy.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 7);

         assert.strictEqual(proxy.eventCount, 4);
         assert.strictEqual(proxy.proxyEventCount, 2);

         // This will remove the events on eventbus & proxy sharing the same context
         proxy.off(void 0, void 0, sharedContext);

         assert.strictEqual(proxy.eventCount, 2);
         assert.strictEqual(proxy.proxyEventCount, 1);

         proxy.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         proxy.trigger('test:trigger2');

         proxy.off(void 0, void 0, callbacks);

         assert.strictEqual(proxy.eventCount, 1);
         assert.strictEqual(proxy.proxyEventCount, 0);

         proxy.trigger('test:trigger2');
         eventbus.trigger('test:trigger2');

         assert.strictEqual(callbacks.testTriggerCount, 10);
      });

      it('trigger (destroy)', () =>
      {
         callbacks.testTriggerCount = 0;

         proxy.on('test:trigger', () => { callbacks.testTriggerCount++; });
         proxy.on('test:trigger2', () => { callbacks.testTriggerCount++; });
         eventbus.on('test:trigger3', () => { callbacks.testTriggerCount++; });

         assert.strictEqual(eventbus.eventCount, 3);
         assert.strictEqual(proxy.eventCount, 3);
         assert.strictEqual(proxy.proxyEventCount, 2);

         proxy.trigger('test:trigger');
         proxy.trigger('test:trigger2');
         proxy.trigger('test:trigger3');
         eventbus.trigger('test:trigger');
         eventbus.trigger('test:trigger2');
         eventbus.trigger('test:trigger3');

         assert.strictEqual(callbacks.testTriggerCount, 6);

         assert.isFalse(proxy.isDestroyed);

         proxy.destroy();

         assert.isTrue(proxy.isDestroyed);

         assert.strictEqual(eventbus.eventCount, 1);

         eventbus.trigger('test:trigger');
         eventbus.trigger('test:trigger2');
         eventbus.trigger('test:trigger3');

         assert.strictEqual(callbacks.testTriggerCount, 7);

         // Multiple times calling destroy will not throw.
         expect(() => proxy.destroy()).to.not.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() =>
         {
            for (const entry of proxy.entries()) { console.log(entry); }
         }).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.eventCount).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() =>
         {
            for (const entry of proxy.keys()) { console.log(entry); }
         }).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.name).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.off()).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.on('test:bogus', () => {})).to.throw(ReferenceError,
            'This EventbusProxy instance has been destroyed.');

         expect(() =>
         {
            for (const entry of proxy.proxyEntries()) { console.log(entry); }
         }).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.proxyEventCount).to.throw(ReferenceError,
            'This EventbusProxy instance has been destroyed.');

         expect(() =>
         {
            for (const entry of proxy.proxyKeys()) { console.log(entry); }
         }).to.throw(ReferenceError, 'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.trigger('test:trigger')).to.throw(ReferenceError,
            'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.triggerAsync('test:trigger')).to.throw(ReferenceError,
            'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.triggerDefer('test:trigger')).to.throw(ReferenceError,
            'This EventbusProxy instance has been destroyed.');

         expect(() => proxy.triggerSync('test:trigger')).to.throw(ReferenceError,
            'This EventbusProxy instance has been destroyed.');

         assert.strictEqual(callbacks.testTriggerCount, 7);
      });

      it('triggerDefer', (done) =>
      {
         callbacks.testTriggerCount = 0;

         proxy.on('test:trigger', () => { callbacks.testTriggerCount++; });
         proxy.on('test:trigger2', () => { callbacks.testTriggerCount++; });

         assert.strictEqual(eventbus.eventCount, 2);
         assert.strictEqual(proxy.eventCount, 2);

         proxy.triggerDefer('test:trigger');
         eventbus.triggerDefer('test:trigger2');

         setTimeout(() =>
         {
            assert.strictEqual(callbacks.testTriggerCount, 2);
            done();
         }, 0);
      });

      it('triggerSync-0', () =>
      {
         const result = proxy.triggerSync('test:trigger:sync0');

         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('triggerSync-1', () =>
      {
         proxy.on('test:trigger:sync1', () =>
         {
            callbacks.testTriggerSync1 = true;
            return 'foo';
         });

         assert.strictEqual(eventbus.eventCount, 1);
         assert.strictEqual(proxy.eventCount, 1);

         const result = proxy.triggerSync('test:trigger:sync1');

         assert.isTrue(callbacks.testTriggerSync1);
         assert.isNotArray(result);
         assert.strictEqual(result, 'foo');
      });

      it('triggerSync-2', () =>
      {
         proxy.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2A = true;
            return 'foo';
         });
         proxy.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2B = true;
            return 'bar';
         });

         assert.strictEqual(eventbus.eventCount, 2);
         assert.strictEqual(proxy.eventCount, 2);

         const results = proxy.triggerSync('test:trigger:sync2');

         assert.isTrue(callbacks.testTriggerSync2A);
         assert.isTrue(callbacks.testTriggerSync2B);
         assert.isArray(results);
         assert.strictEqual(results.length, 2);
         assert.strictEqual(results[0], 'foo');
         assert.strictEqual(results[1], 'bar');
      });

      it('triggerSync (on / off)', () =>
      {
         assert.strictEqual(eventbus.eventCount, 0);
         assert.strictEqual(proxy.eventCount, 0);

         proxy.on('test:trigger:sync:off', () =>
         {
            callbacks.testTriggerSyncOff = true;
            return true;
         });

         assert.strictEqual(eventbus.eventCount, 1);
         assert.strictEqual(proxy.eventCount, 1);

         proxy.off('test:trigger:sync:off');

         assert.strictEqual(eventbus.eventCount, 0);
         assert.strictEqual(proxy.eventCount, 0);

         assert.isUndefined(proxy.triggerSync('test:trigger:sync:off'));
         assert.isUndefined(callbacks.testTriggerSyncOff);
      });

      it('triggerSync (Promise)', (done) =>
      {
         proxy.on('test:trigger:sync:then', () =>
         {
            callbacks.testTriggerSyncThen = true;
            return Promise.resolve('foobar');
         });

         assert.strictEqual(eventbus.eventCount, 1);
         assert.strictEqual(proxy.eventCount, 1);

         const promise = proxy.triggerSync('test:trigger:sync:then');

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
         proxy.on('test:trigger:async', () =>
         {
            callbacks.testTriggerAsync = true;
            return 'foo';
         });
         proxy.on('test:trigger:async', () =>
         {
            callbacks.testTriggerAsync2 = true;
            return 'bar';
         });

         assert.strictEqual(eventbus.eventCount, 2);
         assert.strictEqual(proxy.eventCount, 2);

         const promise = proxy.triggerAsync('test:trigger:async');

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
