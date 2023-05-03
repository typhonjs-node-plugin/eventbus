/**
 * @param {object}                           opts - Test options
 *
 * @param {import('../../../../../types')}   opts.Module - Module to test
 *
 * @param {object}                           opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert } = chai;
   const { Eventbus } = Module;

   describe('Eventbus - triggerSync', () =>
   {
      let callbacks;

      /**
       * @type {import('../../../../../types').Eventbus}
       */
      let eventbus;

      beforeEach(() =>
      {
         callbacks = {};
         eventbus = new Eventbus();
      });

      it('triggerSync - binding and triggering multiple events', () =>
      {
         callbacks.counter = 0;
         let results;

         eventbus.on('a b c', () =>
         {
            callbacks.counter++;
            return true;
         });
         eventbus.on('d', () =>
         {
            callbacks.counter++;
            return [false, false];
         });
         eventbus.on('e', () => { callbacks.counter++; });

         results = eventbus.triggerSync('a');
         assert.strictEqual(callbacks.counter, 1);
         assert.isTrue(results);

         results = eventbus.triggerSync('a e b');
         assert.strictEqual(callbacks.counter, 4);
         assert.isArray(results);
         assert.strictEqual(results.length, 2);
         assert.isTrue(results[0]);
         assert.isTrue(results[1]);

         results = eventbus.triggerSync('a d b');
         assert.strictEqual(callbacks.counter, 7);
         assert.isArray(results);
         assert.strictEqual(results.length, 4);
         assert.isTrue(results[0]);
         assert.isFalse(results[1]);
         assert.isFalse(results[2]);
         assert.isTrue(results[3]);

         results = eventbus.triggerSync('d a c');
         assert.strictEqual(callbacks.counter, 10);
         assert.isArray(results);
         assert.strictEqual(results.length, 4);
         assert.isFalse(results[0]);
         assert.isFalse(results[1]);
         assert.isTrue(results[2]);
         assert.isTrue(results[3]);

         results = eventbus.triggerSync('d d');
         assert.strictEqual(callbacks.counter, 12);
         assert.isArray(results);
         assert.strictEqual(results.length, 4);
         assert.isFalse(results[0]);
         assert.isFalse(results[1]);
         assert.isFalse(results[2]);
         assert.isFalse(results[3]);

         results = eventbus.triggerSync('c');
         assert.strictEqual(callbacks.counter, 13);
         assert.isTrue(results);

         eventbus.off('a c');
         results = eventbus.triggerSync('a b e c d');
         assert.strictEqual(callbacks.counter, 16);
         assert.isArray(results);
         assert.strictEqual(results.length, 3);
         assert.isTrue(results[0]);
         assert.isFalse(results[1]);
         assert.isFalse(results[2]);
      });

      it('triggerSync (multiple args)', async () =>
      {
         callbacks.testTrigger1 = 0;
         callbacks.testTrigger2 = 0;
         callbacks.testTrigger3 = 0;
         callbacks.testTrigger4 = 0;

         eventbus.on('test:trigger:1', (arg1) =>
         {
            callbacks.testTrigger1++;
            assert.strictEqual(arg1, 1);
            return true;
         });

         eventbus.on('test:trigger:2', (arg1, arg2) =>
         {
            callbacks.testTrigger2++;
            assert.strictEqual(arg1, 1);
            assert.strictEqual(arg2, 2);
            return true;
         });

         eventbus.on('test:trigger:3', (arg1, arg2, arg3) =>
         {
            callbacks.testTrigger3++;
            assert.strictEqual(arg1, 1);
            assert.strictEqual(arg2, 2);
            assert.strictEqual(arg3, 3);
            return true;
         });

         eventbus.on('test:trigger:4', (arg1, arg2, arg3, arg4) =>
         {
            callbacks.testTrigger4++;
            assert.strictEqual(arg1, 1);
            assert.strictEqual(arg2, 2);
            assert.strictEqual(arg3, 3);
            assert.strictEqual(arg4, 4);
            return true;
         });

         assert.isTrue(eventbus.triggerSync('test:trigger:1', 1));
         assert.isTrue(eventbus.triggerSync('test:trigger:2', 1, 2));
         assert.isTrue(eventbus.triggerSync('test:trigger:3', 1, 2, 3));
         assert.isTrue(eventbus.triggerSync('test:trigger:4', 1, 2, 3, 4));

         assert.strictEqual(eventbus.callbackCount, 4);

         assert.strictEqual(callbacks.testTrigger1, 1);
         assert.strictEqual(callbacks.testTrigger2, 1);
         assert.strictEqual(callbacks.testTrigger3, 1);
         assert.strictEqual(callbacks.testTrigger4, 1);
      });

      it('triggerSync no results (void)', () =>
      {
         eventbus.on('test:trigger:sync', () =>
         {
            callbacks.testTriggerSync = true;
         });

         const result = eventbus.triggerSync('test:trigger:sync');

         assert.isTrue(callbacks.testTriggerSync);
         assert.strictEqual(eventbus.callbackCount, 1);
         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('triggerSync-0', () =>
      {
         const result = eventbus.triggerSync('test:trigger:sync0');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('triggerSync-1', () =>
      {
         eventbus.on('test:trigger:sync1', () =>
         {
            callbacks.testTriggerSync1 = true;
            return 'foo';
         });

         assert.strictEqual(eventbus.callbackCount, 1);

         const result = eventbus.triggerSync('test:trigger:sync1');

         assert.isTrue(callbacks.testTriggerSync1);
         assert.isNotArray(result);
         assert.strictEqual(result, 'foo');
      });

      it('triggerSync-2', () =>
      {
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

         const results = eventbus.triggerSync('test:trigger:sync2');

         assert.isTrue(callbacks.testTriggerSync2A);
         assert.isTrue(callbacks.testTriggerSync2B);
         assert.isArray(results);
         assert.strictEqual(results.length, 2);
         assert.strictEqual(results[0], 'foo');
         assert.strictEqual(results[1], 'bar');
      });

      it('triggerSync-2 (only 1 result)', () =>
      {
         eventbus.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2A = true;
            return 'foo';
         });
         eventbus.on('test:trigger:sync2', () => { callbacks.testTriggerSync2B = true; });

         assert.strictEqual(eventbus.callbackCount, 2);

         const results = eventbus.triggerSync('test:trigger:sync2');

         assert.isTrue(callbacks.testTriggerSync2A);
         assert.isTrue(callbacks.testTriggerSync2B);
         assert.isString(results);
         assert.strictEqual(results, 'foo');
      });

      it('triggerSync-3 (2 results)', () =>
      {
         eventbus.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2A = true;
            return 'foo';
         });
         eventbus.on('test:trigger:sync2', () => { callbacks.testTriggerSync2B = true; });
         eventbus.on('test:trigger:sync2', () =>
         {
            callbacks.testTriggerSync2C = true;
            return 'bar';
         });

         assert.strictEqual(eventbus.callbackCount, 3);

         const results = eventbus.triggerSync('test:trigger:sync2');

         assert.isTrue(callbacks.testTriggerSync2A);
         assert.isTrue(callbacks.testTriggerSync2B);
         assert.isTrue(callbacks.testTriggerSync2C);
         assert.isArray(results);
         assert.strictEqual(results.length, 2);
         assert.strictEqual(results[0], 'foo');
         assert.strictEqual(results[1], 'bar');
      });

      it('triggerSync (on / off)', () =>
      {
         assert.strictEqual(eventbus.callbackCount, 0);

         eventbus.on('test:trigger:sync:off', () =>
         {
            callbacks.testTriggerSyncOff = true;
            return true;
         });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.off('test:trigger:sync:off');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.isUndefined(eventbus.triggerSync('test:trigger:sync:off'));
         assert.isUndefined(callbacks.testTriggerSyncOff);
      });

      it('triggerSync-1 (once)', () =>
      {
         callbacks.testTriggerOnce = 0;

         eventbus.once('test:trigger:once', () =>
         {
            callbacks.testTriggerOnce++;
            return 'foo';
         });

         assert.strictEqual(eventbus.callbackCount, 1);

         let result = eventbus.triggerSync('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.isNotArray(result);
         assert.strictEqual(result, 'foo');

         result = eventbus.triggerSync('test:trigger:once');

         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.isUndefined(result);
      });

      it('triggerSync-1 (listenTo)', () =>
      {
         const test = new Eventbus();

         callbacks.testTriggerCount = 0;

         test.listenTo(eventbus, 'test:trigger:sync', () =>
         {
            callbacks.testTriggerCount++;
            return 'foo';
         });

         assert.strictEqual(eventbus.callbackCount, 1);

         let result = eventbus.triggerSync('test:trigger:sync');

         assert.strictEqual(callbacks.testTriggerCount, 1);
         assert.isNotArray(result);
         assert.strictEqual(result, 'foo');

         assert.strictEqual(eventbus.callbackCount, 1);

         test.stopListening(eventbus, 'test:trigger:sync');

         assert.strictEqual(eventbus.callbackCount, 0);

         result = eventbus.triggerSync('test:trigger:sync');

         assert.strictEqual(callbacks.testTriggerCount, 1);
         assert.isUndefined(result);
      });

      it('triggerSync-1 (listenToOnce)', () =>
      {
         const test = new Eventbus();

         callbacks.testTriggerOnce = 0;

         test.listenToOnce(eventbus, 'test:trigger:once', () =>
         {
            callbacks.testTriggerOnce++;
            return 'foo';
         });

         assert.strictEqual(eventbus.callbackCount, 1);

         let result = eventbus.triggerSync('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.isNotArray(result);
         assert.strictEqual(result, 'foo');

         result = eventbus.triggerSync('test:trigger:once');

         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.isUndefined(result);
      });

      it('triggerSync (Promise)', (done) =>
      {
         eventbus.on('test:trigger:sync:then', () =>
         {
            callbacks.testTriggerSyncThen = true;

            return Promise.resolve('foobar');
         });

         assert.strictEqual(eventbus.callbackCount, 1);

         const promise = eventbus.triggerSync('test:trigger:sync:then');

         assert(promise instanceof Promise);

         promise.then((result) =>
         {
            assert.isTrue(callbacks.testTriggerSyncThen);
            assert.strictEqual(result, 'foobar');
            done();
         });
      });
   });
}
