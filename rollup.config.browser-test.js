import path       from 'path';

import resolve    from '@rollup/plugin-node-resolve';
import istanbul   from 'rollup-plugin-istanbul';      // Adds Istanbul instrumentation.

// The test browser distribution is bundled to `./test/public`.
const s_TEST_BROWSER_PATH = './test/public';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

const relativeTestBrowserPath = path.relative(`${s_TEST_BROWSER_PATH}`, '.');

export default () =>
{
   return [{ // This bundle is for the Istanbul instrumented browser test.
         input: ['src/index.js'],
         output: [{
            file: `${s_TEST_BROWSER_PATH}/Eventbus.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
            sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativeTestBrowserPath, `.`)
         }],
         plugins: [
            istanbul()
         ]
      },

      // This bundle is the test suite
      {
         input: ['test/src/runner/TestsuiteRunner.js'],
         output: [{
            file: `${s_TEST_BROWSER_PATH}/TestsuiteRunner.js`,
            format: 'es',
            generatedCode: { constBindings: true },
         }],
         plugins: [
            resolve({ browser: true })
         ]
      }
   ];
};
