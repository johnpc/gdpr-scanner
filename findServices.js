const {google} = require("googleapis");
const fs = require("fs");

const BACKOFF_DURATION_MILLIS = 1000 * 120;
const FILE_PATH = "/tmp/yourSubscriptions.json";
const BATCH_SIZE = 50;
const INDICATORS = [
  "abuse",
  "accountnotify",
  "admin",
  "all",
  "author",
  "billing",
  "bounce",
  "bounces",
  "complaint",
  "confirmation",
  "confirmations",
  "customerservice",
  "customercare",
  "dev",
  "do_not_reply",
  "donotreply",
  "donotrespond",
  "domains",
  "ebill",
  "edocuments",
  "email",
  "emails",
  "events",
  "enotice",
  "estatement",
  "everyone",
  "facilities",
  "gmailunsub",
  "hello",
  "help",
  "hostmaster",
  "info",
  "information",
  "invitation",
  "invitations",
  "jobs",
  "lists",
  "listunsubscribe",
  "mail",
  "marketing",
  "member",
  "members",
  "mention",
  "messenger",
  "news",
  "newsletter",
  "nobody",
  "noc",
  "no-reply",
  "no_reply",
  "noreply",
  "notificaciones",
  "notification",
  "notifications",
  "notifier",
  "notify",
  "offers",
  "onlinenotice",
  "onlinepay",
  "order",
  "orders",
  "orderstatus",
  "picks",
  "policies",
  "policy",
  "purchasing",
  "receipts",
  "remind",
  "reminder",
  "reservation",
  "reservations",
  "reply",
  "robot",
  "sales",
  "secure",
  "service",
  "services",
  "shipping",
  "spamcomplaints",
  "subscribe",
  "subscribed",
  "support",
  "team",
  "transfer",
  "unsubscribe",
  "welcome",
];

const parseService = (emailAddress) => {
  const serviceName = emailAddress.split("@")[1].split(">")[0].split('"')[0];
  if (serviceName.split(".").length > 2) {
    return `${serviceName.split(".")[-2]}.${serviceName.split(".")[-1]}`;
  }
  return serviceName;
};

const retryRequests = async (gmail, pageToken) => {
	try {
		const batchInfo = {};
		const res = await gmail.users.messages.list({
		  maxResults: BATCH_SIZE,
		  pageToken,
		  q: `FROM:(${INDICATORS.join(" OR ")})`,
		  userId: "me",
		});
		const promises = res.data.messages.map(async (message) => {
		  const res = await gmail.users.messages.get({
			id: message.id,
			userId: "me",
		  });
		  const fromInfo = res.data.payload.headers.find(
			(header) => header.name.toLowerCase() === "from"
		  );
		  const serviceName = parseService(fromInfo.value);
		  batchInfo[serviceName] = true;
		});

		await Promise.all(promises);
		pageToken = false;
		if (res && res.data && res.data.nextPageToken) {
		  pageToken = res.data.nextPageToken;
		}
		let currentFileContents = {};
		if (fs.existsSync(FILE_PATH)) {
		  currentFileContents = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
		}
		fs.writeFileSync(
		  FILE_PATH,
		  JSON.stringify({...batchInfo, ...currentFileContents}, null, 2)
		);
		return pageToken;
	}
	catch (e) {
		console.log('Got error. Retrying.', e);
		await new Promise(r => setTimeout(r, BACKOFF_DURATION_MILLIS));
		return await retryRequests(gmail, pageToken);
	}
}

const findServices = async (auth) => {
  const gmail = google.gmail({version: "v1", auth});
  let pageToken = "";

  do {
	pageToken = await retryRequests(gmail, pageToken);
  } while (pageToken);
};

module.exports = {
  findServices,
};
