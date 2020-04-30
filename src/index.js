const vorpal = require("vorpal")();
const commands = require("./commands");
const apiClient = require("./api");

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
        commands.getCountries(apiClient, args, cb);
      });
    // Get trusted list for a given country
    vorpal
      .command("get-trustedlist <cc>", "Get trusted list for a given country.")
      .option("-e, --exported", "Export to dist folder")
      .option("-m, --mock", "Work with mocks results")
      .option("-s, --service <s>", "Filter by serviceType")
      .action((args, cb) => {
        cleanStdout();
        commands.getTrustedCertsByCC(apiClient, args, cb);
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
            cb
          );
        });
      });
    // Set cli delimiter
    vorpal.delimiter("tl-browser$").show();
  }
}

module.exports = cli;