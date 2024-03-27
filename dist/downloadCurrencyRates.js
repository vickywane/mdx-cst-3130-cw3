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
exports.downloadHistoricalCurrencies = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({});
const dynamoClient = lib_dynamodb_1.DynamoDBDocument.from(client);
const axios = require("axios");
const DEFAULT_CURRENCY = "USD";
const DEFAULT_API_KEY = "JWCN89KTI7ZSKN3G";
const CURRENCY_TABLE_NAME = "mdx-fx-rates";
const downloadHistoricalCurrencies = (_a) => __awaiter(void 0, [_a], void 0, function* ({ targetCurrency, outputSize = "compact", }) {
    try {
        const { data } = yield axios.get(`https://www.alphavantage.co/query?function=FX_DAILY&apikey=${DEFAULT_API_KEY}&from_symbol=${DEFAULT_CURRENCY}&to_symbol=${targetCurrency}&outputsize=${outputSize}`);
        const currencyList = data["Time Series FX (Daily)"];
        // for (const key in currencyList) {
        //   const index = Object.keys(currencyList).indexOf(key);
        //   console.log(`INSERTING item ${index} for ${key} to DynamoDB`);
        //   await dynamoClient.send(
        //     new PutCommand({
        //       TableName: CURRENCY_TABLE_NAME,
        //       Item: {
        //         timestamp: key,
        //         currencyName: DEFAULT_CURRENCY,
        //         currency: targetCurrency,
        //         rate: currencyList[key]["4. close"],
        //       },
        //     })
        //   );
        // }
        let awsConfig = {
            region: "us-east-1",
            endpoint: "https://dynamodb.us-east-1.amazonaws.com",
        };
        // Create new DocumentClient
        // const client = new DynamoDBClient({ region: awsConfig.region });
        const TABLE_NAME = "mdx-fx-sentiments";
        const command = new lib_dynamodb_1.PutCommand({
            TableName: TABLE_NAME,
            Item: {
                currencyName: "EUR",
                timestamp: 1710853926000,
                sentiment: 126.022422635411,
            },
        });
        yield dynamoClient.send(command);
        // const { data: response } = await axios.post(
        //   SENTIMENT_PROCESSOR_ENDPOINT,
        //   {
        //     text: summary,
        //   }
        // );
        // if (!response?.sentiment) {
        //     throw new Error(`SENTIMENT NOT RETURNED FOR ${summary}`)
        // }
        // const command = new PutCommand({
        //   TableName: TABLE_NAME,
        //   Item: {
        //     currencyName: currency,
        //     timestamp: Number(timeStamp),
        //     sentiment: response?.sentiment,
        //   },
        // });
        // await documentClient.send(command);
        return data;
    }
    catch (error) {
        console.error(error);
    }
});
exports.downloadHistoricalCurrencies = downloadHistoricalCurrencies;
