//Import external library with websocket functions
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { deleteConnectionId } from "./database";
export const handler = async (event) => {
  try {
    let connId = event.requestContext.connectionId;
    const coin = JSON.parse(event.body).data;
    //Extract domain and stage from event
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    console.log("Domain: " + domain + " stage: " + stage);

    // Get the data
    const data = await getData(coin);

    //Get promise to send messages to connected client
    await sendMessage(connId, domain, stage, JSON.stringify(data));
  } catch (err) {
    return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
  }

  //Success
  return { statusCode: 200, body: "Data sent successfully." };
};

async function sendMessage(connId, domain, stage, data) {
  try {
    //Create API Gateway management class.
    const callbackUrl = `https://${domain}/${stage}`;
    const apiGwClient = new ApiGatewayManagementApiClient({
      endpoint: callbackUrl,
    });

    const postToConnectionCommand = new PostToConnectionCommand({
      ConnectionId: connId,
      Data: data,
    });

    //Wait for API Gateway to execute and log result
    await apiGwClient.send(postToConnectionCommand);
    console.log("data '" + "' sent to: " + connId);
  } catch (err) {
    console.log("Failed to send message to: " + connId);

    //Delete connection ID from database
    if (err.statusCode == 410) {
      try {
        await deleteConnectionId(connId);
      } catch (err) {
        console.log("ERROR deleting connectionId: " + JSON.stringify(err));
        throw err;
      }
    } else {
      console.log("UNKNOWN ERROR: " + JSON.stringify(err));
      throw err;
    }
  }
}
