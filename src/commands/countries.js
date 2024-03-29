const dataMock = require("../assets/mocks/search/countries_list.json");

async function getCountries(apiClient, args, cb) {
  const { mock } = args.options;
  // Check Mock mode On
  if (mock) {
    const countries = dataMock;
    // TODO: output countries table
    console.log("Careful!. You are working with Mocks!");
    console.log(countries.content);
  } else {
    // Mock mode Off
    console.log("You are working with real data. Loading ...");
    try {
      const results = await apiClient.apis[
        "api-search-controller"
      ].getCountriesListUsingGET();
      const countries = results.body.content;
      // TODO: output countries table
      console.log(countries);
      return countries;
    } catch (ex) {
      console.error("getCountries.exception: ", ex);
    }
  }
  cb && cb();
}

module.exports = getCountries;
