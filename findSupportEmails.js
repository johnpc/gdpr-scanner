const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const HUNTERIO_BASE_URL = "https://api.hunter.io/v2/domain-search";
const FILE_PATH = "/tmp/yourSubscriptions.json";
const SLEEP_DURATION_MILLIS = 1000 * 1;
const BACKOFF_DURATION_MILLIS = 1000 * 120;

const getHunterIoUrl = (domain) => {
  return `${HUNTERIO_BASE_URL}?${new URLSearchParams({
    domain,
    api_key: process.env.HUNTER_IO_API_KEY,
    type: "generic",
  }).toString()}`;
};

const findSupportEmails = async () => {
  const subscriptionsJson = JSON.parse(fs.readFileSync(FILE_PATH));
  let workToDo;
  do {
    workToDo = Object.keys(subscriptionsJson).filter(
      (key) => subscriptionsJson[key] === true
    );
    if (workToDo.length) {
      const domain = workToDo[0];
      await axios({
        method: "get",
        url: getHunterIoUrl(domain),
        responseType: "json",
      })
        .then(function (response) {
          if (
            !response ||
            !response.data ||
            !response.data.data ||
            !response.data.data.emails ||
            !!response.data.data.emails.length
          ) {
            console.log("Unable to find data for " + domain);
            subscriptionsJson[domain] = false;
          } else {
            console.log(
              `Found for ${domain}: ${response.data.data.emails
                .map((email) => email.value)
                .join(", ")}`
            );
            subscriptionsJson[domain] = response.data.data.emails.map(
              (email) => email.value
            );
          }
          fs.writeFileSync(
            FILE_PATH,
            JSON.stringify(subscriptionsJson, null, 2)
          );
        })
        .catch(async (e) => {
          console.log(`backing off: ${e.message}`);
          await new Promise((r) => setTimeout(r, SLEEP_DURATION_MILLIS));
        });
    }
    await new Promise((r) => setTimeout(r, BACKOFF_DURATION_MILLIS));
  } while (workToDo.length);
};

findSupportEmails();
