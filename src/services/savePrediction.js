//Import AWS
const {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} = require("@aws-sdk/client-sagemaker-runtime");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

// Create client
const clientDb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(clientDb);

//Create SageMakerRuntimeClient
const client = new SageMakerRuntimeClient({});
const getData = require("./downloadTestData");

/* Data we are going to send to endpoint
    REPLACE WITH YOUR OWN DATA!
    Should be last 100 points in your time series (depending on your choice of hyperparameters).
    Make sure that start is correct.
*/

function convertIsoToDate(isoString) {
    // Convert ISO string to milliseconds
    const milliseconds = parseInt(isoString);
    
    // Create a new Date object
    const date = new Date(milliseconds);
    
    // Extract year, month, and day
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
  
    // Format the date as yyyy-mm-dd
    const formattedDate = `${year}-${month}-${day}`;
  
    return formattedDate;
}

//Calls endpoint and logs results
async function invokeEndpoint(endpointName, currency) {
  //Create and send command with data
  const last100Points = await getData(currency);

  const command = new InvokeEndpointCommand({
    EndpointName: endpointName,
    Body: JSON.stringify({
      instances: [
        {
          start: last100Points.start,
          target: last100Points.target,
        },
      ],
      configuration: {
        num_samples: 50,
        output_types: ["mean", "quantiles", "samples"],
        quantiles: ["0.1", "0.9"],
      },
    }),
    ContentType: "application/json",
    Accept: "application/json",
  });
  const response = await client.send(command);

  //Must install @types/node for this to work
  let predictions = JSON.parse(Buffer.from(response.Body).toString("utf8"));
  let reversal = last100Points.start.replace(" ", "T") + ".000Z";
  var date = new Date(reversal);

  // Get the number of milliseconds since the Unix epoch (January 1, 1970)

  const startTime = date.getTime();
  console.log(startTime);
  console.log(last100Points.start);
  let progression = 86400000;

  for (let i = 0; i < predictions.predictions[0].mean.length; i++) {

    // console.log(
    //     "VALUE =>",
    //     startTime + (150 + i) * progression
    // );

    const command = new PutCommand({
      TableName: "mdx-fx-rates",
      Item: {
        currencyName: currency,
        timestamp: convertIsoToDate(startTime + (150 + i) * progression),
        rate: predictions.predictions[0].mean[i],
        prediction: "true",
        targetCurrency: "EUR"
      },
    });

    await documentClient.send(command);
  }

  //Save Predictions Mean Only and calculate Time
  return predictions;
}

invokeEndpoint("mfx-fx-USD-endpoint","USD");
invokeEndpoint("mfx-fx-GBP-endpoint","GBP");
invokeEndpoint("mdx-fx-GHS-endpoint","GHS");
invokeEndpoint("mfx-fx-CAD-endpoint","CAD");
invokeEndpoint("mdx-fx-NGN-model-endpoint", "NGN");
