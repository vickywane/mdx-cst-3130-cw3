const fs = require('fs');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

// Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Function to fetch data from DynamoDB
async function getData(currencyName) {
    const queries = {
        priceQuery: {
            TableName: "mdx-fx-rates",
            Limit: 150,
            ScanIndexForward: false,
            KeyConditionExpression: "currencyName = :curr",
            ExpressionAttributeValues: {
                ":curr": currencyName
            },
        }
    }

    try {
        const exchangeQuery = new QueryCommand(queries.priceQuery);
        const rawExchangeData = await docClient.send(exchangeQuery);

        // Reverse the array only once
        const reversedItems = rawExchangeData.Items.reverse();

        let target = [];
        for (let i = 0; i < reversedItems.length; i++) {
            target.push(reversedItems[i].rate);
        }

        let start = new Date(reversedItems[0].timestamp);
        let allData = {
            start: start.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''),
            target: target
        };

        return allData;
    } catch (err) {
        console.log(err);
    }
}

// getData("BTC"); 
// getData("DOGE");
// getData("ETH");
// getData("LTC");
// getData("XRP");


module.exports = getData