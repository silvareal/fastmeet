import {Logger} from '../helpers/GlobalUtils';

const twillioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twillioAccountSID = process.env.TWILIO_ACCOUNT_SID;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require ('twilio') (twillioAccountSID, twillioAuthToken);

const log = new Logger ();
/**
 * https://www.metered.ca/tools/openrelay/#-stun-server-usage
 */
const fallbackTurnServer = {
  iceServers: [
    {
      urls: 'stun:openrelay.metered.ca:80',
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

/**
 * Generate twilio turn server
 * @returns object
 */
export async function getTwilioTurnServer () {
  let response = {};
  if (!!twillioAuthToken === false || !!twillioAccountSID === false) {
    const error = new Error ();
    const message = 'Twilio Secret keys required';
    log.error (message);
    error.message = message;
    throw error;
  }

  response = await twilio.tokens
    .create ()
    .then ((token: never) => {
      log.info ('Twilio Turn server generated', token);
      return token;
    })
    .catch ((err: Error) => {
      // if twilio turn server false fallback to default
      log.error (err, fallbackTurnServer);
      return fallbackTurnServer;
    });

  return response;
}
