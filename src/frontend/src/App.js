import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const SOCKET_ENDPOINT = process.env?.REACT_APP_WEBSOCKET_ENDPOINT;

if (!SOCKET_ENDPOINT) {
  console.error("SOCKET_ENDPOINT variable is undefined!");
}

function App() {
  const [fxData, setFxData] = useState(null);
  const [activeCurrency, setActiveCurrency] = useState("EUR");
  const [currencyData, setCurrencyData] = useState({});

  useEffect(() => {
    let connection = new WebSocket(SOCKET_ENDPOINT);

    connection.onopen = function (event) {
      console.log("ON OPEN EVENT", event);
      sendMessage(event);
    };

    connection.onmessage = function (msg) {
      // const data = JSON.parse(msg.data);
      const data = msg.data;

      if (data) {
        if (data?.message === "Internal server error") {
          console.log("error =>", data);

          return;
        }

        // console.log(, typeof data);

        const parsedCurrencyData = JSON.parse(data);

        // TODO: correct this conditional
        if (parsedCurrencyData[activeCurrency]) {
          setCurrencyData(parsedCurrencyData);
        }
      }
    };

    function sendMessage(currency) {
      connection.send(
        JSON.stringify({
          action: "retrieveFxPlotPoints",
          data: currency,
        })
      );
    }

    connection.onerror = function (error) {
      console.log("SOCKET ERROR:", error);
    };
  }, [activeCurrency]);

  let positivePercentage = 0;
  let negativePercentage = 0;
  let neutralPercentage = 0;

  if (currencyData[activeCurrency] && currencyData[activeCurrency]?.sentiment) {
    console.log("STATE VALUES =>", currencyData[activeCurrency]);

    const totalSentimentCount =
      activeCurrency[activeCurrency].sentiment.y.length;
    const positiveCount = activeCurrency[activeCurrency].sentiment.y.filter(
      (item) => item > 0
    ).length;
    const negativeCount = activeCurrency[activeCurrency].sentiment.y.filter(
      (item) => item < 0
    ).length;
    const neutralCount = totalSentimentCount - positiveCount - negativeCount;

    positivePercentage = (positiveCount / totalSentimentCount) * 100;
    negativePercentage = (negativeCount / totalSentimentCount) * 100;
    neutralPercentage = (neutralCount / totalSentimentCount) * 100;
  }

  console.log("COMPONENT STATE =>", activeCurrency, currencyData);

  return (
    <div className="App">
      {/* <header className="App-header"></header> */}

      <h1> VICTORY MDX WEBSOCKET APP </h1>

      {JSON.stringify(currencyData)}

      <div className="sentiment">
        <h1>Sentimental Analysis of {activeCurrency} over time</h1>

        <Plot
          data={[
            {
              values: [
                positivePercentage,
                negativePercentage,
                neutralPercentage,
              ],
              labels: ["Positive", "Negative", "Neutral"],
              type: "pie",
            },
          ]}
          layout={{
            width: 1000,
            height: 500,
            title: `${activeCurrency} Sentiment Analysis`,
          }}
        />
      </div>
    </div>
  );
}

export default App;
