const fs = require("fs");

async function splitData(currency, folder, trainRatio = 0.7) {
  try {
    const data = require(`${__dirname.replace("services", "data")}/${folder}/${folder}.json`);
    const trainFile = `${__dirname.replace("services", "data")}/${folder}/${currency}_train.json`;
    const testFile = `${__dirname.replace("services", "data")}/${folder}/${currency}_test.json`;

    const totalData = data.target.length;
    const trainSize = Math.ceil(totalData * trainRatio);
    const trainData = data.target.slice(0, trainSize);

    const testData = data.target.slice(trainSize);
    console.log(trainData.length);

    // Save train data to train.json

    fs.writeFileSync(
      trainFile,
      JSON.stringify({ ...data, target: trainData }, null, 4)
    );

    // Save test data to test.json
    fs.writeFileSync(
      testFile,
      JSON.stringify({ ...data, target: testData }, null, 4)
    );

    console.log("Data has been successfully saved.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Example usage:

// Example data (replace this with your actual data)
// Load your JSON data here

// Convert JSON string to JavaScript object using JSON.parse()

splitData("cad", "CAD");
splitData("usd", "USD");
splitData("ghs", "GHS");
splitData("gbp", "GBP");
splitData("ngn", "NGN");
