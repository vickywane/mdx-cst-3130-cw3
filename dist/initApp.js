"use strict";
const { downloadHistoricalCurrencies, } = require("./services/downloadCurrencyRates");
const { downloadCurrencyNews } = require("./services/downloadCurrencySentiment");
downloadHistoricalCurrencies({ targetCurrency: "USD" })
    .then((data) => {
    // console.log(data);
})
    .catch((e) => {
    console.log(e);
});
