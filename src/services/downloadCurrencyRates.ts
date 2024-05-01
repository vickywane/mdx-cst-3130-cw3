import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const dynamoClient = DynamoDBDocument.from(client);

const axios = require("axios");

const DEFAULT_CURRENCY = "EUR";
const DEFAULT_API_KEY = "JWCN89KTI7ZSKN3G";

interface funcInputType {
  targetCurrency: "EUR" | "GBP" | "CAD" | "NGN" | "GHS";
  outputSize?: "compact" | "full";
}

const CURRENCY_TABLE_NAME = "mdx-fx-rates";

export const downloadHistoricalCurrencies = async ({
  targetCurrency,
  outputSize = "compact",
}: funcInputType): Promise<any | any> => {
  try {
    const { data } = await axios.get(
      `https://www.alphavantage.co/query?function=FX_DAILY&apikey=${DEFAULT_API_KEY}&from_symbol=${DEFAULT_CURRENCY}&to_symbol=${targetCurrency}&outputsize=${outputSize}`
    );

    const currencyList = data["Time Series FX (Daily)"];

    for (const key in currencyList) {
      const index = Object.keys(currencyList).indexOf(key);

      console.log(`INSERTING item ${index} for ${key} to DynamoDB`);

      if (index <= 510) {
        await dynamoClient.send(
          new PutCommand({
            TableName: CURRENCY_TABLE_NAME,
            Item: {
              timestamp: key,
              currencyName: targetCurrency,
              targetCurrency: DEFAULT_CURRENCY,
              rate: currencyList[key]["4. close"],
            },
          })
        );
      }
    }

    return data;
  } catch (error) {
    console.error(error);
  }
};
