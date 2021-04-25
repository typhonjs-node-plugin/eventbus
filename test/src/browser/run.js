import TestRunner from '@typhonjs-utils/build-test-browser';

(async () =>
{
   await TestRunner.runServerAndTestSuite({ reportDir: './coverage-browser' });

   // Uncomment to keep live server alive; useful when manually testing Firefox, etc.
   // await TestRunner.runServerAndTestSuite({
   //    reportDir: './coverage-browser',
   //    keepAlive: true,
   //    stdinLatch: true
   // });
})().catch((err) =>
{
   console.log(err);
   process.exit(1);
});
