import path             from 'path';

import { generateDTS }  from '@typhonjs-build-test/esm-d-ts';

await generateDTS({
   input: './src/index.js',
   output: './types/index.d.ts',
});

await generateDTS({
   input: './src/busses/index.js',
   output: './types/index-busses.d.ts',
});

// The deploy path for the distribution for browser & Node.
const s_DIST_PATH_BROWSER = './dist/browser';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

export default () =>
{
   return [{     // This bundle is for the browser distribution.
         input: ['src/index.js'],
         output: [{
            file: `${s_DIST_PATH_BROWSER}${path.sep}Eventbus.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
         }]
      }
   ];
};
