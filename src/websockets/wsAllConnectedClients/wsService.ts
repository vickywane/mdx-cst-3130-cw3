import { WsServiceDB } from "./wsServiceDB";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

//Returns promises to send messages to all connected clients
export async function getSendMessagePromises(data, endpoint) {
  const WsServiceDBClient = new WsServiceDB();

  let clientIdArray = await WsServiceDBClient.getConnectionIds();
  console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));

  const apiGwClient = new ApiGatewayManagementApiClient({ endpoint });

  //Try to send data to connected clients
  let msgPromiseArray = clientIdArray?.map(async (item) => {
    //Extract connection ID
    const connId = item.ConnectionId;
    try {
      console.log("Sending data '" + data + "' to: " + connId);

      //Create post to connection command
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connId,
        Data: data,
      });

      //Wait for API Gateway to execute and log result
      await apiGwClient.send(postToConnectionCommand);
      console.log("Message '" + data + "' sent to: " + connId);
    } catch (err) {
      console.log("Failed to send data to: " + connId);

      //Delete connection ID from database
      // @ts-ignore
      if (err.statusCode == 410) {
        try {
          await WsServiceDBClient.deleteConnectionId(connId);
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

  return msgPromiseArray;
}
