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
//Import modules
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
//Create client
const client = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    //Get connection ID from event
    let connId = event.requestContext.connectionId;
    console.log("Disconnecting client with ID: " + connId);
    //Parameters for deleting connection ID from DynamoDB
    const command = new lib_dynamodb_1.DeleteCommand({
        TableName: "mdx-fx-websocket-clients",
        Key: {
            ConnectionId: connId
        }
    });
    //Send delete command
    try {
        yield docClient.send(command);
        console.log("Connection ID deleted.");
        //Return response
        return {
            statusCode: 200,
            body: "Client disconnected. ID: " + connId
        };
    }
    catch (err) {
        console.log("Error disconnecting client with ID: " + connId + ": " + JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };
    }
});
exports.handler = handler;
