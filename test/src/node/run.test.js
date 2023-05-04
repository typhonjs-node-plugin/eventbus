import fs                     from 'fs-extra';

import * as Module            from '../../../src/index.js';
import * as ModuleBusses      from '../../../src/busses/index.js';

import TestsuiteRunner        from '../runner/TestsuiteRunner.js';
import TestsuiteRunnerBusses  from '../runner/TestsuiteRunnerBusses.js';

fs.ensureDirSync('./.nyc_output');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

TestsuiteRunner.run({ Module });
TestsuiteRunnerBusses.run({ ModuleBusses });
