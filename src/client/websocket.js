document.addEventListener("DOMContentLoaded", function () {
  let activeCoin = "GBP"; // Initial active coin
  let coinData = {}; // Placeholder for coin data
  let connection = null; // Placeholder for WebSocket connection

  function sendMessage(coin, ws) {
    let msgObject = {
      action: "retrieveFxPlotPoints",
      data: coin,
    };
    ws.send(JSON.stringify(msgObject));
  }

  function updateCharts() {
    const positivePercentage = calculatePercentage("positive");
    const negativePercentage = calculatePercentage("negative");
    const neutralPercentage = calculatePercentage("neutral");

    const chartTitle = document.getElementById("chartTitle");
    const sentimentTitle = document.getElementById("sentimentTitle");

    chartTitle.innerText = `Showing ${activeCoin} Prices and Predictions`;
    sentimentTitle.innerText = `Showing Sentiment  of ${activeCoin} `;

    if (coinData[activeCoin]) {
      updateTimeseriesChart();
      updateSentimentChart(
        positivePercentage,
        negativePercentage,
        neutralPercentage
      );
    }
  }

  function calculatePercentage(sentiment) {
    if (coinData[activeCoin]?.sentiment) {
      const totalSentimentCount = coinData[activeCoin].sentiment.y.length;
      let sentimentCount;

      if (sentiment === "positive") {
        sentimentCount = coinData[activeCoin].sentiment.y.filter(
          (item) => item > 0
        ).length;
      } else if (sentiment === "negative") {
        sentimentCount = coinData[activeCoin].sentiment.y.filter(
          (item) => item < 0
        ).length;
      } else {
        const positiveCount = coinData[activeCoin].sentiment.y.filter(
          (item) => item > 0
        ).length;
        const negativeCount = coinData[activeCoin].sentiment.y.filter(
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

    console.log(coinData[activeCoin]);
    Plotly.newPlot(
      timeseriesPlot,
      [
        {
          x: coinData[activeCoin].actual?.x.map((item) => new Date(item)),
          y: coinData[activeCoin].actual?.y,
          mode: "line",
          type: "scatter",
          marker: { color: "black" },
          name: "Prices",
        },
        {
          x: coinData[activeCoin].predictions?.x.map((item) => new Date(item)),
          y: coinData[activeCoin].predictions?.y,
          mode: "line",
          name: "Future Prices",
          marker: { color: "green" },
          type: "scatter",
        },
      ],
      {
        width: 1000,
        height: 700,
        title: `${activeCoin}`,
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

    console.log("PIE CHART", positivePercentage, negativePercentage, neutralPercentage)

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
        title: `${activeCoin} Sentiments Pie Chart`,
      }
    );
  }

  // WebSocket setup
  connection = new WebSocket("wss://zkgfib12c5.execute-api.us-east-1.amazonaws.com/production");
  connection.onopen = function (event) {
    sendMessage(activeCoin, connection);
  };
  connection.onmessage = function (msg) {
    const data = JSON.parse(msg.data);

    console.log("INCOMING DATA =>", data)
    
    coinData = data;
    updateCharts();
  };

  // Button Controls
  const cryptoBtns = document.getElementById("cryptoBtns");
  cryptoBtns.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
      activeCoin = event.target.id;
      sendMessage(activeCoin, connection);
    }
  });
});
