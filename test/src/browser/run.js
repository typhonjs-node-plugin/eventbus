import { BrowserRunner } from '@typhonjs-build-test/node-browser';

/**
 * Provides the main async execution function
 *
 * @returns {Promise<void>} A Promise
 */
async function main()
{
   await BrowserRunner.runServerAndTestSuite({
      reportDir: './coverage-browser',
      // keepAlive: true   // Uncomment to keep HTTP server alive / useful for testing other browsers.
   });
}

main().catch((err) =>
{
   console.log(err);
   process.exit(1);
});
