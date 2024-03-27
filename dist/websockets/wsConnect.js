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
//Import library and scan command
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
//Create new Client
const ddbClient = new client_dynamodb_1.DynamoDBClient();
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    //Get connection ID from event
    let connId = event.requestContext.connectionId;
    console.log("Client connected with ID: " + connId);
    //Parameters for storing connection ID in DynamoDB
    const params = {
        TableName: "mdx-fx-websocket-clients",
        Item: {
            ConnectionId: connId
        }
    };
    //Store connection Id for later communication with client
    try {
        yield ddbClient.send(new lib_dynamodb_1.PutCommand(params));
        console.log("Connection ID stored.");
        //Return response
        return {
            statusCode: 200,
            body: "Client connected with ID: " + connId
        };
    }
    catch (err) {
        console.error(JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };
    }
});
exports.handler = handler;
