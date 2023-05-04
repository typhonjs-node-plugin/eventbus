import { TestsuiteRunner } from '@typhonjs-build-test/testsuite-runner';

import * as Instances      from './tests/eventbus/busses/Instances.js';

const data = {
   name: 'Eventbus'
};

export default new TestsuiteRunner({
   Instances
}, data);
