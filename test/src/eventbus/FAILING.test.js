import { assert } from 'chai';

import Eventbus   from '../../../src/Eventbus.js';

import config     from '../../utils/config.js';
import { size }   from '../../utils/functions.js';

if (config.failing)
{
   describe('Eventbus - FAILING', () =>
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

      // QUnit.test('listenToOnce', function(assert) {
      //    assert.expect(2);
      //    // Same as the previous test, but we use once rather than having to explicitly unbind
      //    var obj = {counterA: 0, counterB: 0};
      //    _.extend(obj, Backbone.Events);
      //    var incrA = function(){ obj.counterA += 1; obj.trigger('event'); };
      //    var incrB = function(){ obj.counterB += 1; };
      //    obj.listenToOnce(obj, 'event', incrA);
      //    obj.listenToOnce(obj, 'event', incrB);
      //    obj.trigger('event');
      //    assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
      //    assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
      // });
      it('listenToOnce', () =>
      {
         // Same as the previous test, but we use once rather than having to explicitly unbind
         const incrA = () => { count += 1; eventbus.trigger('event'); };
         const incrB = () => { count2 += 1; };
         eventbus.listenToOnce(eventbus, 'event', incrA);
         eventbus.listenToOnce(eventbus, 'event', incrB);
         eventbus.trigger('event');
         assert.equal(count, 1, 'counterA should have only been incremented once.');
         assert.equal(count2, 1, 'counterB should have only been incremented once.');
      });

      // QUnit.test('listenToOnce with event maps binds the correct `this`', function(assert) {
      //    assert.expect(1);
      //    var a = _.extend({}, Backbone.Events);
      //    var b = _.extend({}, Backbone.Events);
      //    a.listenToOnce(b, {
      //       one: function() { assert.ok(this === a); },
      //       two: function() { assert.ok(false); }
      //    });
      //    b.trigger('one');
      // });
      it('listenToOnce with event maps binds the correct `this`', () =>
      {
         a.listenToOnce(b, {
            one: function() { assert.ok(this === a); },
            two: function() { assert.ok(false); }
         });
         b.trigger('one');
      });

      // QUnit.test('bind a callback with a default context when none supplied', function(assert) {
      //    assert.expect(1);
      //    var obj = _.extend({
      //       assertTrue: function() {
      //          assert.equal(this, obj, '`this` was bound to the callback');
      //       }
      //    }, Backbone.Events);
      //
      //    obj.once('event', obj.assertTrue);
      //    obj.trigger('event');
      // });
      it('bind a callback with a default context when none supplied', () =>
      {
         eventbus.assertTrue = function()
         {
            assert.equal(this, eventbus, '`this` was bound to the callback');
         };

         eventbus.once('event', eventbus.assertTrue);
         eventbus.trigger('event');
      });

      // QUnit.test('once', function(assert) {
      //    assert.expect(2);
      //    // Same as the previous test, but we use once rather than having to explicitly unbind
      //    var obj = {counterA: 0, counterB: 0};
      //    _.extend(obj, Backbone.Events);
      //    var incrA = function(){ obj.counterA += 1; obj.trigger('event'); };
      //    var incrB = function(){ obj.counterB += 1; };
      //    obj.once('event', incrA);
      //    obj.once('event', incrB);
      //    obj.trigger('event');
      //    assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
      //    assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
      // });
      it('once', () =>
      {
         const incrA = function() { console.log('!!!A'); count++; eventbus.trigger('event'); };
         const incrB = function() { console.log('!!!B'); count2++; };
         eventbus.once('event', incrA);
         eventbus.once('event', incrB);
         eventbus.trigger('event');
         assert.equal(count, 1, 'counterA should have only been incremented once.');
         assert.equal(count2, 1, 'counterB should have only been incremented once.');
      });

      // QUnit.test('once with event maps', function(assert) {
      //    var obj = {counter: 0};
      //    _.extend(obj, Backbone.Events);
      //
      //    var increment = function() {
      //       this.counter += 1;
      //    };
      //
      //    obj.once({
      //       a: increment,
      //       b: increment,
      //       c: increment
      //    }, obj);
      //
      //    obj.trigger('a');
      //    assert.equal(obj.counter, 1);
      //
      //    obj.trigger('a b');
      //    assert.equal(obj.counter, 2);
      //
      //    obj.trigger('c');
      //    assert.equal(obj.counter, 3);
      //
      //    obj.trigger('a b c');
      //    assert.equal(obj.counter, 3);
      // });
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

      // QUnit.test('bind a callback with a supplied context using once with object notation', function(assert) {
      //    assert.expect(1);
      //    var obj = {counter: 0};
      //    var context = {};
      //    _.extend(obj, Backbone.Events);
      //
      //    obj.once({
      //       a: function() {
      //          assert.strictEqual(this, context, 'defaults `context` to `callback` param');
      //       }
      //    }, context).trigger('a');
      // });
      it('bind a callback with a supplied context using once with object notation', () =>
      {
         const context = {};

         eventbus.counter = 0;

         eventbus.once({
            a: function()
            {
               assert.strictEqual(this, context, 'defaults `context` to `callback` param');
            }
         }, context).trigger('a');
      });

      // QUnit.test('`once` on `all` should work as expected', function(assert) {
      //    assert.expect(1);
      //    Backbone.once('all', function() {
      //       assert.ok(true);
      //       Backbone.trigger('all');
      //    });
      //    Backbone.trigger('all');
      // });
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

      // TODO THIS ONE PROBABLY HELPS PINPOINT A PROBLEM SPOT.
      // QUnit.test('#3448 - listenToOnce with space-separated events', function(assert) {
      //    assert.expect(2);
      //    var one = _.extend({}, Backbone.Events);
      //    var two = _.extend({}, Backbone.Events);
      //    var count = 1;
      //    one.listenToOnce(two, 'x y', function(n) { assert.ok(n === count++); });
      //    two.trigger('x', 1);
      //    two.trigger('x', 1);
      //    two.trigger('y', 2);
      //    two.trigger('y', 2);
      // });
      it('listenToOnce with space-separated events', () =>
      {
         count = 1;
         a.listenToOnce(b, 'x y', (n) => { console.log(`!! n: ${JSON.stringify(Object.keys(n))} - count: ${count}`); assert.ok(n === count++); });
         b.trigger('x', 1);
         b.trigger('x', 1);
         b.trigger('y', 2);
         b.trigger('y', 2);
      });

      // QUnit.test('#3611 - listenTo is compatible with non-Backbone event libraries', function(assert) {
      //    var obj = _.extend({}, Backbone.Events);
      //    var other = {
      //       events: {},
      //       on: function(name, callback) {
      //          this.events[name] = callback;
      //       },
      //       trigger: function(name) {
      //          this.events[name]();
      //       }
      //    };
      //
      //    obj.listenTo(other, 'test', function() { assert.ok(true); });
      //    other.trigger('test');
      // });
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

      // QUnit.test('#3611 - stopListening is compatible with non-Backbone event libraries', function(assert) {
      //    var obj = _.extend({}, Backbone.Events);
      //    var other = {
      //       events: {},
      //       on: function(name, callback) {
      //          this.events[name] = callback;
      //       },
      //       off: function() {
      //          this.events = {};
      //       },
      //       trigger: function(name) {
      //          var fn = this.events[name];
      //          if (fn) fn();
      //       }
      //    };
      //
      //    obj.listenTo(other, 'test', function() { assert.ok(false); });
      //    obj.stopListening(other);
      //    other.trigger('test');
      //    assert.equal(_.size(obj._listeningTo), 0);
      // });
      it('stopListening is compatible with non-Backbone event libraries', () =>
      {
         const other = {
            events: {},
            on: function(name, callback)
            {
               this.events[name] = callback;
            },
            off: function()
            {
               this.events = {};
            },
            trigger: function(name)
            {
               const fn = this.events[name];
               if (fn) { fn(); }
            }
         };

         eventbus.listenTo(other, 'test', () => { assert.ok(false); });
         eventbus.stopListening(other);
         other.trigger('test');

         assert.equal(size(eventbus._listeningTo), 0);
      });
   });
}
