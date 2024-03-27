//Import external library with websocket functions
import { getSendMessagePromises } from "./websocket";
export const handler = async (event) => {
    const domain = "oa4yaqfqw1.execute-api.us-east-1.amazonaws.com"
    const stage =   "prod"
    try {
        
        console.log("Domain: " + domain + " stage: " + stage);
        // Get the recent data from database
       const data = await getData("BTC")


         //Get promises to send messages to connected clients
         let sendMsgPromises = await getSendMessagePromises(JSON.stringify(data), domain, stage);

         //Execute promises
         await Promise.all(sendMsgPromises);
        

       
    }
    catch(err){
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};







