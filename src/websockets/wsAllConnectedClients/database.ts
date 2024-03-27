//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand ,QueryCommand} from "@aws-sdk/lib-dynamodb";

//Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

//Returns all of the connection IDs
export async function getConnectionIds() {
    const scanCommand = new ScanCommand({
        TableName: "WebSocketClients"
    });
    
    const response  = await docClient.send(scanCommand);
    return response.Items;
};


export async function getData(coin){
    const queries= {
        priceQuery:{
            TableName: "CryptoExchangeRates",
            Limit: 5,
            ScanIndexForward: false,
            KeyConditionExpression: "CurrencySymbol = :curr",
            ExpressionAttributeValues: {
                ":curr": coin
            },
           
        },
        sentimentQuery:{
            TableName: "Sentiment",
            Limit: 5,
            ScanIndexForward: false,
            KeyConditionExpression: "CurrencySymbol = :curr",
            ExpressionAttributeValues: {
              ":curr": coin
            },
            SortKeyCondition: "TimePublished" 
        },
        preditionsQuery:{
            TableName: "Crypto",
            Limit: 5,
            ScanIndexForward: false,
            KeyConditionExpression: "Currency = :curr",
            ExpressionAttributeValues: {
                ":curr": coin
            },
        }
    }

    try{
  const exhangeQuery = new QueryCommand(queries.priceQuery);
  const sentimentQuery = new QueryCommand(queries.sentimentQuery);
  const preditionsQuery = new QueryCommand(queries.priceQuery);

        let rawExchangeData = await docClient.send(exhangeQuery);
        let rawSentimentData = await docClient.send(sentimentQuery)

       
        let sentimentXaxis =  []
        let sentimentYaxis = []
        let exchangeXaxis = []
        let exchangeYaxis = []

       await rawSentimentData?.Items.forEach(item => {  
           sentimentYaxis.push(item.Sentiment)
           sentimentXaxis.push(item.TimePublished)
                    
        });

        await rawExchangeData?.Items.forEach(item => {  
            exchangeYaxis.push(item.ExchangeRates)
            exchangeXaxis.push(item.CrytoTs)
                     
         });

        let formattedData = {
          [`${coin}`] : {
            actual:{
                x:exchangeXaxis,
                y:exchangeYaxis
            },
            predition:{},
            sentiment:{
                x: sentimentXaxis,
                y: sentimentYaxis
            }
        }
        }

         return formattedData
      
    }
    catch(err){
      console.log(err)
    }



}






//Deletes the specified connection ID
export async function deleteConnectionId(connectionId){
    console.log("Deleting connection Id: " + connectionId);

    const deleteCommand = new DeleteCommand ({
        TableName: "WebSocketClients",
        Key: {
            ConnectionIds: connectionId
        }
    });
    return docClient.send(deleteCommand);
};