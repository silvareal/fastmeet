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
const twillioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twillioAccountSID = process.env.TWILIO_ACCOUNT_SID;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require("twilio")(twillioAccountSID, twillioAuthToken);
function getTwilioTurnServer() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = {};
        if (!!twillioAuthToken === false || !!twillioAccountSID === false) {
            const error = new Error();
            error.message = "Twilio Secret keys required";
            throw error;
        }
        response = yield twilio.tokens
            .create()
            .then((token) => {
            return token;
        })
            .catch((err) => {
            console.log(err);
            const error = new Error();
            error.message = `${err}`;
            throw error;
        });
        return response;
    });
}
exports.getTwilioTurnServer = getTwilioTurnServer;
