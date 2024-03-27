//Import functions for database
import { getConnectionIds, deleteConnectionId } from './database';

//Import API Gateway
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"; 

//Returns promises to send messages to all connected clients
export async function getSendMessagePromises(data, domain, stage){
    //Get connection IDs of clients
    let clientIdArray = await getConnectionIds();
    console.log("\nClient IDs:\n" + JSON.stringify(clientIdArray));
    console.log("domainName: " + domain + "; stage: " + stage);

    //Create API Gateway management class.
    const callbackUrl = `https://${domain}/${stage}`;
    const apiGwClient = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });

    //Try to send data to connected clients
    let msgPromiseArray = clientIdArray.map( async item => {
        //Extract connection ID
        const connId = item.ConnectionId;
        try{
            console.log("Sending data '" + data + "' to: " + connId);

            //Create post to connection command
            const postToConnectionCommand = new PostToConnectionCommand({
                ConnectionId: connId,
                Data: data
            });

            //Wait for API Gateway to execute and log result
            await apiGwClient.send(postToConnectionCommand);
            console.log("Message '" + data + "' sent to: " + connId);
        }
        catch(err){
            console.log("Failed to send data to: " + connId);

            //Delete connection ID from database
            if(err.statusCode == 410) {
                try {
                    await deleteConnectionId(connId);
                }
                catch (err) {
                    console.log("ERROR deleting connectionId: " + JSON.stringify(err));
                    throw err;
                }
            }
            else{
                console.log("UNKNOWN ERROR: " + JSON.stringify(err));
                throw err;
            }
        }
    });

    return msgPromiseArray;
};


