const fs = require("fs");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

// Create client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const getDownloadPath = (fileName) => {
    return `${__dirname.replace("services", "data")}/${fileName || ""}`;
};

// Function to fetch data from DynamoDB
async function getData(currency) {
  const queries = {
    priceQuery: {
      TableName: "mdx-fx-rates",
      Limit: 600,
      ScanIndexForward: true,
      KeyConditionExpression: "currencyName = :curr",
      ExpressionAttributeValues: {
        ":curr": currency,
      },
    },
  };

  try {
    const exchangeQuery = new QueryCommand(queries.priceQuery);
    const rawExchangeData = await docClient.send(exchangeQuery);

    // console.log(rawExchangeData);

    if (!rawExchangeData) {
        throw new Error("No  DB data")
    }

    // Write data to a JSON file
    const fileName = `${currency}/${currency}.json`;
    let target = [];
    for (let i = 0; i < rawExchangeData.Items.length; i++) {
      target.push(rawExchangeData.Items[i].rate);
    }
    let start = new Date(rawExchangeData.Items[0].timestamp);
    console.log(start);
    let allData = {
      start: start
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, ""),
      target: target,
    };

    fs.writeFileSync(getDownloadPath(fileName), JSON.stringify(allData));
    console.log(`Data saved to ${fileName}`);
  } catch (err) {
    console.log(err);
  }
}

// getData("NGN");
// getData("CAD");
// getData("USD");
// getData("GBP");
getData("GHS");
