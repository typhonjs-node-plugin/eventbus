import path             from 'path';

// import { babel }        from '@rollup/plugin-babel';        // Babel is used for private class fields for browser usage.

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

// Adds Terser to the output plugins for server bundle if true.
// const s_MINIFY = typeof process.env.ROLLUP_MINIFY === 'string' ? process.env.ROLLUP_MINIFY === 'true' : true;

export default () =>
{
   // Defines potential output plugins to use conditionally if the .env file indicates the bundles should be
   // minified / mangled.
   // const outputPlugins = [];
   // if (s_MINIFY)
   // {
   //    outputPlugins.push(terser(terserConfig));
   // }

   // Reverse relative path from the deploy path to local directory; used to replace source maps path, so that it
   // shows up correctly in Chrome dev tools.
   // const relativeDistBrowserPath = path.relative(`${s_DIST_PATH_BROWSER}`, '.');

   return [{     // This bundle is for the browser distribution.
         input: ['src/index.js'],
         output: [{
            file: `${s_DIST_PATH_BROWSER}${path.sep}Eventbus.js`,
            format: 'es',
            // plugins: outputPlugins,
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
            // sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativeDistBrowserPath, `.`)
         }],
         plugins: [
            // babel({
            //    babelHelpers: 'bundled',
            //    presets: [
            //       ['@babel/preset-env', {
            //          bugfixes: true,
            //          shippedProposals: true,
            //          targets: { esmodules: true }
            //       }]
            //    ]
            // })
         ]
      }
   ];
};
