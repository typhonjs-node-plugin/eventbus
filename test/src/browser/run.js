import TestRunner from '@typhonjs-utils/build-test-browser';

(async () =>
{
   await TestRunner.runServerAndTestSuite({ reportDir: './coverage-browser' });

   // Uncomment to keep live server alive; useful when manually testing Firefox with live server still running.
   // const { passed } = await TestRunner.runServerAndTestSuite({ reportDir: './coverage-browser', keepAlive: true });
   //
   // process.stdout.write('Hit `ctrl-c` to exit.')
   //
   // const stdin = process.stdin;
   //
   // stdin.setRawMode( true );
   // stdin.resume();
   // stdin.setEncoding( 'utf8' );
   //
   // stdin.on( 'data', (key) =>
   // {
   //    // ctrl-c ( end of text )
   //    if (key === '\u0003') { process.exit(passed ? 0 : 1); }
   // });
})().catch((err) =>
{
   console.log(err);
   process.exit(1);
});
