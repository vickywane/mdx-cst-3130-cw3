import AWS from 'aws-sdk'

const Dynamo = new AWS.DynamoDB()

export const handler = async (event) => {

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
 