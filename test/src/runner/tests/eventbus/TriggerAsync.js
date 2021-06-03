/**
 * @param {object}                           opts - Test options
 * @param {import('../../../../../types')}   opts.Module - Module to test
 * @param {object}                           opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert, expect } = chai;
   const Eventbus = Module.default;

   describe('Eventbus - triggerAsync', () =>
   {
      let callbacks, eventbus;

      beforeEach(() =>
      {
         callbacks = {};
         eventbus = new Eventbus();
      });

      it('triggerAsync - no events (void)', async () =>
      {
         const result = await eventbus.triggerAsync('test:trigger:async');

         assert.strictEqual(eventbus.callbackCount, 0);
         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('triggerAsync - callback has no results (void)', async () =>
      {
         eventbus.on('test:trigger:async', () =>
         {
            callbacks.testTriggerAsync = true;
         });

         const result = await eventbus.triggerAsync('test:trigger:async');

         assert.isTrue(callbacks.testTriggerAsync);
         assert.strictEqual(eventbus.callbackCount, 1);
         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('triggerAsync (multiple args)', async () =>
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

         assert.isTrue(await eventbus.triggerAsync('test:trigger:1', 1));
         assert.isTrue(await eventbus.triggerAsync('test:trigger:2', 1, 2));
         assert.isTrue(await eventbus.triggerAsync('test:trigger:3', 1, 2, 3));
         assert.isTrue(await eventbus.triggerAsync('test:trigger:4', 1, 2, 3, 4));

         assert.strictEqual(eventbus.callbackCount, 4);

         assert.strictEqual(callbacks.testTrigger1, 1);
         assert.strictEqual(callbacks.testTrigger2, 1);
         assert.strictEqual(callbacks.testTrigger3, 1);
         assert.strictEqual(callbacks.testTrigger4, 1);
      });

      it('triggerAsync - binding and triggering multiple events', async () =>
      {
         callbacks.counter = 0;
         let results;

         eventbus.on('a b c', createTimedFunction((resolve) =>
         {
            callbacks.counter++;
            resolve(true);
         }));
         eventbus.on('d', createTimedFunction((resolve) =>
         {
            callbacks.counter++;
            resolve([false, false]);
         }));
         eventbus.on('e', createTimedFunction((resolve) =>
         {
            callbacks.counter++;
            resolve();
         }));

         results = await eventbus.triggerAsync('a');
         assert.strictEqual(callbacks.counter, 1);
         assert.isTrue(results);

         results = await eventbus.triggerAsync('e e');
         assert.strictEqual(callbacks.counter, 3);
         assert.isUndefined(results);

         results = await eventbus.triggerAsync('a e');
         assert.strictEqual(callbacks.counter, 5);
         assert.isTrue(results);

         results = await eventbus.triggerAsync('a e b');
         assert.strictEqual(callbacks.counter, 8);
         assert.isArray(results);
         assert.strictEqual(results.length, 2);
         assert.isTrue(results[0]);
         assert.isTrue(results[1]);

         results = await eventbus.triggerAsync('a d b');
         assert.strictEqual(callbacks.counter, 11);
         assert.isArray(results);
         assert.strictEqual(results.length, 4);
         assert.isTrue(results[0]);
         assert.isFalse(results[1]);
         assert.isFalse(results[2]);
         assert.isTrue(results[3]);

         results = await eventbus.triggerAsync('d a c');
         assert.strictEqual(callbacks.counter, 14);
         assert.isArray(results);
         assert.strictEqual(results.length, 4);
         assert.isFalse(results[0]);
         assert.isFalse(results[1]);
         assert.isTrue(results[2]);
         assert.isTrue(results[3]);

         results = await eventbus.triggerAsync('d d');
         assert.strictEqual(callbacks.counter, 16);
         assert.isArray(results);
         assert.strictEqual(results.length, 4);
         assert.isFalse(results[0]);
         assert.isFalse(results[1]);
         assert.isFalse(results[2]);
         assert.isFalse(results[3]);

         results = await eventbus.triggerAsync('c');
         assert.strictEqual(callbacks.counter, 17);
         assert.isTrue(results);

         eventbus.off('a c');
         results = await eventbus.triggerAsync('a b e c d');
         assert.strictEqual(callbacks.counter, 20);
         assert.isArray(results);
         assert.strictEqual(results.length, 3);
         assert.isTrue(results[0]);
         assert.isFalse(results[1]);
         assert.isFalse(results[2]);
      });

      it('promise - triggerAsync', (done) =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync2 = true;
            resolve('bar');
         }));

         assert.strictEqual(eventbus.callbackCount, 2);

         const promise = eventbus.triggerAsync('test:trigger:async');

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

      it('promise - triggerAsync (2 results)', (done) =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync2 = true;
            resolve();
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync3 = true;
            resolve('bar');
         }));

         assert.strictEqual(eventbus.callbackCount, 3);

         const promise = eventbus.triggerAsync('test:trigger:async');

         assert(promise instanceof Promise);

         // triggerAsync resolves all Promises by Promise.all() so result is an array.
         promise.then((result) =>
         {
            assert.isTrue(callbacks.testTriggerAsync);
            assert.isTrue(callbacks.testTriggerAsync2);
            assert.isTrue(callbacks.testTriggerAsync3);
            assert.isArray(result);
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0], 'foo');
            assert.strictEqual(result[1], 'bar');
            done();
         });
      });

      it('promise - triggerAsync (once)', (done) =>
      {
         callbacks.testTriggerOnce = 0;

         assert.strictEqual(eventbus.callbackCount, 0);

         eventbus.once('test:trigger:once', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerOnce++;
            resolve('foo');
         }));

         assert.strictEqual(eventbus.callbackCount, 1);

         const promise = eventbus.triggerAsync('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert(promise instanceof Promise);

         const promise2 = eventbus.triggerAsync('test:trigger:once');

         assert(promise2 instanceof Promise);

         // triggerAsync resolves all Promises by Promise.all() or Promise.resolve() so result is a string.
         promise.then((result) =>
         {
            assert.strictEqual(callbacks.testTriggerOnce, 1);
            assert.strictEqual(result, 'foo');
            done();
         });
      });

      it('promise - triggerAsync (listenTo)', (done) =>
      {
         const test = new Eventbus();

         callbacks.testTriggerCount = 0;

         test.listenTo(eventbus, 'test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerCount++;
            resolve('foo');
         }));

         assert.strictEqual(eventbus.callbackCount, 1);

         let promise = eventbus.triggerAsync('test:trigger:async');

         assert(promise instanceof Promise);

         promise.then((result) =>
         {
            assert.strictEqual(callbacks.testTriggerCount, 1);
            assert.strictEqual(result, 'foo');
         }).then(() =>
         {
            test.stopListening(eventbus, 'test:trigger:async');

            assert.strictEqual(eventbus.callbackCount, 0);

            promise = eventbus.triggerAsync('test:trigger:async');
            assert(promise instanceof Promise);

            promise.then((result) =>
            {
               assert.isUndefined(result);
               assert.strictEqual(callbacks.testTriggerCount, 1);
               done();
            });
         });
      });


      it('promise - triggerAsync (listenToOnce)', (done) =>
      {
         const test = new Eventbus();

         callbacks.testTriggerOnce = 0;

         assert.strictEqual(eventbus.callbackCount, 0);

         test.listenToOnce(eventbus, 'test:trigger:once', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerOnce++;
            resolve('foo');
         }));

         assert.strictEqual(eventbus.callbackCount, 1);

         const promise = eventbus.triggerAsync('test:trigger:once');

         assert(promise instanceof Promise);
         assert.strictEqual(eventbus.callbackCount, 0);

         const promise2 = eventbus.triggerAsync('test:trigger:once');

         assert(promise2 instanceof Promise);

         // triggerAsync resolves all Promises by Promise.all() or Promise.resolve() so result is a string.
         promise.then((result) =>
         {
            assert.strictEqual(callbacks.testTriggerOnce, 1);
            assert.strictEqual(result, 'foo');
            done();
         });
      });

      it('async / await - triggerAsync', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync2 = true;
            resolve('bar');
         }));

         assert.strictEqual(eventbus.callbackCount, 2);

         const result = await eventbus.triggerAsync('test:trigger:async');

         assert.isTrue(callbacks.testTriggerAsync);
         assert.isTrue(callbacks.testTriggerAsync2);
         assert.strictEqual(result[0], 'foo');
         assert.strictEqual(result[1], 'bar');
      });

      it('async / await - triggerAsync (result undefined)', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve();
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync2 = true;
            resolve();
         }));

         assert.strictEqual(eventbus.callbackCount, 2);

         const result = await eventbus.triggerAsync('test:trigger:async');

         assert.isTrue(callbacks.testTriggerAsync);
         assert.isTrue(callbacks.testTriggerAsync2);
         assert.isUndefined(result);
      });

      it('async / await - triggerAsync (1 result)', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync2 = true;
            resolve();
         }));

         assert.strictEqual(eventbus.callbackCount, 2);

         const result = await eventbus.triggerAsync('test:trigger:async');

         assert.isTrue(callbacks.testTriggerAsync);
         assert.isTrue(callbacks.testTriggerAsync2);
         assert.isString(result);
         assert.strictEqual(result, 'foo');
      });

      it('async / await - triggerAsync (once)', async () =>
      {
         callbacks.testTriggerOnce = 0;

         assert.strictEqual(eventbus.callbackCount, 0);

         eventbus.once('test:trigger:once', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerOnce++;
            resolve('foo');
         }));

         assert.strictEqual(eventbus.callbackCount, 1);

         const result = await eventbus.triggerAsync('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);

         const result2 = await eventbus.triggerAsync('test:trigger:once');

         assert.strictEqual(callbacks.testTriggerOnce, 1);

         assert.isUndefined(result2);

         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.strictEqual(result, 'foo');
      });

      it('async / await - triggerAsync (listenTo)', async () =>
      {
         const test = new Eventbus();

         callbacks.testTriggerCount = 0;

         test.listenTo(eventbus, 'test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerCount++;
            resolve('foo');
         }));

         assert.strictEqual(eventbus.callbackCount, 1);

         let result = await eventbus.triggerAsync('test:trigger:async');

         assert.strictEqual(callbacks.testTriggerCount, 1);
         assert.strictEqual(result, 'foo');

         test.stopListening(eventbus, 'test:trigger:async');

         assert.strictEqual(eventbus.callbackCount, 0);

         result = await eventbus.triggerAsync('test:trigger:async');

         assert.isUndefined(result);
         assert.strictEqual(callbacks.testTriggerCount, 1);
      });


      it('async / await - triggerAsync (listenToOnce)', async () =>
      {
         const test = new Eventbus();

         callbacks.testTriggerOnce = 0;

         assert.strictEqual(eventbus.callbackCount, 0);

         // test.listenToOnce(eventbus, 'test:trigger:once', () => { callbacks.testTriggerOnce++; return 'foo'; });
         test.listenToOnce(eventbus, 'test:trigger:once', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerOnce++;
            resolve('foo');
         }));

         assert.strictEqual(eventbus.callbackCount, 1);

         const result = await eventbus.triggerAsync('test:trigger:once');

         assert.strictEqual(eventbus.callbackCount, 0);

         assert.strictEqual(callbacks.testTriggerOnce, 1);

         const result2 = await eventbus.triggerAsync('test:trigger:once');

         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.isUndefined(result2);

         // triggerAsync resolves all Promises by Promise.all() or Promise.resolve() so result is a string.
         assert.strictEqual(callbacks.testTriggerOnce, 1);
         assert.strictEqual(result, 'foo');
      });

      it('async / await - triggerAsync - reject', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', createTimedFunction((resolve, reject) => { reject('bar'); }));

         assert.strictEqual(eventbus.callbackCount, 2);

         await expect(eventbus.triggerAsync('test:trigger:async')).to.be.rejectedWith('bar');
      });

      it('async / await - triggerAsync - try / catch reject error', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async',
          createTimedFunction((resolve, reject) => { reject(new Error('An Error!')); }));

         assert.strictEqual(eventbus.callbackCount, 2);

         await expect(eventbus.triggerAsync('test:trigger:async')).to.be.rejectedWith(Error, 'An Error!');
      });

      it('async / await - triggerAsync - try / catch error', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', () => { throw new Error('An Error!'); });

         assert.strictEqual(eventbus.callbackCount, 2);

         await expect(eventbus.triggerAsync('test:trigger:async')).to.be.rejectedWith(Error, 'An Error!');
      });

      it('async / await - triggerAsync - try / catch sync error', async () =>
      {
         eventbus.on('test:trigger:async', createTimedFunction((resolve) =>
         {
            callbacks.testTriggerAsync = true;
            resolve('foo');
         }));

         eventbus.on('test:trigger:async', () => { throw new Error('An Error!'); });

         assert.strictEqual(eventbus.callbackCount, 2);

         await expect(eventbus.triggerAsync('test:trigger:async')).to.be.rejectedWith(Error, 'An Error!');
      });
   });
}

/**
 * Creates a timed function callback for async testing.
 *
 * @param {Function} func - Callback function.
 * @param {number}   timeout - Delay to invoke callback.
 *
 * @returns {function(): Promise<void>} A timed function generator.
 */
function createTimedFunction(func, timeout = 1000)
{
   return () =>
   {
      return new Promise((resolve, reject) =>
      {
         setTimeout(() => func(resolve, reject), timeout);
      });
   };
}
