const twillioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twillioAccountSID = process.env.TWILIO_ACCOUNT_SID;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require("twilio")(twillioAccountSID, twillioAuthToken);

export async function getTwilioTurnServer() {
  let response = {};
  if (!!twillioAuthToken === false || !!twillioAccountSID === false) {
    const error = new Error();
    error.message = "Twilio Secret keys required";
    throw error;
  }

  response = await twilio.tokens
    .create()
    .then((token: any) => {
      return token;
    })
    .catch((err: Error) => {
      console.log(err);
      const error = new Error();
      error.message = `${err}`;
      throw error;
    });

  return response;
}
