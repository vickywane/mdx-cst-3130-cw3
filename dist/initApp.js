"use strict";
const { downloadHistoricalCurrencies, } = require("./services/downloadCurrencyRates");
const { downloadCurrencyNews, } = require("./services/downloadCurrencySentiment");
downloadHistoricalCurrencies({ targetCurrency: "GHS", outputSize: "full" })
    .then((data) => {
    // console.log(data);
})
    .catch((e) => {
    console.log(e);
});
