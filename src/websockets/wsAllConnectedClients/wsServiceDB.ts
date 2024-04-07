//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DATA_QUERY } from "./constants";

// const client = new DynamoDBClient({});
// const docClient = DynamoDBDocumentClient.from(client);

export class WsServiceDB {
  private client;
  private docClient;

  constructor() {
    this.client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async getConnectionIds() {
    const scanCommand = new ScanCommand({
      TableName: "WebSocketClients",
    });

    const response = await this.docClient.send(scanCommand);
    return response.Items;
  }

  async getData(currency) {
    try {
      const exhangeQuery = new QueryCommand(DATA_QUERY("btc").priceQuery);
      const sentimentQuery = new QueryCommand(DATA_QUERY("btc").sentimentQuery);
      const preditionsQuery = new QueryCommand(DATA_QUERY("btc").priceQuery);

      let rawExchangeData = await this.docClient.send(exhangeQuery);
      let rawSentimentData = await this.docClient.send(sentimentQuery);

      let sentimentXaxis: any = [];
      let sentimentYaxis: any = [];
      let exchangeXaxis: any = [];
      let exchangeYaxis: any = [];

      // @ts-ignore
      rawSentimentData?.Items.forEach((item) => {
        sentimentYaxis.push(item.Sentiment);
        sentimentXaxis.push(item.TimePublished);
      });

      // @ts-ignore
      rawExchangeData?.Items.forEach((item) => {
        exchangeYaxis.push(item.ExchangeRates);
        exchangeXaxis.push(item.CrytoTs);
      });

      let formattedData = {
        [`${currency}`]: {
          actual: {
            x: exchangeXaxis,
            y: exchangeYaxis,
          },
          predition: {},
          sentiment: {
            x: sentimentXaxis,
            y: sentimentYaxis,
          },
        },
      };

      return formattedData;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteConnectionId(connectionId) {
    console.log("Deleting connection Id: " + connectionId);

    const deleteCommand = new DeleteCommand({
      TableName: "WebSocketClients",
      Key: {
        ConnectionIds: connectionId,
      },
    });
    return this.docClient.send(deleteCommand);
  }
}