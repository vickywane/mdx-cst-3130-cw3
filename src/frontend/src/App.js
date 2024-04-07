import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

const SOCKET_ENDPOINT = process.env?.REACT_APP_WEBSOCKET_ENDPOINT;

if (!SOCKET_ENDPOINT) {
  console.error("SOCKET_ENDPOINT variable is undefined!");
}

function App() {
  const [fxData, setFxData] = useState(null);
  let connection = new WebSocket(SOCKET_ENDPOINT);

  connection.onopen = function (event) {
    console.log("ON OPEN EVENT", event);
    sendMessage(event);
  };

  connection.onmessage = function (msg) {
    const data = JSON.parse(msg.data);

    console.log(data);

    if (data?.message === "Internal server error") {
      console.log("error =>", data);

      return;
    }

    setFxData(data);
  };

  function sendMessage(currency) {
    connection.send(
      JSON.stringify({
        action: "retrieveFxPlotPoints",
        data: currency
      })
    );
  }

  connection.onerror = function (error) {
    console.log("SOCKET ERROR:", error);
  };

  return (
    <div className="App">
      {/* <header className="App-header"></header> */}

      <h1> VICTORY MDX WEBSOCKET APP </h1>

      {JSON.stringify(fxData)}
    </div>
  );
}

export default App;
