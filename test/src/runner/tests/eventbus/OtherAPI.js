/**
 * @param {object}                           opts - Test options
 *
 * @param {import('../../../../../types')}   opts.Module - Module to test
 *
 * @param {object}                           opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert, expect } = chai;
   const { Eventbus } = Module;

   describe('Eventbus - other API', () =>
   {
      let count;

      /**
       * @type {import('../../../../../types').Eventbus}
       */
      let eventbus;

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
         expect(() => { new Eventbus(false); }).to.throw(TypeError, `'name' is not a string`);
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

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test');

         assert.strictEqual(eventbus.callbackCount, 0);

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

      it('entries - guarded - on', () =>
      {
         const callback = () => { count++; };

         const context = {};
         const context2 = {};
         const context3 = {};

         const allCallbacks = [callback, callback, callback];
         const allContexts = [context, context2, context3];
         const allNames = ['test:trigger', 'test:trigger2', 'test:trigger3'];
         const allGuarded = [true, false, true];

         eventbus.on('test:trigger', callback, context, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger', callback, context, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger2', callback, context2);

         assert.strictEqual(eventbus.callbackCount, 2);

         eventbus.on('test:trigger3', callback, context3, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 3);

         eventbus.on('test:trigger3', callback);

         assert.strictEqual(eventbus.callbackCount, 3);

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);

         let cntr = 0;

         for (const [name, callback, context, options] of eventbus.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            assert.strictEqual(options.guard, allGuarded[cntr]);
            cntr++;
         }
      });

      it('entries - guarded - before', () =>
      {
         const callback = () => { count++; };

         const context = {};
         const context2 = {};

         const allCallbacks = [callback];
         const allContexts = [context2];
         const allNames = ['test:trigger2'];
         const allGuarded = [false];

         eventbus.before(2, 'test:trigger', callback, context, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.before(2, 'test:trigger', callback, context, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger2', callback, context2);

         assert.strictEqual(eventbus.callbackCount, 2);

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 2);

         eventbus.trigger('test:trigger');

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 2);

         assert.strictEqual(Array.from(eventbus.entries()).length, 1);

         let cntr = 0;

         for (const [name, callback, context, options] of eventbus.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            assert.strictEqual(options.guard, allGuarded[cntr]);
            cntr++;
         }
      });

      it('entries - guarded - once', () =>
      {
         const callback = () => { count++; };

         const context = {};
         const context2 = {};

         const allCallbacks = [callback];
         const allContexts = [context2];
         const allNames = ['test:trigger2'];
         const allGuarded = [false];

         assert.isFalse(eventbus.isGuarded('test:trigger'));

         eventbus.once('test:trigger', callback, context, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 1);
         assert.isTrue(eventbus.isGuarded('test:trigger'));

         eventbus.once('test:trigger', callback, context, { guard: true });

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger2', callback, context2);

         assert.strictEqual(eventbus.callbackCount, 2);
         assert.isFalse(eventbus.isGuarded('test:trigger2'));

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);
         assert.strictEqual(eventbus.callbackCount, 1);

         assert.strictEqual(Array.from(eventbus.entries()).length, 1);

         let cntr = 0;

         for (const [name, callback, context, options] of eventbus.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            assert.strictEqual(options.guard, allGuarded[cntr]);
            cntr++;
         }
      });

      it('entries - remove / add (on)', () =>
      {
         const callback = () => { count++; };

         const context = {};
         const context2 = {};

         const allCallbacks = [callback, callback];
         const allContexts = [context, context2];
         const allNames = ['test:trigger', 'test:trigger2'];
         const allGuarded = [false, false];

         eventbus.on('test:trigger', callback, context);

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger2', callback, context2);

         assert.strictEqual(eventbus.callbackCount, 2);

         const events = Array.from(eventbus.entries());

         eventbus.off();

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 0);
         assert.strictEqual(eventbus.callbackCount, 0);

         for (const event of events)
         {
            eventbus.on(...event);
         }

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);
         assert.strictEqual(eventbus.callbackCount, 2);

         assert.strictEqual(Array.from(eventbus.entries()).length, 2);

         let cntr = 0;

         for (const [name, callback, context, options] of eventbus.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            assert.strictEqual(options.guard, allGuarded[cntr]);
            cntr++;
         }
      });

      it('entries - remove / add (once)', () =>
      {
         const callback = () => { count++; };

         const context = {};
         const context2 = {};

         const allCallbacks = [callback];
         const allContexts = [context2];
         const allNames = ['test:trigger2'];
         const allGuarded = [false];

         eventbus.once('test:trigger', callback, context);

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger2', callback, context2);

         assert.strictEqual(eventbus.callbackCount, 2);

         // Store events
         const events = Array.from(eventbus.entries());

         // Remove all events
         eventbus.off();

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 0);
         assert.strictEqual(eventbus.callbackCount, 0);

         // Add back all events
         for (const event of events)
         {
            eventbus.on(...event);
         }

         assert.strictEqual(eventbus.callbackCount, 2);

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);
         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);

         assert.strictEqual(Array.from(eventbus.entries()).length, 1);

         let cntr = 0;

         for (const [name, callback, context, options] of eventbus.entries())
         {
            assert.strictEqual(name, allNames[cntr]);
            assert.strictEqual(callback, allCallbacks[cntr]);
            assert.strictEqual(context, allContexts[cntr]);
            assert.strictEqual(options.guard, allGuarded[cntr]);
            cntr++;
         }
      });

      it('get - eventCount / callbackCount', () =>
      {
         assert.strictEqual(eventbus.eventCount, 0);
         assert.strictEqual(eventbus.callbackCount, 0);

         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger2', () => {});
         eventbus.on('test:trigger2', () => {});

         assert.strictEqual(eventbus.eventCount, 2);
         assert.strictEqual(eventbus.callbackCount, 3);
      });

      it('keys has early out when no events are set', () =>
      {
         assert.deepEqual(Array.from(eventbus.keys()), []);
      });

      it('keys throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const entry of eventbus.keys(false)) { assert.ok(false); }   // eslint-disable-line no-unused-vars
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

      it('keysWithOptions has early out when no events are set', () =>
      {
         assert.deepEqual(Array.from(eventbus.keysWithOptions()), []);
      });

      it('keysWithOptions throws when regex not instance of RegExp', () =>
      {
         expect(() =>
         {
            for (const entry of eventbus.keysWithOptions(false)) { assert.ok(false); } // eslint-disable-line no-unused-vars
         }).to.throw(TypeError, `'regex' is not a RegExp`);
      });

      it('keysWithOptions', async () =>
      {
         eventbus.on('test', () => {}, void 0, { type: 'sync' });
         eventbus.on('test', () => {}, void 0, { guard: true });
         eventbus.on('test2', () => {}, void 0, { type: 'async' });
         eventbus.on('test3', () => {});
         eventbus.on('test4', () => {}, void 0, { type: 'sync' });
         eventbus.on('test4', () => {}, void 0, { type: 'async' });
         eventbus.on('test4', () => {}, void 0, { type: 'sync' });
         eventbus.on('test4', () => {}, void 0, { guard: true });

         const names = ['test', 'test2', 'test3', 'test4'];
         const optionRes = [
            { guard: true, type: 'sync' },
            { guard: false, type: 'async' },
            { guard: false, type: void 0 },
            { guard: true, type: 'async' },
         ];

         let cntr = 0;
         for (const [name, options] of eventbus.keysWithOptions())
         {
            assert.strictEqual(name, names[cntr]);
            assert.deepEqual(options, optionRes[cntr]);
            cntr++;
         }
      });

      it('keysWithOptions w/ regex', async () =>
      {
         eventbus.on('test', () => {}, void 0, { type: 'sync' });
         eventbus.on('test', () => {}, void 0, { guard: true });
         eventbus.on('test2', () => {}, void 0, { type: 'async' });
         eventbus.on('test3', () => {});
         eventbus.on('test4', () => {}, void 0, { type: 'sync' });
         eventbus.on('test4', () => {}, void 0, { type: 'async' });
         eventbus.on('test4', () => {}, void 0, { type: 'sync' });
         eventbus.on('test4', () => {}, void 0, { guard: true });

         const names = ['test2', 'test3', 'test4'];
         const optionRes = [
            { guard: false, type: 'async' },
            { guard: false, type: void 0 },
            { guard: true, type: 'async' },
         ];

         let cntr = 0;

         // Event names that end in a number.
         for (const [name, options] of eventbus.keysWithOptions(/\d$/))
         {
            assert.strictEqual(name, names[cntr]);
            assert.deepEqual(options, optionRes[cntr]);
            cntr++;
         }
      });

      it('guarded listenTo - listenTo does not register', () =>
      {
         const other = new Eventbus();

         other.on('change', () => { count++; }, void 0, { guard: true });
         eventbus.listenTo(other, 'change', () => { count++; assert.ok(false); });

         other.trigger('change');

         assert.strictEqual(count, 1);
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

      it('on - guarded', () =>
      {
         eventbus.on('test:trigger', () => { count++; }, void 0, { guard: true });
         eventbus.on('test:trigger', () => { count++; assert.ok(false); }, void 0, { guard: true });

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);
      });

      it('on - guarded - event map', () =>
      {
         eventbus.on('test:trigger', () => { count++; }, void 0, { guard: true });
         eventbus.on({ 'test:trigger': () => { count++; assert.ok(false); } });

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 1);
      });

      it('on - guarded - multiple w/ one guarded', () =>
      {
         eventbus.on('test:trigger', () => { count++; }, void 0);
         eventbus.on('test:trigger', () => { count++; }, void 0, { guard: true });
         eventbus.on('test:trigger', () => { count++; assert.ok(false); }, void 0);

         eventbus.trigger('test:trigger');

         assert.strictEqual(count, 2);
      });


      it('on - guarded - multiple w/ one guarded then removed', () =>
      {
         const context = {};

         eventbus.on('test:trigger', () => { count++; }, void 0);
         eventbus.on('test:trigger', () => { count++; }, context, { guard: true });
         eventbus.on('test:trigger', () => { count++; assert.ok(false); }, void 0);

         assert.strictEqual(eventbus.callbackCount, 2);

         eventbus.trigger('test:trigger');
         assert.strictEqual(count, 2);

         eventbus.off(void 0, void 0, context);

         assert.strictEqual(eventbus.callbackCount, 1);

         eventbus.on('test:trigger', () => { count++; }, void 0);
         assert.strictEqual(eventbus.callbackCount, 2);

         eventbus.trigger('test:trigger');
         assert.strictEqual(count, 4);
      });
   });
}

