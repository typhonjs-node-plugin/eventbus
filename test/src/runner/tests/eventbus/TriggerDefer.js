export default class TriggerDefer
{
   static run(Module, data, chai)
   {
      const { assert } = chai;
      const Eventbus = Module.default;

      describe('Eventbus - triggerDefer', () =>
      {
         let callbacks, eventbus;

         beforeEach(() =>
         {
            callbacks = {};
            eventbus = new Eventbus();
         });

         it('triggerDefer', (done) =>
         {
            eventbus.on('test:trigger:defer', () =>
            {
               assert.strictEqual(eventbus.callbackCount, 1);

               done();
            });

            assert.strictEqual(eventbus.callbackCount, 1);

            eventbus.triggerDefer('test:trigger:defer');
         });

         it('triggerDefer (once)', (done) =>
         {
            callbacks.testTriggerOnce = 0;

            eventbus.once('test:trigger:once', () => { callbacks.testTriggerOnce++; });

            assert.strictEqual(eventbus.callbackCount, 1);

            eventbus.on('test:trigger:verify', () =>
            {
               assert.strictEqual(callbacks.testTriggerOnce, 1);

               assert.strictEqual(eventbus.callbackCount, 1);

               done();
            });

            assert.strictEqual(eventbus.callbackCount, 2);

            eventbus.triggerDefer('test:trigger:once');

            assert.strictEqual(eventbus.callbackCount, 2); // Trigger is deferred so 2 events still exist.

            eventbus.triggerDefer('test:trigger:once');

            assert.strictEqual(eventbus.callbackCount, 2); // Trigger is deferred so 2 events still exist.

            eventbus.triggerDefer('test:trigger:verify');
         });

         it('triggerDefer (listenTo)', (done) =>
         {
            const test = new Eventbus();

            callbacks.testTriggerCount = 0;

            test.listenTo(eventbus, 'test:trigger', () => { callbacks.testTriggerCount++; });

            assert.strictEqual(eventbus.callbackCount, 1);

            eventbus.on('test:trigger:verify', () =>
            {
               assert.strictEqual(callbacks.testTriggerCount, 1);

               // Test stop listening such that `test:trigger` is no longer registered.
               test.stopListening(eventbus, 'test:trigger');

               assert.strictEqual(eventbus.callbackCount, 2);
            });

            assert.strictEqual(eventbus.callbackCount, 2);

            eventbus.on('test:trigger:verify:done', () =>
            {
               assert.strictEqual(callbacks.testTriggerCount, 1);

               assert.strictEqual(eventbus.callbackCount, 2);

               done();
            });

            assert.strictEqual(eventbus.callbackCount, 3);

            eventbus.triggerDefer('test:trigger');

            eventbus.triggerDefer('test:trigger:verify');

            eventbus.triggerDefer('test:trigger');

            eventbus.triggerDefer('test:trigger:verify:done');

            assert.strictEqual(eventbus.callbackCount, 3);
         });

         it('triggerDefer (listenToOnce)', (done) =>
         {
            const test = new Eventbus();

            callbacks.testTriggerOnce = 0;

            test.listenToOnce(eventbus, 'test:trigger', () =>
            {
               callbacks.testTriggerOnce++;

               // Must defer here as after callback runs next
               setTimeout(() => { assert.strictEqual(eventbus.callbackCount, 1); }, 0);
            });

            assert.strictEqual(eventbus.callbackCount, 1);

            eventbus.on('test:trigger:verify', () =>
            {
               assert.strictEqual(callbacks.testTriggerOnce, 1);

               assert.strictEqual(eventbus.callbackCount, 1);

               done();
            });

            assert.strictEqual(eventbus.callbackCount, 2);

            eventbus.triggerDefer('test:trigger');
            eventbus.triggerDefer('test:trigger');
            eventbus.triggerDefer('test:trigger:verify');

            assert.strictEqual(eventbus.callbackCount, 2);
         });
      });
   }
}
