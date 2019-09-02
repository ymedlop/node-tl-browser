const vorpal = require("vorpal")();
const commands = require("./commands");
const apiClient = require("./api");

function clean() {
  process.stdout.write("\u001B[2J\u001B[0;0f");
}

vorpal
  .command("get-countries", "Get list of member states countries.")
  .option("-m, --mock", "Work with mocks results")
  .action((args, cb) => {
    clean();
    commands.getCountries(apiClient, args, cb);
  });

vorpal
  .command("get-trustedlist <cc>", "Get trusted list for a given country.")
  .option("-e, --exported", "Export to dist folder")
  .option("-m, --mock", "Work with mocks results")
  .option("-s, --service <s>", "Filter by serviceType")
  .action((args, cb) => {
    clean();
    commands.getTrustedCertsByCC(apiClient, args, cb);
  });

vorpal
  .command("get-trustedlists", "Get all trusted list.")
  .option("-e, --exported", "Export to dist folder")
  .option("-m, --mock", "Work with mocks results")
  .option("-s, --service <s>", "Filter by serviceType")
  .action(async (args, cb) => {
    clean();
    const countries = await commands.getCountries(apiClient, args, cb);
    countries.forEach(async item => {
      await commands.getTrustedCertsByCC(
        apiClient,
        Object.assign({}, args, { cc: item.countryCode }),
        cb
      );
    });
  });

clean();

vorpal.delimiter("tl-browser$").show();