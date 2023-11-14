const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
require('dotenv').config();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const session = new StringSession(process.env.STRING_SESSION);

const client = new TelegramClient(session, apiId, apiHash, {});

(async function run() {
  await client.connect(); // This assumes you have already authenticated with .start()

  const result = await client.invoke(
    new Api.phone.DiscardCall({
      peer: new Api.InputPhoneCall({
        id: BigInt("-4156887774564"),
        accessHash: BigInt("-4156887774564"),
      }),
      duration: 43,
      reason: new Api.PhoneCallDiscardReasonMissed({}),
      connectionId: BigInt("-4156887774564"),
      video: true,
    })
  );
  console.log(result); // prints the result
})();
