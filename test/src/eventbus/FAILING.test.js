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

      // // QUnit.test('#3611 - listenTo is compatible with non-Backbone event libraries', function(assert) {
      // //    var obj = _.extend({}, Backbone.Events);
      // //    var other = {
      // //       events: {},
      // //       on: function(name, callback) {
      // //          this.events[name] = callback;
      // //       },
      // //       trigger: function(name) {
      // //          this.events[name]();
      // //       }
      // //    };
      // //
      // //    obj.listenTo(other, 'test', function() { assert.ok(true); });
      // //    other.trigger('test');
      // // });
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
      //
      // // QUnit.test('#3611 - stopListening is compatible with non-Backbone event libraries', function(assert) {
      // //    var obj = _.extend({}, Backbone.Events);
      // //    var other = {
      // //       events: {},
      // //       on: function(name, callback) {
      // //          this.events[name] = callback;
      // //       },
      // //       off: function() {
      // //          this.events = {};
      // //       },
      // //       trigger: function(name) {
      // //          var fn = this.events[name];
      // //          if (fn) fn();
      // //       }
      // //    };
      // //
      // //    obj.listenTo(other, 'test', function() { assert.ok(false); });
      // //    obj.stopListening(other);
      // //    other.trigger('test');
      // //    assert.equal(_.size(obj._listeningTo), 0);
      // // });
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
   });
}
