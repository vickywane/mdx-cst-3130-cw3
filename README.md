# CW3 Lamda Functions

<!-- USE ALPHAADVANTAGE TO GET TEXT DATA FOR SENTIMENTS -->
<!-- USE MULTIPLE TABLES TO STORE THE DATA... 1 FOR SENTIMENT 1 FOR TEXT DATA 1 FOR FX RATES -->

- AlphaAdvantage: KTXOO1RCVOOZ4ECA
- FreeCurrencyAPI: fca_live_DsXkoM3fba05DNN1coWxAL40vYMwBqK8olwfq3rr


<!-- CurrencyName/symbol as the partion key -->
<!-- Timestamp for sort key -->
<!-- Sentiment table for currency -->

## DynamoDB Tables: 	
- mdx-fx-news: 
    - currencyName (pk)
    - timestamp (sk)
    - summary

- mdx-fx-rates: 
    - currencyName (pk)
    - timestamp (sk)

- mdx-fx-websocket-clients
 - connectionId (pk)
 - timestamp (sk)

- mdx-fx-sentiments
    - currencyName (pk)
    - timestamp (sk)
    - sentiment (sk)