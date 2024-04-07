export const DATA_QUERY = (coin: string) => ({
  priceQuery: {
    TableName: "CryptoExchangeRates",
    Limit: 5,
    ScanIndexForward: false,
    KeyConditionExpression: "CurrencySymbol = :curr",
    ExpressionAttributeValues: {
      ":curr": coin,
    },
  },
  sentimentQuery: {
    TableName: "Sentiment",
    Limit: 5,
    ScanIndexForward: false,
    KeyConditionExpression: "CurrencySymbol = :curr",
    ExpressionAttributeValues: {
      ":curr": coin,
    },
    SortKeyCondition: "TimePublished",
  },
  preditionsQuery: {
    TableName: "Crypto",
    Limit: 5,
    ScanIndexForward: false,
    KeyConditionExpression: "Currency = :curr",
    ExpressionAttributeValues: {
      ":curr": coin,
    },
  },
});

export const API_GATEWAY_ENDPOINT = "https://odvmw37prk.execute-api.us-east-1.amazonaws.com/production/"