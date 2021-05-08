import fs  from 'fs';

import dts from 'rollup-plugin-dts';

const banner = fs.readFileSync('./lib/typedef.d.ts', 'utf-8');

// Rollup the TS definitions generated in ./lib and add separate typedef.d.ts as a banner.

export default [
   {
      input: "./lib/index.d.ts",
      output: [{ banner, file: "types/index.d.ts", format: "es" }],
      plugins: [dts()],
   },
];
