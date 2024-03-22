import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import Axios from "axios";
import { getUnixTimeStamp } from "../utils/extractUnixTimeStamp";
import { News } from "../types";

const client = new DynamoDBClient({});
const dynamoClient = DynamoDBDocument.from(client);

const DEFAULT_API_KEY = "JWCN89KTI7ZSKN3G";

interface funcInputType {
  targetCurrency: "EUR" | "GBP" | "YEN" | "NGN";
  outputSize?: "compact" | "full";
}

const SETIMENT_TABLE_NAME = "mdx-fx-news";

export const downloadCurrencyNews = async ({
  targetCurrency,
}: funcInputType): Promise<any | any> => {
  try {
    const { data }: { data: { feed: Array<News> } } = await Axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${DEFAULT_API_KEY}&tickers=FOREX:USD`
    );

    for (const item of data?.feed) {
      await dynamoClient.send(
        new PutCommand({
          TableName: SETIMENT_TABLE_NAME,
          Item: {
            timestamp: getUnixTimeStamp(item?.time_published).toString(),
            currencyName: targetCurrency,
            summary: item?.summary,
          },
        })
      );
    }

    return data;
  } catch (error) {
    console.error(error);
  }
};
