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
exports.getSendMessagePromises = void 0;
//Import functions for database
const database_1 = require("./database");
//Import API Gateway
const client_apigatewaymanagementapi_1 = require("@aws-sdk/client-apigatewaymanagementapi");
//Returns promises to send messages to all connected clients
function getSendMessagePromises(data, domain, stage) {
    return __awaiter(this, void 0, void 0, function* () {
        //Get connection IDs of clients
        let clientIdArray = yield (0, database_1.getConnectionIds)();
        console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));
        console.log("domainName: " + domain + "; stage: " + stage);
        //Create API Gateway management class.
        const callbackUrl = `https://${domain}/${stage}`;
        const apiGwClient = new client_apigatewaymanagementapi_1.ApiGatewayManagementApiClient({ endpoint: callbackUrl });
        //Try to send data to connected clients
        let msgPromiseArray = clientIdArray.map((item) => __awaiter(this, void 0, void 0, function* () {
            //Extract connection ID
            const connId = item.ConnectionId;
            try {
                console.log("Sending data '" + data + "' to: " + connId);
                //Create post to connection command
                const postToConnectionCommand = new client_apigatewaymanagementapi_1.PostToConnectionCommand({
                    ConnectionId: connId,
                    Data: data
                });
                //Wait for API Gateway to execute and log result
                yield apiGwClient.send(postToConnectionCommand);
                console.log("Message '" + data + "' sent to: " + connId);
            }
            catch (err) {
                console.log("Failed to send data to: " + connId);
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
        }));
        return msgPromiseArray;
    });
}
exports.getSendMessagePromises = getSendMessagePromises;
;
