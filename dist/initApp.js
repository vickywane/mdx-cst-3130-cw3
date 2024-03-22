"use strict";
const { downloadHistoricalCurrencies, } = require("./services/downloadCurrencyRates");
const { downloadCurrencyNews } = require("./services/downloadCurrencySentiment");
// downloadHistoricalCurrencies({ targetCurrency : "EUR" })
//   .then((data : any) => {
//     // console.log(data);
//   })
//   .catch((e : any) => {
//     console.log(e);
//   });
downloadCurrencyNews({ targetCurrency: "EUR" })
    .then((data) => {
    // console.log(data);
})
    .catch((e) => {
    console.log(e);
});