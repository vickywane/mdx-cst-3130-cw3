const fs = require('fs');
const axios = require('axios');

const url = 'https://y2gtfx0jg3.execute-api.us-east-1.amazonaws.com/prod/M00958495';
const trainFile = 'train.json';
const testFile = 'test.json';

const getDownloadPath = (fileName) => {
    return `${__dirname.replace("services", "data")}/${fileName || ''}`
} 

async function pullAndSaveData(url, trainFile, testFile, trainRatio = 0.85,mainFile="synthetic.json") {
    try {
        const response = await axios.get(url);
        const data = response.data;
        
        const trainSize = Math.ceil(data.target.length * trainRatio);
        const trainData = data.target.slice(0, trainSize);
        const testData = data.target.slice(trainSize);

        // Save train data to train.json
        fs.writeFileSync(mainFile, JSON.stringify(data, null, 4));
        fs.writeFileSync(getDownloadPath(trainFile), JSON.stringify({...data,target:trainData}, null, 4));
        fs.writeFileSync(getDownloadPath(testFile), JSON.stringify({...data,target:testData}, null, 4));

        console.log(`Data has been successfully saved to ${getDownloadPath()}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

pullAndSaveData(url, trainFile, testFile);