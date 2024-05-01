# MyCurrency Currency Predictor
This project was built as my second-coursework for the CST3130 Advanced Web and Big Data module at the [Middlesex University, London](https://www.mdx.ac.uk/). The application uses an Event Driven Architecture (EDA) deployed to the Amazon Web Services (AWS) to pull prices for the `EUR, GBP, CAD, NGN, GHS` currencies from the AlphaAdvantage API forex service, analyze news sentiments about the currencies, and predict their future prices.

This repository stores the code for various seperated components for this project. Examples of such components are the Lambda function codes in the `src/functions/*` directory.

## Requirements

The AWS CLI configured on your local computer with access permissions to the S3, SageMaker, and DynamoDB services. The AWS SDKs within this project by default use the access credentials set for the AWS CLI to authenticate with the services.

## Run Locally 
The following steps will guide you on how to run the project code; 

- Clone or manually download this project from the repository. 
- Execute the `yarn install` command to install the project dependencies.
- Execute the `yarn start-ts` command to start the process of pulling currency rates and news from the AlphaAdvantage API.  

## Project Architecture 
This project was developed using the Event-Driven Architecture (EDA) on Amazon Web Service (AWS) which comprises the following services; 

- AWS Lambda Functions for executing code on event triggers.
- AWS DynamoDB for data storage.
- AWS Sagemaker for machine learning. 
- AWS Simple Storage Service (S3) for blob data storage 

The following architecture diagram depicts how these services interact with each other to build the project; 

<img src="https://res.cloudinary.com/dkfptto8m/image/upload/v1714572239/personal-portfolio-app/blog/project-architecture.png" style="height: 100%; width: 100%" alt="Project Architecture" />

The machine learning component as shown in the diagram above comprises of an AWS S3 bucket storing the machine learning files and the SageMaker models. The data seeding and sentiment analysis uses three dynamoDB tables to store currency news, sentiments, and rates. The 
Data Storage 

This project uses the lightweight DynamoDB service to store sentiment, news, rates, and WebSocket connections in JSON format. The project also uses the S3 service to store blob files as the machine-learning files for SageMaker and the HTML website files are stored in two separate buckets.   

### DynamoDB 

The data for this application is stored across four (4) tables on DynamoDB. The mdx-fx-news table stores news about a currency for sentiment processing, the mdx-fx-rates table stores currency rates, the mdx-fx-sentiments stores sentiment results for a currency, and the mdx-fx-websocket-clients store the ID of every WebSocket connection initiated.  

The DynamoDB tables were created using the On-Demand capacity mode to accommodate the large volume of incoming currency and news data. The tables and their attributes are highlighted in the following list;

- mdx-fx-news:
    - currencyName (primary_key) 
    - timestamp (sort_key)
    - summary 

- mdx-fx-rates
    - currencyName (primary_key) 
    - timestamp (sort_key)
    - rate 
    - prediction 
    - targetCurrency

- mdx-fx-sentiments 
    - currencyName (primary_key) 
    - timestamp (sort_key)
    - sentiment

- mdx-fx-websocket-clients 
    - connectionId (primary_key)

## Machine Learning Workflow

This project employs the Sagemaker service on AWS to perform machine learning on the currency data stored within DynamoDB tables. Six (6) training jobs in total were executed on Sagemaker using the Time Series Forecast - DeepAR built-in algorithm for the student synthetic data and the GBP, USD, CAD, and GHS. 

Javascript functions written using typescript were used to pull down the data from the DynamoDB table, split them, convert them to JSON Line, and train the Sagemaker service to create a model and invoke the endpoint.

<img src="https://res.cloudinary.com/dkfptto8m/image/upload/v1714573816/personal-portfolio-app/blog/training-jobs-history.png.png" style="height: 100%; width: 100%" alt="SageMaker Training Jobs" />
To plot the synthetic student data as an example, the external Plotly service was used via the Plotly Node.js package. 

The following image shows the plotting of the synthetic student data; 
<img src="https://res.cloudinary.com/dkfptto8m/image/upload/v1714573965/personal-portfolio-app/blog/plotly-training-data.png" style="height: 100%; width: 100%" alt="SageMaker Training Jobs" />


## Sentiment Analysis Workflow  

A workflow comprising the mdx-fx-news table, a Lambda function, and the mdx-fx-sentiments table was used to an automated sentiment analysis workflow. When a new entry is inserted into the mdx-fx-news table, a Lambda function using the DynamoDB trigger is executed to analyze the summary text within the record and save the value into the mdx-fx-sentiments table for later retrieval. 
Website Frontend 

The frontend aspect of the project utilizes a vanilla HTML application styled using TailwindCSS. Using an external JavaScript file, the website connects to the API Gateway WebSocket endpoint to send a message and fetch data for each currency. The Website’s HTML, Javascript, and CSS files are stored in a publicly accessible S3 bucket.  

The website can be viewed here: https://mdx-fx-client-website.s3.amazonaws.com/index.html 

The following image shows the website displaying price analysis and sentiment data for the GBP currency;
<img src="https://res.cloudinary.com/dkfptto8m/image/upload/v1714574075/personal-portfolio-app/blog/first-example.png" style="height: 100%; width: 100%" alt="GBP Example" />

Clicking any of the listed currencies at the sidebar will change the currency data displayed and fetch the matching currency data;
<img src="https://res.cloudinary.com/dkfptto8m/image/upload/v1714574177/personal-portfolio-app/blog/example-2.png" style="height: 100%; width: 100%" alt="GBP Example 2" />




