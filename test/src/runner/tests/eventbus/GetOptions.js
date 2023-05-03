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

   describe('Eventbus - getOptions', () =>
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

      it('guarded / trigger / unknown', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { guard: true });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, true);
         assert.strictEqual(result.type, void 0);
      });

      it('trigger / unknown / bad data as wrong type', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: false });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, false);
         assert.strictEqual(result.type, void 0);
      });

      it('trigger / unknown / bad data as string', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'foobar' });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, false);
         assert.strictEqual(result.type, void 0);
      });

      it('guarded / trigger / unknown / bad data as number', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { guard: true, type: 2 });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, true);
         assert.strictEqual(result.type, void 0);
      });

      it('trigger / sync', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'sync' });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, false);
         assert.strictEqual(result.type, 'sync');
      });

      it('trigger / async', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'async' });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, false);
         assert.strictEqual(result.type, 'async');
      });

      it('guarded / mixed trigger / normal + sync', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger', () => { return 2; }, void 0, { guard: true, type: 'sync' });

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, true);
         assert.strictEqual(result.type, 'sync');

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

         const result = eventbus.getOptions('test:trigger');

         assert.strictEqual(result.guard, false);
         assert.strictEqual(result.type, 'async');

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

         const result = eventbus.getOptions('test:trigger test:trigger2');

         assert.strictEqual(result.guard, false);
         assert.strictEqual(result.type, 'async');
      });

      it('guarded / mixed event names / trigger / sync + async', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {}, void 0, { guard: true });
         eventbus.on('test:trigger2', createTimedFunction((resolve) => { resolve(2); }), void 0, { type: 'async' });

         const result = eventbus.getOptions('test:trigger test:trigger2');

         assert.strictEqual(result.guard, true);
         assert.strictEqual(result.type, 'async');
      });
   });
}

