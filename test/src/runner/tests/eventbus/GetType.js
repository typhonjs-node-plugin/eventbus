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
   const Eventbus = Module.default;

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

      it('getType - trigger / unknown', () =>
      {
         eventbus.on('test:trigger', () => {});

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, void 0);
         assert.strictEqual(result.number, 0);
      });

      it('getType - trigger / unknown / bad data as wrong type', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: false });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, void 0);
         assert.strictEqual(result.number, 0);
      });

      it('getType - trigger / unknown / bad data as string', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'foobar' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, void 0);
         assert.strictEqual(result.number, 0);
      });

      it('getType - trigger / unknown / bad data as number (low)', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: -1 });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, void 0);
         assert.strictEqual(result.number, 0);
      });

      it('getType - trigger / unknown / bad data as number (high)', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 3 });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, void 0);
         assert.strictEqual(result.number, 0);
      });

      it('getType - trigger / sync as string', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'sync' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, 'sync');
         assert.strictEqual(result.number, 1);
      });

      it('getType - trigger / sync as number', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 1 });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, 'sync');
         assert.strictEqual(result.number, 1);
      });

      it('getType - trigger / async as string', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 'async' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, 'async');
         assert.strictEqual(result.number, 2);
      });

      it('getType - trigger / async as number', () =>
      {
         eventbus.on('test:trigger', () => {}, void 0, { type: 2 });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, 'async');
         assert.strictEqual(result.number, 2);
      });

      it('getType - mixed trigger / normal + sync', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger', () => { return 2; }, void 0, { type: 'sync' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, 'sync');
         assert.strictEqual(result.number, 1);

         const values = await eventbus.triggerSync('test:trigger');

         assert.isArray(values);
         assert.strictEqual(values.length, 2);
         assert.strictEqual(values[0], 1);
         assert.strictEqual(values[1], 2);
      });

      it('getType - mixed trigger / sync + async', async () =>
      {
         eventbus.on('test:trigger', () => { return 1; }, void 0, { type: 'sync' });
         eventbus.on('test:trigger', () => {});
         eventbus.on('test:trigger', createTimedFunction((resolve) => { resolve(2); }), void 0, { type: 'async' });

         const result = eventbus.getType('test:trigger');

         assert.strictEqual(result.type, 'async');
         assert.strictEqual(result.number, 2);

         const values = await eventbus.triggerAsync('test:trigger');

         assert.isArray(values);
         assert.strictEqual(values.length, 2);
         assert.strictEqual(values[0], 1);
         assert.strictEqual(values[1], 2);
      });
   });
}

