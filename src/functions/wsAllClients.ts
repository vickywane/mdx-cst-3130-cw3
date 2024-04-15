import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

export const DATA_QUERY = (currency) => ({
  priceQuery: {
    TableName: "mdx-fx-rates",
    Limit: 5,
    ScanIndexForward: false,
    KeyConditionExpression: "currencyName = :curr",
    ExpressionAttributeValues: {
      ":curr": currency,
    },
  },
  sentimentQuery: {
    TableName: "mdx-fx-sentiments",
    Limit: 5,
    ScanIndexForward: false,
    KeyConditionExpression: "currencyName = :curr",
    ExpressionAttributeValues: {
      ":curr": currency,
    },
    SortKeyCondition: "TimePublished",
  }
});

export const API_GATEWAY_ENDPOINT =
  "https://odvmw37prk.execute-api.us-east-1.amazonaws.com/production/";

export async function getSendMessagePromises(data, endpoint) {
  const WsServiceDBClient = new WsServiceDB();

  let clientIdArray = await WsServiceDBClient.getConnectionIds();

  if (clientIdArray <= 0) {
    console.error("No active connections to push message into!");

    return;
  }

  const apiGwClient = new ApiGatewayManagementApiClient({ endpoint });

  return clientIdArray?.map(async ({ connectionId }) => {
    try {
      console.log("Sending data '" + data + "' to: " + connectionId);

      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: data,
      });

      await apiGwClient.send(postToConnectionCommand);
      console.log("Message '" + data + "' sent to: " + connectionId);
    } catch (err) {
      console.log("Failed to send data to: " + connectionId);

      if (err.statusCode == 410) {
        try {
          await WsServiceDBClient.deleteConnectionId(connectionId);
        } catch (err) {
          console.log("ERROR deleting connectionId: " + JSON.stringify(err));
          throw err;
        }
      } else {
        console.log("UNKNOWN ERROR: " + JSON.stringify(err));
        throw err;
      }
    }
  });
}

class WsServiceDB {
  client;
  docClient;

  constructor() {
    this.client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async getConnectionIds() {
    const scanCommand = new ScanCommand({
      TableName: "mdx-fx-websocket-clients",
    });

    const response = await this.docClient.send(scanCommand);
    return response.Items;
  }

  async getData(currency) {
    try {
      const exhangeQuery = new QueryCommand(DATA_QUERY(currency).priceQuery);
      const sentimentQuery = new QueryCommand(
        DATA_QUERY(currency).sentimentQuery
      );
      // const preditionsQuery = new QueryCommand(DATA_QUERY("btc").priceQuery);

      let rawExchangeData = await this.docClient.send(exhangeQuery);
      let rawSentimentData = await this.docClient.send(sentimentQuery);

      let sentimentXaxis = [];
      let sentimentYaxis = [];
      let exchangeXaxis = [];
      let exchangeYaxis = [];

      rawSentimentData?.Items.forEach((item) => {
        sentimentYaxis.push(item.sentiment);
        sentimentXaxis.push(item.timestamp);
      });

      rawExchangeData?.Items.forEach((item) => {
        exchangeYaxis.push(item.rate);
        exchangeXaxis.push(item.targetCurrency);
      });

      return {
        [`${currency}`]: {
          actual: {
            x: exchangeXaxis,
            y: exchangeYaxis,
          },
          prediction: {},
          sentiment: {
            x: sentimentXaxis,
            y: sentimentYaxis,
          },
        },
      };
    } catch (err) {
      console.log(err);
    }
  }

  async deleteConnectionId(connectionId) {
    console.log("Deleting connection Id: " + connectionId);

    const deleteCommand = new DeleteCommand({
      TableName: "mdx-fx-websocket-clients",
      Key: {
        ConnectionIds: connectionId,
      },
    });
    return this.docClient.send(deleteCommand);
  }
}

export const handler = async (event) => {
  const WsServiceDBClient = new WsServiceDB();

  try {
    const data = await WsServiceDBClient.getData("EUR");

    let sendMsgPromises = await getSendMessagePromises(
      JSON.stringify(data),
      API_GATEWAY_ENDPOINT
    );

    await Promise.all(sendMsgPromises);
  } catch (err) {
    return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
  }

  //Success
  return { statusCode: 200, body: "Data sent successfully." };
};
