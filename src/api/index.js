const Swagger = require("swagger-client");

async function getSwaggerClient() {
  const url = "https://webgate.ec.europa.eu/tl-browser/v2/api-docs";
  return await Swagger(url);
}

module.exports = getSwaggerClient;
