const vorpal = require("vorpal")();
const commands = require("./commands");
const apiClient = require("./api");

const interactive = vorpal.parse(process.argv, {use: 'minimist'})._ === undefined;
// Clean stdout output function
const cleanStdout = () => process.stdout.write("\u001B[2J\u001B[0;0f");
// Allow Async forEach
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
};
const cli = {
  // Init function
  init: async () => {
    const client = await apiClient();
    // Clean stdout
    cleanStdout();
    // Get list of member states countries
    vorpal
      .command("get-countries", "Get list of member states countries.")
      .option("-m, --mock", "Work with mocks results")
      .action(async (args, cb) => {
        cleanStdout();
        await commands.getCountries(
          client,
          args,
          interactive ? cb : undefined
        );
      });
    // Get trusted list for a given country
    vorpal
      .command("get-trustedlist <cc>", "Get trusted list for a given country.")
      .option("-e, --exported", "Export to dist folder")
      .option("-m, --mock", "Work with mocks results")
      .option("-s, --service <s>", "Filter by serviceType")
      .action(async (args, cb) => {
        cleanStdout();
        await commands.getTrustedCertsByCC(
          client,
          args,
          interactive ? cb : undefined
        );
      });
    // Retrieve all the trusted list
    vorpal
      .command("get-trustedlists", "Get all trusted list.")
      .option("-e, --exported", "Export to dist folder")
      .option("-m, --mock", "Work with mocks results")
      .option("-s, --service <s>", "Filter by serviceType")
      .action(async (args, cb) => {
        cleanStdout();
        const countries = await commands.getCountries(
          client,
          args,
          interactive ? cb : undefined
        );
        await asyncForEach(countries, async item => {
          await commands.getTrustedCertsByCC(
            client,
            Object.assign({}, args, { cc: item.countryCode }),
            interactive ? cb : undefined
          );
        });
      });
    // Set cli delimiter
    if (interactive) {
      vorpal
        .delimiter("tl-browser$")
        .show()
    } else {
      // argv is mutated by the first call to parse.
      process.argv.unshift('')
      process.argv.unshift('')
      vorpal
        .delimiter('')
        .parse(process.argv)
    }
  }
}

module.exports = cli;