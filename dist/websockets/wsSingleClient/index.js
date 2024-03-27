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
const client_apigatewaymanagementapi_1 = require("@aws-sdk/client-apigatewaymanagementapi");
const database_1 = require("./database");
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let connId = event.requestContext.connectionId;
        const coin = JSON.parse(event.body).data;
        //Extract domain and stage from event
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        console.log("Domain: " + domain + " stage: " + stage);
        // Get the data
        const data = yield getData(coin);
        //Get promise to send messages to connected client
        yield sendMessage(connId, domain, stage, JSON.stringify(data));
    }
    catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }
    //Success
    return { statusCode: 200, body: "Data sent successfully." };
});
exports.handler = handler;
function sendMessage(connId, domain, stage, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Create API Gateway management class.
            const callbackUrl = `https://${domain}/${stage}`;
            const apiGwClient = new client_apigatewaymanagementapi_1.ApiGatewayManagementApiClient({
                endpoint: callbackUrl,
            });
            const postToConnectionCommand = new client_apigatewaymanagementapi_1.PostToConnectionCommand({
                ConnectionId: connId,
                Data: data,
            });
            //Wait for API Gateway to execute and log result
            yield apiGwClient.send(postToConnectionCommand);
            console.log("data '" + "' sent to: " + connId);
        }
        catch (err) {
            console.log("Failed to send message to: " + connId);
            //Delete connection ID from database
            if (err.statusCode == 410) {
                try {
                    yield (0, database_1.deleteConnectionId)(connId);
                }
                catch (err) {
                    console.log("ERROR deleting connectionId: " + JSON.stringify(err));
                    throw err;
                }
            }
            else {
                console.log("UNKNOWN ERROR: " + JSON.stringify(err));
                throw err;
            }
        }
    });
}
