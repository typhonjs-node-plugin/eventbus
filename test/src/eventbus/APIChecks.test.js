import { assert, expect }  from 'chai';

import Eventbus            from '../../../src/Eventbus.js';

import config              from '../../utils/config.js';

if (config.apichecks)
{
   describe('Eventbus - API Checks', () =>
   {
      let eventbus;

      beforeEach(() => { eventbus = new Eventbus(); });

      it('no events added', async () =>
      {
         let result;

         // Empty generator
         result = eventbus.entries();
         expect(result.next()).to.eql({ done: true, value: void 0 });

         // Empty generator
         result = eventbus.keys();
         expect(result.next()).to.eql({ done: true, value: void 0 });

         result = eventbus.on('test');
         expect(result).to.equal(eventbus);

         result = eventbus.off();
         expect(result).to.equal(eventbus);

         result = eventbus.trigger();
         expect(result).to.equal(eventbus);

         result = await eventbus.triggerAsync();
         assert.isNotArray(result);
         assert.isUndefined(result);

         result = eventbus.triggerSync();
         assert.isNotArray(result);
         assert.isUndefined(result);
      });

      it('listening no object specified', () =>
      {
         let result;

         result = eventbus.listenTo();
         expect(result).to.equal(eventbus);

         result = eventbus.stopListening();
         expect(result).to.equal(eventbus);
      });

      it('once without a callback is a noop', () =>
      {
         eventbus.once('event').trigger('event');
      });

      it('listenToOnce without a callback is a noop', () =>
      {
         eventbus.listenToOnce(eventbus, 'event').trigger('event');
      });

      it('stopListening early out branch', () =>
      {
         const a = new Eventbus();
         const b = new Eventbus();

         b.listenTo(a, 'event');
         eventbus.listenTo(a, 'event');
         eventbus.stopListening(b, 'event');
      });

      it('event functions are chainable', () =>
      {
         const fn = () => {};
         assert.equal(eventbus, eventbus.trigger('noeventssetyet'));
         assert.equal(eventbus, eventbus.off('noeventssetyet'));
         assert.equal(eventbus, eventbus.stopListening('noeventssetyet'));
         assert.equal(eventbus, eventbus.on('a', fn));
         assert.equal(eventbus, eventbus.once('c', fn));
         assert.equal(eventbus, eventbus.trigger('a'));
         assert.equal(eventbus, eventbus.listenTo(eventbus, 'a', fn));
         assert.equal(eventbus, eventbus.listenToOnce(eventbus, 'b', fn));
         assert.equal(eventbus, eventbus.off('a c'));
         assert.equal(eventbus, eventbus.stopListening(eventbus, 'a'));
         assert.equal(eventbus, eventbus.stopListening());
      });
   });
}
