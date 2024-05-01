// document.addEventListener("DOMContentLoaded", function () {
let activeCurrency = "GBP"; // Loading GBP currency first
let currencyData = {};
let connection = null;

function sendMessage(currency, ws) {
  let msgObject = {
    action: "retrieveFxPlotPoints",
    data: currency,
  };
  ws.send(JSON.stringify(msgObject));
}

function updateCharts() {
  const positivePercentage = calculatePercentage("positive");
  const negativePercentage = calculatePercentage("negative");
  const neutralPercentage = calculatePercentage("neutral");

  const chartTitle = document.getElementById("chartTitle");
  const sentimentTitle = document.getElementById("sentimentTitle");

  chartTitle.innerText = `Showing ${activeCurrency} Prices and Predictions`;
  sentimentTitle.innerText = `Showing Sentiments for ${activeCurrency} `;

  if (currencyData[activeCurrency]) {
    updateTimeseriesChart();
    updateSentimentChart(
      positivePercentage,
      negativePercentage,
      neutralPercentage
    );
  }
}

function calculatePercentage(sentiment) {
  if (currencyData[activeCurrency]?.sentiment) {
    const totalSentimentCount = currencyData[activeCurrency].sentiment.y.length;
    let sentimentCount;

    if (sentiment === "positive") {
      sentimentCount = currencyData[activeCurrency].sentiment.y.filter(
        (item) => item > 0
      ).length;
    } else if (sentiment === "negative") {
      sentimentCount = currencyData[activeCurrency].sentiment.y.filter(
        (item) => item < 0
      ).length;
    } else {
      const positiveCount = currencyData[activeCurrency].sentiment.y.filter(
        (item) => item > 0
      ).length;
      const negativeCount = currencyData[activeCurrency].sentiment.y.filter(
        (item) => item < 0
      ).length;
      sentimentCount = totalSentimentCount - positiveCount - negativeCount;
    }

    return (sentimentCount / totalSentimentCount) * 100;
  }
  return 0;
}

function updateTimeseriesChart() {
  const timeseriesDiv = document.getElementById("timeseries");

  timeseriesDiv.innerHTML = ""; // Clear existing chart

  const timeseriesPlot = document.createElement("div");
  timeseriesPlot.id = "timeseriesPlot";
  timeseriesDiv.appendChild(timeseriesPlot);

  Plotly.newPlot(
    timeseriesPlot,
    [
      {
        x: currencyData[activeCurrency].actual?.x.map((item) => new Date(item)),
        y: currencyData[activeCurrency].actual?.y,
        mode: "line",
        type: "scatter",
        marker: { color: "black" },
        name: "Prices",
      },
      {
        x: currencyData[activeCurrency].predictions?.x.map(
          (item) => new Date(item)
        ),
        y: currencyData[activeCurrency].predictions?.y,
        mode: "line",
        name: "Future Prices",
        marker: { color: "green" },
        type: "scatter",
      },
    ],
    {
      width: 1000,
      height: 700,
      title: `${activeCurrency}`,
      xaxis: {
        title: "Time",
      },
      yaxis: {
        title: "Price Range",
      },
    }
  );
}

function updateSentimentChart(
  positivePercentage,
  negativePercentage,
  neutralPercentage
) {
  const sentimentChartDiv = document.getElementById("sentimentChart");
  sentimentChartDiv.innerHTML = "";

  Plotly.newPlot(
    sentimentChartDiv,
    [
      {
        values: [positivePercentage, negativePercentage, neutralPercentage],
        labels: ["Positive", "Negative", "Neutral"],
        type: "pie",
        marker: {
          colors: ["Blue", "purple", "gray"], // Specify custom colors here
        },
      },
    ],
    {
      width: 1000,
      height: 500,
      title: `${activeCurrency} Sentiments Pie Chart`,
    }
  );
}

// WebSocket setup
connection = new WebSocket("wss://zkgfib12c5.execute-api.us-east-1.amazonaws.com/production");
connection.onopen = function (event) {
  sendMessage(activeCurrency, connection);
};
connection.onmessage = function (msg) {
  const data = JSON.parse(msg.data);

  currencyData = data;
  updateCharts();
};

function fetchWsData(currency) {
  if (currency) {
    activeCurrency = currency;
    sendMessage(activeCurrency, connection);
  }
}
