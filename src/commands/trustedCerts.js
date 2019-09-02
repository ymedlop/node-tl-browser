const fs = require("fs-extra");
const exec = require('child_process').exec;
const dataMock = require("../assets/mocks/tl/DE.json");

function writeOutput(cc, data, serviceFilter, exported = false) {
  const sp = data.tl.serviceProviders;
  const results = sp.reduce((items, item) => {
    if (serviceFilter) {
      if (item.qServiceTypes.includes(serviceFilter)) {
     	 item.tspservices.forEach(st => {
          		items.push({
           			 id: item.id,
           			name: item.name,
           			country: data.tl.dbCountryName,
            			qServiceTypes: st.qServiceTypes,
            			serviceFilter,
            		 	certificates: st.digitalIdentification
             });    
      	});
      }
    } else {
      item.tspservices.forEach(st => {
        items.push({
          id: item.id,
          name: item.name,
          country: data.tl.dbCountryName,
          qServiceTypes: st.qServiceTypes,
          certificates: st.digitalIdentification
        });
      });
    }
    return items;
  }, []);
  if (exported) {
    const distFolder = `./dist/${cc}`;
    fs.ensureDir(distFolder)
      .then(() => {
        // Write Manifest
        writeJSONFile(`${distFolder}/manifest.json`, results);
        // Write Original Info
        writeJSONFile(`${distFolder}/raw.json`, data);
        // Write Service Provider Manifest
        results.forEach(item => {
          writeJSONFile(
            `${distFolder}/${item.id.replace(" ", "_").toLowerCase()}.json`,
            item
          );
          item.certificates.forEach(identity => {
            identity.certificateList.forEach(cert => {
              // TODO: Parameter chek expiration by default always
	      if (cert.certAfter >= new Date().getTime()) {
              	 const name = `${distFolder}/${cc}_${cert.id.replace(" ", "_").toLowerCase()}.crt`;
                 const content = `-----BEGIN CERTIFICATE-----\r\n${cert.certEncoded}\r\n-----END CERTIFICATE-----`;
                 writeFile(name, content);
	      }
            });
          });
        });
      })
      .catch(err => console.error(err));
  } else {
    // TODO: Improve output
    console.log(results);
  }
}

function writeFile(name, output) {
  fs.writeFile(name, output, err => {
    if (err) return console.error(err);
    console.log("Writing file was OK: ", name);
    const command = `openssl x509 -in ${name} -outform PEM -out ${name}.pem`;
     setTimeout(() => {
        exec(command, (err, stdout, stderr) => {
	   if (err) console.error(err);
	   else console.log(`Executing commando was OK: ${name}.pem}`);
	});
    });
  });
}

function writeJSONFile(name, output) {
  fs.writeJson(name, output, err => {
    if (err) return console.error(err);
    console.log("Writing file was OK: ", name);
  });
}

async function getTrustedCertsByCC(apiClient, args, cb) {
  const {
    cc,
    options: { mock, service, exported }
  } = args;
  // Check Mock mode On
  if (mock) {
    const certs = dataMock.content;
    // TODO: output countries table
    console.log("Careful!. You are working with Mocks!");
    writeOutput(cc, certs, service, exported);
  } else {
    // Mock mode Off
    console.log("You are working with real data. Loading ...");
    try {
      const data = { cc };
      const client = await apiClient();
      const results = await client.apis["api-browser-controller"].getTLUsingGET(
        data
      );
      const certs = results.body.content;
      writeOutput(cc, certs, service, exported);
    } catch (ex) {
      console.error("getTrustedCertsByCC.exception: ", ex);
    }
  }
  cb();
}

module.exports = getTrustedCertsByCC;
