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
exports.deleteConnectionId = exports.getData = exports.getConnectionIds = void 0;
//Import library and scan command
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
//Create client
const client = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
//Returns all of the connection IDs
function getConnectionIds() {
    return __awaiter(this, void 0, void 0, function* () {
        const scanCommand = new lib_dynamodb_1.ScanCommand({
            TableName: "WebSocketClients"
        });
        const response = yield docClient.send(scanCommand);
        return response.Items;
    });
}
exports.getConnectionIds = getConnectionIds;
;
function getData(coin) {
    return __awaiter(this, void 0, void 0, function* () {
        const queries = {
            priceQuery: {
                TableName: "CryptoExchangeRates",
                Limit: 5,
                ScanIndexForward: false,
                KeyConditionExpression: "CurrencySymbol = :curr",
                ExpressionAttributeValues: {
                    ":curr": coin
                },
            },
            sentimentQuery: {
                TableName: "Sentiment",
                Limit: 5,
                ScanIndexForward: false,
                KeyConditionExpression: "CurrencySymbol = :curr",
                ExpressionAttributeValues: {
                    ":curr": coin
                },
                SortKeyCondition: "TimePublished"
            },
            preditionsQuery: {
                TableName: "Crypto",
                Limit: 5,
                ScanIndexForward: false,
                KeyConditionExpression: "Currency = :curr",
                ExpressionAttributeValues: {
                    ":curr": coin
                },
            }
        };
        try {
            const exhangeQuery = new lib_dynamodb_1.QueryCommand(queries.priceQuery);
            const sentimentQuery = new lib_dynamodb_1.QueryCommand(queries.sentimentQuery);
            const preditionsQuery = new lib_dynamodb_1.QueryCommand(queries.priceQuery);
            let rawExchangeData = yield docClient.send(exhangeQuery);
            let rawSentimentData = yield docClient.send(sentimentQuery);
            let sentimentXaxis = [];
            let sentimentYaxis = [];
            let exchangeXaxis = [];
            let exchangeYaxis = [];
            yield (rawSentimentData === null || rawSentimentData === void 0 ? void 0 : rawSentimentData.Items.forEach(item => {
                sentimentYaxis.push(item.Sentiment);
                sentimentXaxis.push(item.TimePublished);
            }));
            yield (rawExchangeData === null || rawExchangeData === void 0 ? void 0 : rawExchangeData.Items.forEach(item => {
                exchangeYaxis.push(item.ExchangeRates);
                exchangeXaxis.push(item.CrytoTs);
            }));
            let formattedData = {
                [`${coin}`]: {
                    actual: {
                        x: exchangeXaxis,
                        y: exchangeYaxis
                    },
                    predition: {},
                    sentiment: {
                        x: sentimentXaxis,
                        y: sentimentYaxis
                    }
                }
            };
            return formattedData;
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.getData = getData;
//Deletes the specified connection ID
function deleteConnectionId(connectionId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Deleting connection Id: " + connectionId);
        const deleteCommand = new lib_dynamodb_1.DeleteCommand({
            TableName: "WebSocketClients",
            Key: {
                ConnectionIds: connectionId
            }
        });
        return docClient.send(deleteCommand);
    });
}
exports.deleteConnectionId = deleteConnectionId;
;
