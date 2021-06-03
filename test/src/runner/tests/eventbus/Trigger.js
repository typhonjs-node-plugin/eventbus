/**
 * @param {object}                           opts - Test options
 * @param {import('../../../../../types')}   opts.Module - Module to test
 * @param {object}                           opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert } = chai;
   const Eventbus = Module.default;

   describe('Eventbus - trigger', () =>
   {
      let callbacks, eventbus;

      beforeEach(() =>
      {
         callbacks = {};
         eventbus = new Eventbus();
      });

      it('trigger', () =>
      {
         eventbus.on('test:trigger', () => { callbacks.testTrigger = true; });
         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 1);

         assert.isTrue(callbacks.testTrigger);
      });

      it('object composition - trigger (on / off)', () =>
      {
         const anObject = {
            events: new Eventbus(),
            register: function() { this.events.on('test:trigger', this.handler, this); },
            testTrigger: 0,
            triggerTest: function() { this.events.trigger('test:trigger'); },
            handler: function() { this.testTrigger++; }
         };

         anObject.register();
         anObject.triggerTest();

         assert.strictEqual(anObject.events.callbackCount, 1);

         assert.strictEqual(anObject.testTrigger, 1);

         anObject.events.off();

         assert.strictEqual(anObject.events.callbackCount, 0);

         anObject.triggerTest();
         anObject.triggerTest();

         assert.strictEqual(anObject.testTrigger, 1);
      });

      it('trigger (on / off)', () =>
      {
         callbacks.testTrigger = 0;
         eventbus.on('test:trigger', () => { callbacks.testTrigger++; });
         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 1);

         assert.strictEqual(callbacks.testTrigger, 1);

         eventbus.off();

         assert.strictEqual(eventbus.callbackCount, 0);

         eventbus.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         assert.strictEqual(callbacks.testTrigger, 1);
      });

      it('trigger (multiple args)', () =>
      {
         callbacks.testTrigger1 = 0;
         callbacks.testTrigger2 = 0;
         callbacks.testTrigger3 = 0;
         callbacks.testTrigger4 = 0;

         eventbus.on('test:trigger:1', (arg1) =>
         {
            callbacks.testTrigger1++;
            assert.strictEqual(arg1, 1);
         });

         eventbus.on('test:trigger:2', (arg1, arg2) =>
         {
            callbacks.testTrigger2++;
            assert.strictEqual(arg1, 1);
            assert.strictEqual(arg2, 2);
         });

         eventbus.on('test:trigger:3', (arg1, arg2, arg3) =>
         {
            callbacks.testTrigger3++;
            assert.strictEqual(arg1, 1);
            assert.strictEqual(arg2, 2);
            assert.strictEqual(arg3, 3);
         });

         eventbus.on('test:trigger:4', (arg1, arg2, arg3, arg4) =>
         {
            callbacks.testTrigger4++;
            assert.strictEqual(arg1, 1);
            assert.strictEqual(arg2, 2);
            assert.strictEqual(arg3, 3);
            assert.strictEqual(arg4, 4);
         });

         eventbus.trigger('test:trigger:1', 1);
         eventbus.trigger('test:trigger:2', 1, 2);
         eventbus.trigger('test:trigger:3', 1, 2, 3);
         eventbus.trigger('test:trigger:4', 1, 2, 3, 4);

         assert.strictEqual(eventbus.callbackCount, 4);

         assert.strictEqual(callbacks.testTrigger1, 1);
         assert.strictEqual(callbacks.testTrigger2, 1);
         assert.strictEqual(callbacks.testTrigger3, 1);
         assert.strictEqual(callbacks.testTrigger4, 1);
      });

      it('trigger - binding and triggering multiple events', () =>
      {
         callbacks.counter = 0;

         eventbus.on('a b c', () => { callbacks.counter++; });

         eventbus.trigger('a');
         assert.strictEqual(callbacks.counter, 1);

         eventbus.trigger('a b');
         assert.strictEqual(callbacks.counter, 3);

         eventbus.trigger('c');
         assert.strictEqual(callbacks.counter, 4);

         eventbus.off('a c');
         eventbus.trigger('a b c');
         assert.strictEqual(callbacks.counter, 5);
      });

      it('trigger - binding and triggering with event maps', () =>
      {
         callbacks.counter = 0;

         const increment = () => { callbacks.counter++; };

         eventbus.on({
            a: increment,
            b: increment,
            c: increment
         });

         eventbus.trigger('a');
         assert.strictEqual(callbacks.counter, 1);

         eventbus.trigger('a b');
         assert.strictEqual(callbacks.counter, 3);

         eventbus.trigger('c');
         assert.strictEqual(callbacks.counter, 4);

         eventbus.off({
            a: increment,
            c: increment
         });

         eventbus.trigger('a b c');
         assert.strictEqual(callbacks.counter, 5);
      });

      it('trigger - binding and triggering multiple event names with event maps', () =>
      {
         callbacks.counter = 0;

         const increment = () => { callbacks.counter++; };

         eventbus.on({
            'a b c': increment,
         });

         eventbus.trigger('a');
         assert.strictEqual(callbacks.counter, 1);

         eventbus.trigger('a b');
         assert.strictEqual(callbacks.counter, 3);

         eventbus.trigger('c');
         assert.strictEqual(callbacks.counter, 4);

         eventbus.off({
            'a c': increment,
         });

         eventbus.trigger('a b c');
         assert.strictEqual(callbacks.counter, 5);
      });

      it('trigger - binding and trigger with event maps context', () =>
      {
         callbacks.counter = 0;

         const context = {};

         eventbus.on({
            a: function() { assert.strictEqual(this, context, 'defaults `context` to `callback` param'); }
         }, context).trigger('a');

         eventbus.off().on({
            a: function() { assert.strictEqual(this, context, 'will not override explicit `context` param'); }
         }, this, context).trigger('a');
      });

      it('trigger (once)', () =>
      {
         callbacks.testTriggerOnce = 0;
         eventbus.once('test:trigger:once', () => { callbacks.testTriggerOnce++; });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         eventbus.trigger('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);
      });

      it('trigger (listenTo)', () =>
      {
         const test = new Eventbus();

         callbacks.testTriggerCount = 0;

         test.listenTo(eventbus, 'test:trigger', () => { callbacks.testTriggerCount++; });

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 1);

         assert.strictEqual(callbacks.testTriggerCount, 1);

         // Test stop listening such that `test:trigger` is no longer registered.
         test.stopListening(eventbus, 'test:trigger');

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerCount, 1);
      });

      it('trigger (listenToBefpre)', () =>
      {
         const test = new Eventbus();

         callbacks.testTrigger = 0;

         test.listenToBefore(4, eventbus, 'test:trigger', () => { callbacks.testTrigger++; });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test:trigger');
         eventbus.trigger('test:trigger');
         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTrigger, 4);

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTrigger, 4);
      });

      it('trigger (listenToOnce)', () =>
      {
         const test = new Eventbus();

         callbacks.testTriggerOnce = 0;

         test.listenToOnce(eventbus, 'test:trigger', () => { callbacks.testTriggerOnce++; });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);
      });
   });
}

