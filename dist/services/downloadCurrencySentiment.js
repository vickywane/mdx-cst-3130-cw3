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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadCurrencyNews = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const axios_1 = __importDefault(require("axios"));
const extractUnixTimeStamp_1 = require("../utils/extractUnixTimeStamp");
const client = new client_dynamodb_1.DynamoDBClient({});
const dynamoClient = lib_dynamodb_1.DynamoDBDocument.from(client);
const DEFAULT_API_KEY = "JWCN89KTI7ZSKN3G";
const SETIMENT_TABLE_NAME = "mdx-fx-news";
const downloadCurrencyNews = (_a) => __awaiter(void 0, [_a], void 0, function* ({ targetCurrency, }) {
    try {
        const { data } = yield axios_1.default.get(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${DEFAULT_API_KEY}&tickers=FOREX:USD`);
        for (const item of data === null || data === void 0 ? void 0 : data.feed) {
            yield dynamoClient.send(new lib_dynamodb_1.PutCommand({
                TableName: SETIMENT_TABLE_NAME,
                Item: {
                    timestamp: (0, extractUnixTimeStamp_1.getUnixTimeStamp)(item === null || item === void 0 ? void 0 : item.time_published).toString(),
                    currencyName: targetCurrency,
                    summary: item === null || item === void 0 ? void 0 : item.summary,
                },
            }));
        }
        return data;
    }
    catch (error) {
        console.error(error);
    }
});
exports.downloadCurrencyNews = downloadCurrencyNews;
