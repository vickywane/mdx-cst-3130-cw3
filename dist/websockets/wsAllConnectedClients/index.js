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
exports.handler = void 0;
//Import external library with websocket functions
const websocket_1 = require("./websocket");
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = "oa4yaqfqw1.execute-api.us-east-1.amazonaws.com";
    const stage = "prod";
    try {
        console.log("Domain: " + domain + " stage: " + stage);
        // Get the recent data from database
        const data = yield getData("BTC");
        //Get promises to send messages to connected clients
        let sendMsgPromises = yield (0, websocket_1.getSendMessagePromises)(JSON.stringify(data), domain, stage);
        //Execute promises
        yield Promise.all(sendMsgPromises);
    }
    catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }
    //Success
    return { statusCode: 200, body: "Data sent successfully." };
});
exports.handler = handler;
