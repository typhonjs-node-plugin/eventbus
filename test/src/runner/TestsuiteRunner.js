import { TestsuiteRunner } from '@typhonjs-build-test/testsuite-runner';

import * as APIChecks      from './tests/eventbus/APIChecks.js';
import * as Backbone       from './tests/eventbus/Backbone.js';
import * as GetOptions     from './tests/eventbus/GetOptions.js';
import * as GetType        from './tests/eventbus/GetType.js';
import * as OtherAPI       from './tests/eventbus/OtherAPI.js';
import * as Trigger        from './tests/eventbus/Trigger.js';
import * as TriggerAsync   from './tests/eventbus/TriggerAsync.js';
import * as TriggerDefer   from './tests/eventbus/TriggerDefer.js';
import * as TriggerSync    from './tests/eventbus/TriggerSync.js';

import * as EventbusProxy  from './tests/EventbusProxy.js';
import * as EventbusSecure from './tests/EventbusSecure.js';

const data = {
   name: 'Eventbus'
};

export default new TestsuiteRunner({
   APIChecks,
   Backbone,
   GetOptions,
   GetType,
   OtherAPI,
   Trigger,
   TriggerAsync,
   TriggerDefer,
   TriggerSync,
   EventbusProxy,
   EventbusSecure
}, data);
