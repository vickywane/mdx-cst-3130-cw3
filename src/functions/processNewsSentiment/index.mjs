import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let awsConfig = {
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com",
};

// Create new DocumentClient
const client = new DynamoDBClient({ region: awsConfig.region });
export const documentClient = DynamoDBDocumentClient.from(client);
const SENTIMENT_PROCESSOR_ENDPOINT =
  "https://kmqvzxr68e.execute-api.us-east-1.amazonaws.com/prod";
const TABLE_NAME = "mdx-fx-sentiments";

export const handler = async (event) => {
  for (let record of event.Records) {
    if (record.eventName === "INSERT") {

      console.log(record.dynamodb.NewImage)

      const currency = record.dynamodb.NewImage?.currencyName?.S;
      const summary = record.dynamodb.NewImage?.summary?.S;
      const timestamp = record.dynamodb.NewImage?.timestamp?.S;

      try {
        const { data: response } = await axios.post(
          SENTIMENT_PROCESSOR_ENDPOINT,
          {
            text: summary,
          }
        );

        if (!response?.sentiment) {
            throw new Error(`SENTIMENT SCORE NOT RETURNED FOR ${summary}`)
        }
        
        const command = new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            currencyName: currency,
            timestamp,
            sentiment: response?.sentiment,
          },
        });

        await documentClient.send(command);
      } catch (error) {
        console.error("FUNCTION EXECUTION ERROR =>", error);
      }
    }
  }
};
