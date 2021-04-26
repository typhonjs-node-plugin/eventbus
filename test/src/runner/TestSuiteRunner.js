import APIChecks        from './tests/eventbus/APIChecks.js';
import Backbone         from './tests/eventbus/Backbone.js';
import Instances        from './tests/eventbus/Instances.js';
import OtherAPI         from './tests/eventbus/OtherAPI.js';
import Trigger          from './tests/eventbus/Trigger.js';
import TriggerAsync     from './tests/eventbus/TriggerAsync.js';
import TriggerDefer     from './tests/eventbus/TriggerDefer.js';
import TriggerSync      from './tests/eventbus/TriggerSync.js';

import EventbusProxy    from './tests/EventbusProxy.js';
import EventbusSecure   from './tests/EventbusSecure.js';

const s_API_CHECKS      = true;
const s_BACKBONE        = true;
const s_INSTANCES       = true;
const s_OTHER_API       = true;
const s_TRIGGER         = true;
const s_TRIGGER_ASYNC   = true;
const s_TRIGGER_DEFER   = true;
const s_TRIGGER_SYNC    = true;

const s_EVENTBUS_PROXY  = true;
const s_EVENTBUS_SECURE = true;


const s_TESTS = [];

if (s_API_CHECKS) { s_TESTS.push(APIChecks); }
if (s_BACKBONE) { s_TESTS.push(Backbone); }
if (s_INSTANCES) { s_TESTS.push(Instances); }
if (s_OTHER_API) { s_TESTS.push(OtherAPI); }
if (s_TRIGGER) { s_TESTS.push(Trigger); }
if (s_TRIGGER_ASYNC) { s_TESTS.push(TriggerAsync); }
if (s_TRIGGER_DEFER) { s_TESTS.push(TriggerDefer); }
if (s_TRIGGER_SYNC) { s_TESTS.push(TriggerSync); }

if (s_EVENTBUS_PROXY) { s_TESTS.push(EventbusProxy); }
if (s_EVENTBUS_SECURE) { s_TESTS.push(EventbusSecure); }

export default class TestSuiteRunner
{
   static run(Module, data, chai)
   {
      for (const Test of s_TESTS)
      {
         Test.run(Module, data, chai);
      }
   }
}
