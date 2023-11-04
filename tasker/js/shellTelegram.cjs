const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions/index.js");
const input = require("input");
const readline = require("readline");
require('dotenv').config();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION);

const argv = require('minimist')(process.argv.slice(2));

const startClient = async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Please enter your number (international code included): "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  
  if (!stringSession._key) {
    console.log("Your session string: ",client.session.save());
  }

  return client;
}

(async () => {
  if (argv.m || argv.w) {
    const client = await startClient();

    const username = argv.u ? argv.u : process.env.DEFAULT_USER;
    const message = argv.w ? process.env.WATER_MSG : argv.m;
    
    await client.sendMessage(username, { message });
    await client.disconnect()
  } else if (argv.l) {
    const client = await startClient();
    const username = argv.u ? argv.u : process.env.DEFAULT_USER;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    for await (const line of rl) {
      if (line != "") {
        await client.sendMessage(username, { message: line });
      }
    }

    await client.disconnect();
    rl.close();
  } else {
    console.error("Please specify the message to be sent using -m")
  }
})();
