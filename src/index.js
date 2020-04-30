const vorpal = require("vorpal")();
const commands = require("./commands");
const apiClient = require("./api");

const interactive = vorpal.parse(process.argv, {use: 'minimist'})._ === undefined;
// Clean stdout output function
const cleanStdout = () => process.stdout.write("\u001B[2J\u001B[0;0f");
const cli = {
  // Init function
  init: () => {
    // Clean stdout
    cleanStdout();
    // Get list of member states countries
    vorpal
      .command("get-countries", "Get list of member states countries.")
      .option("-m, --mock", "Work with mocks results")
      .action((args, cb) => {
        cleanStdout();
        commands.getCountries(
          apiClient,
          args,
          interactive ? cb() : null
        );
      });
    // Get trusted list for a given country
    vorpal
      .command("get-trustedlist <cc>", "Get trusted list for a given country.")
      .option("-e, --exported", "Export to dist folder")
      .option("-m, --mock", "Work with mocks results")
      .option("-s, --service <s>", "Filter by serviceType")
      .action((args, cb) => {
        cleanStdout();
        commands.getTrustedCertsByCC(
          apiClient,
          args,
          interactive ? cb() : null
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
        const countries = await commands.getCountries(apiClient, args, cb);
        countries.forEach(async item => {
          await commands.getTrustedCertsByCC(
            apiClient,
            Object.assign({}, args, { cc: item.countryCode }),
            interactive ? cb() : null
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