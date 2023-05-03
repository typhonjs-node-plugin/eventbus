import { createTimedFunction } from '../utils/functions.js';

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

   describe('Eventbus - getType', () =>
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

      it('trigger / unknown', () =>
      {
         eventbus.on('test:trigger', () => {});

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, void 0);
      });

      it('trigger / unknown / bad data as wrong type', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: false });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, void 0);
      });

      it('trigger / unknown / bad data as string', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'foobar' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, void 0);
      });

      it('trigger / unknown / bad data as number', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 2 });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, void 0);
      });

      it('trigger / sync', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'sync' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, 'sync');
      });

      it('trigger / async', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'async' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, 'async');
      });

      it('mixed trigger / normal + sync', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger', () => { return 2; }, void 0, { type: 'sync' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, 'sync');

         const values = await eventbus.triggerSync('test:trigger');

         assert.isArray(values);
         assert.strictEqual(values.length, 2);
         assert.strictEqual(values[0], 1);
         assert.strictEqual(values[1], 2);
      });

      it('mixed trigger / sync + async', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger', createTimedFunction((resolve) => { resolve(2); }), void 0, { type: 'async' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result, 'async');

         const values = await eventbus.triggerAsync('test:trigger');

         assert.isArray(values);
         assert.strictEqual(values.length, 2);
         assert.strictEqual(values[0], 1);
         assert.strictEqual(values[1], 2);
      });

      it('mixed event names / trigger / sync + async', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger2', createTimedFunction((resolve) => { resolve(2); }), void 0, { type: 'async' });

         const result = eventbus.getType('test:trigger test:trigger2');

         assert.strictEqual(result, 'async');
      });
   });
}

