import fs                     from 'fs-extra';

import * as Module            from '../../../src/index.js';
import * as ModuleBuses       from '../../../src/buses/index.js';

import TestsuiteRunner        from '../runner/TestsuiteRunner.js';
import TestsuiteRunnerBuses   from '../runner/TestsuiteRunnerBuses.js';

fs.ensureDirSync('./.nyc_output');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

TestsuiteRunner.run({ Module });
TestsuiteRunnerBuses.run({ ModuleBuses });
