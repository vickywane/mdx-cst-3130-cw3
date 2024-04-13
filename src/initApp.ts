"use strict";

const {
  downloadHistoricalCurrencies,
} = require("./services/downloadCurrencyRates");

const {
  downloadCurrencyNews,
} = require("./services/downloadCurrencySentiment");

downloadHistoricalCurrencies({ targetCurrency: "GHS", outputSize: "full" })
  .then((data: any) => {
    // console.log(data);
  })
  .catch((e: any) => {
    console.log(e);
  });

downloadCurrencyNews({ targetCurrency: "GHS" })
  .then((data: any) => {
    // console.log(data);
  })
  .catch((e: any) => {
    console.log(e);
  });
