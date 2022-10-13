"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwilioTurnServer = void 0;
const GlobalUtils_1 = require("../helpers/GlobalUtils");
const twillioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twillioAccountSID = process.env.TWILIO_ACCOUNT_SID;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require('twilio')(twillioAccountSID, twillioAuthToken);
const log = new GlobalUtils_1.Logger();
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
function getTwilioTurnServer() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = {};
        if (!!twillioAuthToken === false || !!twillioAccountSID === false) {
            const error = new Error();
            const message = 'Twilio Secret keys required';
            log.error(message);
            error.message = message;
            throw error;
        }
        response = yield twilio.tokens
            .create()
            .then((token) => {
            log.info('Twilio Turn server generated', token);
            return token;
        })
            .catch((err) => {
            // if twilio turn server false fallback to default
            log.error(err, fallbackTurnServer);
            return fallbackTurnServer;
        });
        return response;
    });
}
exports.getTwilioTurnServer = getTwilioTurnServer;
