import { assert, expect }  from 'chai';

import Eventbus            from '../../../src/Eventbus.js';

import config              from '../../utils/config.js';
import { size }            from '../../utils/functions.js';

// Tests from Backbone

if (config.backbone)
{
   describe('Eventbus - backbone tests', () =>
   {
      let a, b, count, count2, eventbus;

      beforeEach(() =>
      {
         count = 0;
         count2 = 0;
         a = new Eventbus();
         b = new Eventbus();
         eventbus = new Eventbus();
      });

      it('listenToOnce with event maps binds the correct `this`', () =>
      {
         a.listenToOnce(b, {
            one: function() { count++; assert.ok(this === a); },
            two: function() { assert.ok(false); }
         });
         b.trigger('one');
         b.trigger('one');
         assert.strictEqual(count, 1);
      });

      it('bind a callback with a default context when none supplied', () =>
      {
         eventbus.assertTrue = function()
         {
            count++;
            assert.equal(this, eventbus, '`this` was bound to the callback');
         };

         eventbus.once('event', eventbus.assertTrue);
         eventbus.trigger('event');
         eventbus.trigger('event');
         assert.strictEqual(count, 1);
      });

      it('once with event maps', () =>
      {
         const increment = function() { this.counter += 1; };

         eventbus.counter = 0;

         eventbus.once({
            a: increment,
            b: increment,
            c: increment
         }, eventbus);

         eventbus.trigger('a');
         assert.equal(eventbus.counter, 1);

         eventbus.trigger('a b');
         assert.equal(eventbus.counter, 2);

         eventbus.trigger('c');
         assert.equal(eventbus.counter, 3);

         eventbus.trigger('a b c');
         assert.equal(eventbus.counter, 3);
      });

      it('bind a callback with a supplied context using once with object notation', () =>
      {
         const context = {};

         eventbus.counter = 0;

         eventbus.once({
            a: function()
            {
               count++;
               assert.strictEqual(this, context, 'defaults `context` to `callback` param');
            }
         }, context).trigger('a');

         eventbus.trigger('a');
         assert.strictEqual(count, 1);
      });

      it('listenToOnce with space-separated events', () =>
      {
         count = 1;
         a.listenToOnce(b, 'x y', (n) => { assert.ok(n === count++); });
         b.trigger('x', 1);
         b.trigger('x', 1);
         b.trigger('y', 2);
         b.trigger('y', 2);
      });

      it('listenToOnce', () =>
      {
         // Same as the previous test, but we use once rather than having to explicitly unbind
         const incrA = () => { count++; eventbus.trigger('event'); };
         const incrB = () => { count2++; };
         eventbus.listenToOnce(eventbus, 'event', incrA);
         eventbus.listenToOnce(eventbus, 'event', incrB);
         eventbus.trigger('event');
         assert.equal(count, 1, 'count should have only been incremented once.');
         assert.equal(count2, 1, 'count2 should have only been incremented once.');
      });

      it('once', () =>
      {
         const incrA = function() { count++; eventbus.trigger('event'); };
         const incrB = function() { count2++; };
         eventbus.once('event', incrA);
         eventbus.once('event', incrB);
         eventbus.trigger('event');
         assert.strictEqual(eventbus.eventCount, 0);
         assert.equal(count, 1, 'count should have only been incremented once.');
         assert.equal(count2, 1, 'count2 should have only been incremented once.');
      });

      it('`once` on `all` should work as expected', () =>
      {
         eventbus.once('all', () =>
         {
            count++;
            assert.ok(true);
            eventbus.trigger('all');
         });
         eventbus.trigger('all');

         assert.strictEqual(count, 1);
      });

      it('listenTo and stopListening', () =>
      {
         a.listenTo(b, 'all', () => { count++; assert.ok(true); });
         b.trigger('anything');
         a.listenTo(b, 'all', () => { count++; assert.ok(false); });
         a.stopListening();
         b.trigger('anything');
         assert.strictEqual(count, 1);
      });

      it('listenTo and stopListening with event maps', () =>
      {
         const cb = () => { count++; assert.ok(true); };
         a.listenTo(b, { event: cb });
         b.trigger('event');
         a.listenTo(b, { event2: cb });
         b.on('event2', cb);
         a.stopListening(b, { event2: cb });
         b.trigger('event event2');
         a.stopListening();
         b.trigger('event event2');
         assert.strictEqual(count, 4);
      });

      it('stopListening with omitted args', () =>
      {
         const cb = () => { count++; assert.ok(true); };
         a.listenTo(b, 'event', cb);
         b.on('event', cb);
         a.listenTo(b, 'event2', cb);
         a.stopListening(null, { event: cb });
         b.trigger('event event2');
         b.off();
         a.listenTo(b, 'event event2', cb);
         a.stopListening(null, 'event');
         a.stopListening();
         b.trigger('event2');
         assert.strictEqual(count, 2);
      });

      it('listenToOnce and stopListening', () =>
      {
         a.listenToOnce(b, 'all', () => { count++; assert.ok(true); });
         b.trigger('anything');
         b.trigger('anything');
         a.listenToOnce(b, 'all', () => { count++; assert.ok(false); });
         a.stopListening();
         b.trigger('anything');
         assert.strictEqual(count, 1);
      });

      it('listenTo, listenToOnce and stopListening', () =>
      {
         a.listenToOnce(b, 'all', () => { count++; assert.ok(true); });
         b.trigger('anything');
         b.trigger('anything');
         a.listenTo(b, 'all', () => { count++; assert.ok(false); });
         a.stopListening();
         b.trigger('anything');
         assert.strictEqual(count, 1);
      });

      it('listenTo and stopListening with event maps', () =>
      {
         a.listenTo(b, { change: () => { count++; assert.ok(true); } });
         b.trigger('change');
         a.listenTo(b, { change: () => { count++; assert.ok(false); } });
         a.stopListening();
         b.trigger('change');
         assert.strictEqual(count, 1);
      });

      it('listenTo yourself', () =>
      {
         eventbus.listenTo(eventbus, 'foo', () => { count++; assert.ok(true); });
         eventbus.trigger('foo');
         assert.strictEqual(count, 1);
      });

      it('listenTo yourself cleans yourself up with stopListening', () =>
      {
         eventbus.listenTo(eventbus, 'foo', () => { count++; assert.ok(true); });
         eventbus.trigger('foo');
         eventbus.stopListening();
         eventbus.trigger('foo');
         assert.strictEqual(count, 1);
      });

      it('stopListening cleans up references', () =>
      {
         const fn = () => {};
         b.on('event', fn);
         a.listenTo(b, 'event', fn).stopListening();
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
         a.listenTo(b, 'event', fn).stopListening(b);
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
         a.listenTo(b, 'event', fn).stopListening(b, 'event');
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
         a.listenTo(b, 'event', fn).stopListening(b, 'event', fn);
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
      });

      it('stopListening cleans up references from listenToOnce', () =>
      {
         const fn = () => {};
         b.on('event', fn);
         a.listenToOnce(b, 'event', fn).stopListening();
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
         a.listenToOnce(b, 'event', fn).stopListening(b);
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
         a.listenToOnce(b, 'event', fn).stopListening(b, 'event');
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
         a.listenToOnce(b, 'event', fn).stopListening(b, 'event', fn);
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._events.event), 1);
         assert.equal(size(b._listeners), 0);
      });

      it('listenTo and off cleaning up references', () =>
      {
         const fn = () => {};
         a.listenTo(b, 'event', fn);
         b.off();
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._listeners), 0);
         a.listenTo(b, 'event', fn);
         b.off('event');
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._listeners), 0);
         a.listenTo(b, 'event', fn);
         b.off(null, fn);
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._listeners), 0);
         a.listenTo(b, 'event', fn);
         b.off(null, null, a);
         assert.equal(size(a._listeningTo), 0);
         assert.equal(size(b._listeners), 0);
      });

      it('listenTo and stopListening cleaning up references', () =>
      {
         a.listenTo(b, 'all', () => { assert.ok(true); });
         b.trigger('anything');
         a.listenTo(b, 'other', () => { assert.ok(false); });
         a.stopListening(b, 'other');
         a.stopListening(b, 'all');
         assert.equal(size(a._listeningTo), 0);
      });

      it('listenToOnce without context cleans up references after the event has fired', () =>
      {
         a.listenToOnce(b, 'all', () => { assert.ok(true); });
         b.trigger('anything');
         assert.equal(size(a._listeningTo), 0);
      });

      it('listenToOnce with event maps cleans up references', () =>
      {
         a.listenToOnce(b, {
            one: () => { assert.ok(true); },
            two: () => { assert.ok(false); }
         });
         b.trigger('one');
         assert.equal(size(a._listeningTo), 1);
      });

      it(`listenTo with empty callback doesn't throw an error`, () =>
      {
         a.listenTo(a, 'foo', null);
         a.trigger('foo');
         assert.ok(true);
      });

      it('trigger all for each event', () =>
      {
         let one, two;

         eventbus.on('all', (event) =>
         {
            count++;
            if (event === 'one') { one = true; }
            if (event === 'two') { two = true; }
         })
            .trigger('one two');
         assert.ok(one);
         assert.ok(two);
         assert.equal(count, 2);
      });

      it('on, then unbind all functions', () =>
      {
         const callback = () => { count++; };
         eventbus.on('event', callback);
         eventbus.trigger('event');
         eventbus.off('event');
         eventbus.trigger('event');
         assert.equal(count, 1, 'counter should have only been incremented once.');
      });

      it('unbind a callback in the midst of it firing', () =>
      {
         const callback = () =>
         {
            count++;
            eventbus.off('event', callback);
         };
         eventbus.on('event', callback);
         eventbus.trigger('event');
         eventbus.trigger('event');
         eventbus.trigger('event');
         assert.equal(count, 1, 'the callback should have been unbound.');
      });

      it('two binds that unbind themselves', () =>
      {
         const incrA = () => { count++; eventbus.off('event', incrA); };
         const incrB = () => { count2++; eventbus.off('event', incrB); };

         eventbus.on('event', incrA);
         eventbus.on('event', incrB);
         eventbus.trigger('event');
         eventbus.trigger('event');
         eventbus.trigger('event');
         assert.equal(count, 1, 'count should have only been incremented once.');
         assert.equal(count2, 1, 'count2 should have only been incremented once.');
      });

      it('bind a callback with a supplied context', () =>
      {
         const TestClass = function()
         {
            return this;
         };

         TestClass.prototype.assertTrue = function()
         {
            count++;
            assert.ok(true, '`this` was bound to the callback');
         };

         eventbus.on('event', function() { this.assertTrue(); }, new TestClass());
         eventbus.trigger('event');

         assert.strictEqual(count, 1);
      });

      it('nested trigger with unbind', () =>
      {
         const incr1 = function() { count++; eventbus.off('event', incr1); eventbus.trigger('event'); };
         const incr2 = function() { count++; };
         eventbus.on('event', incr1);
         eventbus.on('event', incr2);
         eventbus.trigger('event');
         assert.equal(count, 3, 'counter should have been incremented three times');
      });

      it('callback list is not altered during trigger', () =>
      {
            const incr = () => { count++; };
            const incrOn = () => { eventbus.on('event all', incr); };
            const incrOff = () => { eventbus.off('event all', incr); };

            eventbus.on('event all', incrOn).trigger('event');
            assert.equal(count, 0, 'on does not alter callback list');

            eventbus.off().on('event', incrOff).on('event all', incr).trigger('event');
            assert.equal(count, 2, 'off does not alter callback list');
      });

      it(`'all' callback list is retrieved after each event`, () =>
      {
         const incr = () => { count++; };

         eventbus.on('x', () => { eventbus.on('y', incr).on('all', incr); }).trigger('x y');
         assert.strictEqual(count, 2);
      });

      it('if callback is truthy but not a function, `on` should throw an error just like jQuery', () =>
      {
         eventbus.on('test', 'noop');

         expect(() => eventbus.trigger('test')).to.throw(TypeError);
      });

      it('remove all events for a specific context', () =>
      {
         const ctx = {};
         eventbus.on('x y all', () => { count++; assert.ok(true); });
         eventbus.on('x y all', () => { count++; assert.ok(false); }, ctx);
         eventbus.off(null, null, ctx);
         eventbus.trigger('x y');
         assert.strictEqual(count, 4);
      });

      it('remove all events for a specific callback', () =>
      {
         const success = () => { count++; assert.ok(true); };
         const fail = () => { assert.ok(false); };
         eventbus.on('x y all', success);
         eventbus.on('x y all', fail);
         eventbus.off(null, fail);
         eventbus.trigger('x y');
         assert.strictEqual(count, 4);
      });

      it('off does not skip consecutive events', () =>
      {
         eventbus.on('event', () => { assert.ok(false); }, eventbus);
         eventbus.on('event', () => { assert.ok(false); }, eventbus);
         eventbus.off(null, null, eventbus);
         eventbus.trigger('event');
      });

      it('once variant one', () =>
      {
         const f = () => { count++; assert.ok(true); };

         a.once('event', f);
         b.on('event', f);

         a.trigger('event');
         a.trigger('event');
         b.trigger('event');
         b.trigger('event');

         assert.strictEqual(count, 3);
      });

      it('once variant two', () =>
      {
         const f = () => { count++; assert.ok(true); };

         eventbus
            .once('event', f)
            .on('event', f)
            .trigger('event')
            .trigger('event');

         assert.strictEqual(count, 3);
      });

      it('once with off', () =>
      {
         const f = () => { count++; assert.ok(true); };

         eventbus.once('event', f);
         eventbus.off('event', f);
         eventbus.trigger('event');

         assert.strictEqual(count, 0);
      });

      it('once with off only by context', () =>
      {
         const context = {};
         eventbus.once('event', () => { assert.ok(false); }, context);
         eventbus.off(null, null, context);
         eventbus.trigger('event');
      });

      it('once with multiple events', () =>
      {
         eventbus.once('x y', () => { count++; assert.ok(true); });
         eventbus.trigger('x y');
         eventbus.trigger('x y');

         assert.strictEqual(count, 2);
      });

      it('Off during iteration with once', () =>
      {
         const f = function() { this.off('event', f); };

         eventbus.on('event', f);
         eventbus.once('event', () => {});
         eventbus.on('event', () => { count++; assert.ok(true); });

         eventbus.trigger('event');
         eventbus.trigger('event');

         assert.strictEqual(count, 2);
      });

      it('listenTo is compatible with non-Backbone event libraries', () =>
      {
         const other = {
            events: {},
            on: function(name, callback)
            {
               this.events[name] = callback;
            },
            trigger: function(name)
            {
               this.events[name]();
            }
         };

         eventbus.listenTo(other, 'test', () => { count++; assert.ok(true); });
         other.trigger('test');

         assert.strictEqual(count, 1);
      });

      it('stopListening is compatible with non-Backbone event libraries', () =>
      {
         const other = {
            _events: {},
            on: function(name, callback)
            {
               this._events[name] = callback;
            },
            off: function()
            {
               this._events = {};
            },
            trigger: function(name)
            {
               const fn = this._events[name];
               if (fn) { fn(); }
            }
         };

         eventbus.listenTo(other, 'test', () => { assert.ok(false); });
         eventbus.stopListening(other);
         other.trigger('test');

         assert.equal(size(eventbus._listeningTo), 0);
      });

      it('fabricated error in other eventbus implementation', () =>
      {
         const other = {
            _events: {},
            on: function()
            {
               throw new Error('Other Eventbus On Fake Error');
            },
            off: function()
            {
               this._events = {};
            },
            trigger: function(name)
            {
               const fn = this._events[name];
               if (fn) { fn(); }
            }
         };

         expect(() => eventbus.listenTo(other, 'test', () => {})).to.throw(Error, 'Other Eventbus On Fake Error');
      });
   });
}
